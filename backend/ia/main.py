import os

from fastapi import FastAPI
from pydantic import BaseModel

from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from planeador import planear_sessoes
from primeiro_livre import primeiro_livre
from reatribuidor import reatribuir
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
    id: int | None = None
    recurso_id: int
    inicio: str
    fim: str
    n_pessoas: int = 1
    equipamentos: list[str] = []


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

    model_config = {"json_schema_extra": {"examples": [
        {"pedido": PEDIDO, "recursos": RECURSOS, "reservas": RESERVAS}
    ]}}


class PedidoReatribuicao(BaseModel):
    indisponiveis: list[int]
    recursos: list[Recurso]
    reservas: list[Reserva]

    model_config = {"json_schema_extra": {"examples": [
        {"indisponiveis": [1], "recursos": RECURSOS, "reservas": [
            {"id": 101, "recurso_id": 1, "inicio": "2026-11-03T14:00", "fim": "2026-11-03T16:00",
             "n_pessoas": 6, "equipamentos": ["projetor"]},
        ]}
    ]}}


def em_dicionarios(dados):
    """Converte os objetos Pydantic em dicionários normais, que é o que os algoritmos usam."""
    return [d.model_dump() for d in dados]


# ---------- Endpoints ----------

@app.get("/health")
def health():
    return {"estado": "ok", "instancia": INSTANCIA}


@app.post("/recomendar")
def recomendar_endpoint(dados: PedidoRecomendacao):
    """As 5 melhores opções para UMA sessão (US1)."""
    opcoes = recomendar(dados.pedido.model_dump(), em_dicionarios(dados.recursos),
                        em_dicionarios(dados.reservas))
    return {"origem": "ia", "instancia": INSTANCIA, "opcoes": opcoes}


@app.post("/planear")
def planear_endpoint(dados: PedidoRecomendacao):
    """Uma sala e um horário para CADA sessão pedida (US5)."""
    resultado = planear_sessoes(dados.pedido.model_dump(), em_dicionarios(dados.recursos),
                                em_dicionarios(dados.reservas))
    return {"origem": "ia", "instancia": INSTANCIA, **resultado}


@app.post("/reatribuir")
def reatribuir_endpoint(dados: PedidoReatribuicao):
    """Mudar de sala as reservas afetadas por salas indisponíveis (US6)."""
    resultado = reatribuir(dados.indisponiveis, em_dicionarios(dados.recursos),
                           em_dicionarios(dados.reservas))
    return {"instancia": INSTANCIA, **resultado}


@app.post("/primeiro-livre")
def primeiro_livre_endpoint(dados: PedidoRecomendacao):
    """A estratégia simples, sem IA (para comparação)."""
    opcoes = primeiro_livre(dados.pedido.model_dump(), em_dicionarios(dados.recursos),
                            em_dicionarios(dados.reservas))
    return {"origem": "primeiro_livre", "instancia": INSTANCIA, "opcoes": opcoes}