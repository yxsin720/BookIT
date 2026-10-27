import os

from fastapi import FastAPI

app = FastAPI(title="BookIT - Serviço de IA")
INSTANCIA = os.environ.get("INSTANCIA", "ia-local")


@app.get("/health")
def health():
    return {"estado": "ok", "instancia": INSTANCIA}