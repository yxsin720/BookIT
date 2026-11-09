"""Ligação à base de dados PostgreSQL."""
from sqlalchemy import create_engine, text

from app.config import DATABASE_URL

# O SQLAlchemy 2.1 usa por defeito o driver "psycopg" (versão 3).
# Nós instalámos o "psycopg2", por isso dizemos-lhe explicitamente qual usar.
URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# pool_pre_ping: testa a ligação antes de a usar (útil se a BD reiniciou)
engine = create_engine(URL, pool_pre_ping=True, connect_args={"connect_timeout": 3})


def consultar(sql, **parametros):
    """Corre um SELECT e devolve uma lista de dicionários."""
    with engine.connect() as ligacao:
        resultado = ligacao.execute(text(sql), parametros)
        return [dict(linha._mapping) for linha in resultado]
