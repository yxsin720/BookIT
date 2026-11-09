"""Quem está a fazer o pedido? Lê o token do cabeçalho Authorization."""
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.seguranca import ler_token

esquema = HTTPBearer(auto_error=False)


def utilizador_atual(credenciais: HTTPAuthorizationCredentials = Depends(esquema)):
    """Devolve {"id", "perfil"} do utilizador, ou erro 401 se não houver login válido."""
    if credenciais is None:
        raise HTTPException(401, "Precisa de fazer login")
    try:
        dados = ler_token(credenciais.credentials)
    except jwt.PyJWTError:
        raise HTTPException(401, "Sessão inválida ou expirada")
    return {"id": int(dados["sub"]), "perfil": dados["perfil"]}


def exigir_perfil(*perfis):
    """Uso: Depends(exigir_perfil("gestor", "administrador")). Erro 403 se o perfil não servir."""
    def verificar(utilizador=Depends(utilizador_atual)):
        if utilizador["perfil"] not in perfis:
            raise HTTPException(403, "Sem permissão para esta operação")
        return utilizador
    return verificar
