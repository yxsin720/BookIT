from fastapi import APIRouter

from app.services.recursos import carregar_recursos

router = APIRouter(prefix="/api", tags=["recursos"])


@router.get("/recursos")
def listar_recursos(tipo: str | None = None):
    recursos = carregar_recursos()
    if tipo:
        recursos = [r for r in recursos if r["tipo"] == tipo]
    return recursos
