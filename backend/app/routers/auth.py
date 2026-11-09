from fastapi import APIRouter, Depends, HTTPException

from app.database import consultar
from app.schemas.auth import Login
from app.services.seguranca import criar_token, password_certa
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


@router.get("/eu")
def quem_sou_eu(utilizador=Depends(utilizador_atual)):
    """Útil para testar o token."""
    return utilizador
