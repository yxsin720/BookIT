from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.database import engine
from app.schemas.recursos import Indisponibilidade
from app.services.ia_cliente import pedir_ia
from app.services.recursos import carregar_recursos, carregar_reservas
from app.services.sessao import exigir_perfil

router = APIRouter(prefix="/api", tags=["recursos"])


@router.get("/recursos")
def listar_recursos():
    return carregar_recursos()


@router.put("/recursos/{recurso_id}/indisponivel")
def marcar_indisponivel(recurso_id: int, dados: Indisponibilidade,
                        gestor=Depends(exigir_perfil("gestor", "administrador"))):
    try:
        inicio = datetime.fromisoformat(dados.inicio)
        fim = datetime.fromisoformat(dados.fim)
    except ValueError:
        raise HTTPException(400, "Datas inválidas, use o formato 2026-11-10T08:00:00")
    if inicio >= fim:
        raise HTTPException(400, "O início tem de ser anterior ao fim")

    recursos = carregar_recursos()
    if recurso_id not in [r["id"] for r in recursos]:
        raise HTTPException(404, "Recurso não encontrado")

    # Reservas desses dias. Da sala em causa, só as que tocam no período indisponível
    # (a IA muda TODAS as reservas da sala que lhe enviarmos).
    todas = carregar_reservas(inicio.date().isoformat(), fim.date().isoformat())
    reservas = [r for r in todas
                if r["recurso_id"] != recurso_id
                or (datetime.fromisoformat(r["inicio"]) < fim
                    and inicio < datetime.fromisoformat(r["fim"]))]
    afetadas = [r["id"] for r in reservas if r["recurso_id"] == recurso_id]

    resultado = {"reatribuidas": [], "sem_alternativa": []}
    ia_disponivel = True
    if afetadas:
        resposta = pedir_ia("/reatribuir", {"indisponiveis": [recurso_id],
                                            "recursos": recursos, "reservas": reservas})
        if resposta is None:
            ia_disponivel = False  # a sala fica marcada, mas as reservas ficam por tratar
        else:
            resultado = resposta

    try:
        with engine.begin() as bd:  # uma transação: ou grava tudo, ou nada
            indisponibilidade_id = bd.execute(text("""
                INSERT INTO indisponibilidades (recurso_id, periodo, motivo, criado_por)
                VALUES (:rid,
                        tstzrange(CAST(:ini AS timestamp) AT TIME ZONE 'Europe/Lisbon',
                                  CAST(:fim AS timestamp) AT TIME ZONE 'Europe/Lisbon', '[)'),
                        :motivo, :uid)
                RETURNING id
            """), {"rid": recurso_id, "ini": inicio.isoformat(), "fim": fim.isoformat(),
                   "motivo": dados.motivo, "uid": gestor["id"]}).scalar()

            for r in resultado["reatribuidas"]:
                # Reserva nova: mesma hora e mesmo utilizador, noutra sala
                nova = bd.execute(text("""
                    INSERT INTO reservas (utilizador_id, recurso_id, periodo, n_pessoas, origem)
                    SELECT utilizador_id, :novo, periodo, n_pessoas, origem
                    FROM reservas WHERE id = :antiga AND estado = 'confirmada'
                    RETURNING id
                """), {"novo": r["recurso_id"], "antiga": r["reserva_id"]}).scalar()
                if nova is None:
                    continue  # entretanto foi cancelada
                bd.execute(text("""
                    UPDATE reservas SET estado = 'cancelada', cancelado_em = now()
                    WHERE id = :id
                """), {"id": r["reserva_id"]})
                bd.execute(text("""
                    INSERT INTO reatribuicoes (reserva_antiga_id, reserva_nova_id,
                                               indisponibilidade_id, feita_por)
                    VALUES (:antiga, :nova, :indisp, :uid)
                """), {"antiga": r["reserva_id"], "nova": nova,
                       "indisp": indisponibilidade_id, "uid": gestor["id"]})

            for reserva_id in resultado["sem_alternativa"]:
                # Sem sala possível: cancela e regista sem reserva nova
                bd.execute(text("""
                    UPDATE reservas SET estado = 'cancelada', cancelado_em = now()
                    WHERE id = :id AND estado = 'confirmada'
                """), {"id": reserva_id})
                bd.execute(text("""
                    INSERT INTO reatribuicoes (reserva_antiga_id, indisponibilidade_id, feita_por)
                    VALUES (:antiga, :indisp, :uid)
                """), {"antiga": reserva_id, "indisp": indisponibilidade_id,
                       "uid": gestor["id"]})
    except DBAPIError as erro:
        codigo = getattr(erro.orig, "pgcode", None)
        if codigo == "23P01":  # outra reserva ocupou a sala entretanto
            raise HTTPException(409, "Conflito ao reatribuir, tente de novo")
        if codigo == "P0001":
            raise HTTPException(400, str(erro.orig).split("\n")[0])
        raise

    return {"indisponibilidade_id": indisponibilidade_id,
            "reatribuidas": resultado["reatribuidas"],
            "sem_alternativa": resultado["sem_alternativa"],
            "ia_disponivel": ia_disponivel,
            "por_tratar": [] if ia_disponivel else afetadas}