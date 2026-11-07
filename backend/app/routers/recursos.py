from fastapi import APIRouter

from app.services.recursos import carregar_recursos

router = APIRouter(prefix="/api", tags=["recursos"])


@router.get("/recursos")
def listar_recursos():
    return carregar_recursos()
