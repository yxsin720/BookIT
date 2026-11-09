from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.database import consultar, engine
from app.schemas.auth import Login, Registo
from app.services.seguranca import criar_token, gerar_hash, password_certa
from app.services.sessao import utilizador_atual

router = APIRouter(prefix="/api", tags=["autenticação"])


@router.post("/login")
def login(dados: Login):
    encontrados = consultar(
        "SELECT id, nome, perfil, password_hash FROM utilizadores "
        "WHERE email = :email AND ativo", email=dados.email)
    # A mesma mensagem para email errado e password errada: não revela quais emails existem
    if not encontrados or not password_certa(dados.password, encontrados[0]["password_hash"]):
        raise HTTPException(401, "Email ou password errados")
    utilizador = encontrados[0]
    return {"token": criar_token(utilizador), "nome": utilizador["nome"],
            "perfil": utilizador["perfil"]}


@router.post("/registo", status_code=201)
def registo(dados: Registo):
    """Cria uma conta nova, sempre com o perfil "utilizador", e já deixa a pessoa com sessão."""
    nome, email = dados.nome.strip(), dados.email.strip().lower()
    if not nome or "@" not in email:
        raise HTTPException(400, "Preencha o nome e um email válido")
    if len(dados.password) < 6:
        raise HTTPException(400, "A palavra-passe deve ter pelo menos 6 caracteres")
    try:
        with engine.begin() as bd:
            utilizador = bd.execute(text("""
                INSERT INTO utilizadores (nome, email, password_hash)
                VALUES (:nome, :email, :hash)
                RETURNING id, nome, perfil
            """), {"nome": nome, "email": email, "hash": gerar_hash(dados.password)}).mappings().one()
    except IntegrityError:
        raise HTTPException(409, "Já existe uma conta com este email")
    return {"token": criar_token(utilizador), "nome": utilizador["nome"],
            "perfil": utilizador["perfil"]}


@router.get("/eu")
def quem_sou_eu(utilizador=Depends(utilizador_atual)):
    """Útil para testar o token."""
    return utilizador
