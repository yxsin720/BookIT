import os

from fastapi import FastAPI
from pydantic import BaseModel

from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from recomendador import recomendar

app = FastAPI(title="BookIT - Serviço de IA")
INSTANCIA = os.environ.get("INSTANCIA", "ia-local")


# ---------- O formato dos dados que a API nos envia ----------

class Recurso(BaseModel):
    id: int
    nome: str
    tipo: str
    capacidade: int
    edificio: str = ""
    equipamentos: list[str] = []
    abertura: str = "08:00"
    fecho: str = "22:00"
    ativo: bool = True


class Reserva(BaseModel):
    recurso_id: int
    inicio: str
    fim: str


class Pedido(BaseModel):
    tipo: str
    n_pessoas: int
    duracao_min: int
    data_inicio: str
    data_fim: str
    periodo: str = "qualquer"
    edificio: str = ""
    equipamentos: list[str] = []
    n_sessoes: int = 1


class PedidoRecomendacao(BaseModel):
    pedido: Pedido
    recursos: list[Recurso]
    reservas: list[Reserva] = []

    # exemplo que aparece já preenchido no /docs
    model_config = {"json_schema_extra": {"examples": [
        {"pedido": PEDIDO, "recursos": RECURSOS, "reservas": RESERVAS}
    ]}}


# ---------- Endpoints ----------

@app.get("/health")
def health():
    return {"estado": "ok", "instancia": INSTANCIA}


@app.post("/recomendar")
def recomendar_endpoint(dados: PedidoRecomendacao):
    opcoes = recomendar(
        dados.pedido.model_dump(),
        [r.model_dump() for r in dados.recursos],
        [r.model_dump() for r in dados.reservas],
    )
    return {"origem": "ia", "instancia": INSTANCIA, "opcoes": opcoes}