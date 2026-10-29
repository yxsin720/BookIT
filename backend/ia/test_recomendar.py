from fastapi.testclient import TestClient

from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from main import app
from recomendador import recomendar

cliente = TestClient(app)


def test_devolve_cinco_opcoes_ordenadas():
    opcoes = recomendar(PEDIDO, RECURSOS, RESERVAS)
    assert len(opcoes) == 5
    custos = [o["custo"] for o in opcoes]
    assert custos == sorted(custos)


def test_a_primeira_e_a_sala_1_a_tarde():
    melhor = recomendar(PEDIDO, RECURSOS, RESERVAS)[0]
    assert melhor["recurso_nome"] == "Sala 1.01"
    assert melhor["inicio"] == "2026-11-04T14:00:00"
    assert melhor["custo"] == 0.5


def test_no_maximo_uma_opcao_por_sala_e_dia():
    opcoes = recomendar(PEDIDO, RECURSOS, RESERVAS)
    chaves = [(o["recurso_id"], o["inicio"][:10]) for o in opcoes]
    assert len(chaves) == len(set(chaves))


def test_endpoint_recomendar():
    resposta = cliente.post("/recomendar", json={
        "pedido": PEDIDO, "recursos": RECURSOS, "reservas": RESERVAS,
    })
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["origem"] == "ia"
    assert len(corpo["opcoes"]) == 5