"""Passwords (Argon2) e tokens de sessão (JWT)."""
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.config import JWT_SECRET

hasher = PasswordHash.recommended()  # Argon2


def gerar_hash(password):
    """Transforma a password num hash. Na BD nunca fica a password em texto."""
    return hasher.hash(password)


def password_certa(password, hash_guardado):
    return hasher.verify(password, hash_guardado)


def criar_token(utilizador):
    """Token JWT válido durante 1 hora, com o id e o perfil do utilizador."""
    dados = {
        "sub": str(utilizador["id"]),
        "perfil": utilizador["perfil"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    return jwt.encode(dados, JWT_SECRET, algorithm="HS256")


def ler_token(token):
    """Devolve os dados do token, ou lança erro se for inválido ou tiver expirado."""
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
