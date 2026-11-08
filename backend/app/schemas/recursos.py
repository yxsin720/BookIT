from pydantic import BaseModel


class Indisponibilidade(BaseModel):
    """Período em que a sala não pode ser usada (hora de Lisboa)."""
    inicio: str  # ex.: "2026-11-10T08:00:00"
    fim: str
    motivo: str = ""