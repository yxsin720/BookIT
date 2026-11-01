from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from planeador import planear_sessoes

POSSIVEL = {**PEDIDO, "n_sessoes": 3}
IMPOSSIVEL = {**PEDIDO, "n_sessoes": 3, "n_pessoas": 25, "data_fim": "2026-11-04"}


def test_encontra_a_mesma_solucao_que_o_simples():
    simples = planear_sessoes(POSSIVEL, RECURSOS, RESERVAS, metodo="simples")
    fc = planear_sessoes(POSSIVEL, RECURSOS, RESERVAS, metodo="fc")
    assert fc["sessoes"] == simples["sessoes"]


def test_desiste_muito_mais_depressa_quando_e_impossivel():
    simples = planear_sessoes(IMPOSSIVEL, RECURSOS, RESERVAS, metodo="simples")
    fc = planear_sessoes(IMPOSSIVEL, RECURSOS, RESERVAS, metodo="fc")
    assert simples["sessoes"] == fc["sessoes"] == []
    assert fc["nos_explorados"] * 10 < simples["nos_explorados"]