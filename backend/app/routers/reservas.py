from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.database import consultar, engine
from app.schemas.reservas import NovaReserva
from app.services.sessao import utilizador_atual

router = APIRouter(prefix="/api", tags=["reservas"])

SELECT_RESERVA = """
    SELECT r.id, r.recurso_id, s.nome AS recurso_nome, t.nome AS tipo, r.n_pessoas, r.estado,
           to_char(lower(r.periodo) AT TIME ZONE 'Europe/Lisbon', 'YYYY-MM-DD"T"HH24:MI') AS inicio,
           to_char(upper(r.periodo) AT TIME ZONE 'Europe/Lisbon', 'YYYY-MM-DD"T"HH24:MI') AS fim
    FROM reservas r
    JOIN recursos s ON s.id = r.recurso_id
    JOIN tipos_recurso t ON t.id = s.tipo_id
"""


@router.post("/reservas", status_code=201)
def criar_reserva(dados: NovaReserva, response: Response,
                  idempotency_key: str = Header(),
                  utilizador=Depends(utilizador_atual)):
    try:
        with engine.begin() as bd:  # uma transação: ou grava tudo, ou nada
            reserva_id = bd.execute(text("""
                INSERT INTO reservas (utilizador_id, recurso_id, periodo, n_pessoas,
                                      origem, chave_idempotencia)
                VALUES (:uid, :rid,
                        tstzrange(CAST(:ini AS timestamp) AT TIME ZONE 'Europe/Lisbon',
                                  CAST(:fim AS timestamp) AT TIME ZONE 'Europe/Lisbon', '[)'),
                        :pessoas, CAST(:origem AS origem_reserva), :chave)
                RETURNING id
            """), {"uid": utilizador["id"], "rid": dados.recurso_id, "ini": dados.inicio,
                   "fim": dados.fim, "pessoas": dados.n_pessoas, "origem": dados.origem,
                   "chave": idempotency_key}).scalar()
    except DBAPIError as erro:
        codigo = getattr(erro.orig, "pgcode", None)
        if codigo in ("23505", "23P01"):  # chave repetida ou sala ocupada
            # Se já existe uma reserva com esta chave, é o MESMO pedido repetido
            # (por exemplo, depois de uma falha de rede): devolve-a, sem duplicar.
            existente = consultar(SELECT_RESERVA + " WHERE r.chave_idempotencia = :c",
                                  c=idempotency_key)
            if existente:
                response.status_code = 200
                return existente[0]
            raise HTTPException(409, "A sala já está reservada nesse horário")
        if codigo == "P0001":  # trigger da BD: sala inativa, indisponível ou sem capacidade
            raise HTTPException(400, str(erro.orig).split("\n")[0])
        raise
    return consultar(SELECT_RESERVA + " WHERE r.id = :id", id=reserva_id)[0]


@router.get("/reservas/minhas")
def minhas_reservas(utilizador=Depends(utilizador_atual)):
    return consultar(SELECT_RESERVA + " WHERE r.utilizador_id = :uid ORDER BY lower(r.periodo)",
                     uid=utilizador["id"])


@router.delete("/reservas/{reserva_id}")
def cancelar_reserva(reserva_id: int, utilizador=Depends(utilizador_atual)):
    with engine.begin() as bd:
        alterada = bd.execute(text("""
            UPDATE reservas SET estado = 'cancelada', cancelado_em = now()
            WHERE id = :id AND estado = 'confirmada'
              AND (utilizador_id = :uid OR :perfil = 'administrador')
            RETURNING id
        """), {"id": reserva_id, "uid": utilizador["id"],
               "perfil": utilizador["perfil"]}).scalar()
    if alterada is None:
        raise HTTPException(404, "Reserva não encontrada ou não é sua")
    return consultar(SELECT_RESERVA + " WHERE r.id = :id", id=reserva_id)[0]