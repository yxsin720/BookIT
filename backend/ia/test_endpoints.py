from fastapi.testclient import TestClient

from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from main import app

cliente = TestClient(app)
CORPO = {"pedido": PEDIDO, "recursos": RECURSOS, "reservas": RESERVAS}


def test_planear_tres_sessoes():
    corpo = {**CORPO, "pedido": {**PEDIDO, "n_sessoes": 3}}
    resposta = cliente.post("/planear", json=corpo)
    assert resposta.status_code == 200
    assert len(resposta.json()["sessoes"]) == 3


def test_reatribuir():
    resposta = cliente.post("/reatribuir", json={
        "indisponiveis": [1], "recursos": RECURSOS,
        "reservas": [{"id": 101, "recurso_id": 1, "inicio": "2026-11-03T14:00",
                      "fim": "2026-11-03T16:00", "n_pessoas": 6, "equipamentos": ["projetor"]}],
    })
    assert resposta.status_code == 200
    assert resposta.json()["reatribuidas"][0]["recurso_nome"] == "Sala 1.02"


def test_primeiro_livre():
    resposta = cliente.post("/primeiro-livre", json=CORPO)
    assert resposta.status_code == 200
    assert resposta.json()["origem"] == "primeiro_livre"


def test_pedido_mal_formado_da_erro_422():
    resposta = cliente.post("/recomendar", json={"pedido": {"tipo": "sala"}})
    assert resposta.status_code == 422