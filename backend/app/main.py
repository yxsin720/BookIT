from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from app.config import INSTANCIA
from app.database import consultar
from app.routers import recursos

app = FastAPI(title="BookIT - API de reservas")

# Deixa o frontend (npm run dev, porta 5173) falar com a API durante o desenvolvimento
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(recursos.router)


@app.exception_handler(OperationalError)
def base_de_dados_em_baixo(pedido, erro):
    """Se a base de dados não responder, devolve 503 em vez de rebentar."""
    return JSONResponse(status_code=503,
                        content={"detail": "Base de dados indisponível, tente de novo"})


@app.get("/api/health")
def health():
    return {"estado": "ok", "instancia": INSTANCIA}


@app.get("/api/health/bd")
def health_bd():
    """Confirma que a API consegue falar com a base de dados."""
    tabelas = consultar("SELECT count(*) AS n FROM information_schema.tables "
                        "WHERE table_schema = 'public'")
    return {"base_de_dados": "ok", "tabelas": tabelas[0]["n"]}