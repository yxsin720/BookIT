from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from planeador import planear_sessoes


def test_tres_sessoes_em_tres_dias_diferentes():
    pedido = {**PEDIDO, "n_sessoes": 3}
    resultado = planear_sessoes(pedido, RECURSOS, RESERVAS)
    dias = {s["inicio"][:10] for s in resultado["sessoes"]}
    assert len(resultado["sessoes"]) == 3
    assert dias == {"2026-11-03", "2026-11-04", "2026-11-05"}


def test_comeca_pelas_melhores_opcoes():
    pedido = {**PEDIDO, "n_sessoes": 3}
    sessoes = planear_sessoes(pedido, RECURSOS, RESERVAS)["sessoes"]
    assert sessoes[0]["inicio"] == "2026-11-04T14:00:00"   # a melhor de todas
    assert sessoes[1]["inicio"] == "2026-11-05T14:00:00"   # a melhor noutro dia
    assert sessoes[2]["inicio"] == "2026-11-03T16:00:00"   # dia 3, depois da reserva das 14h


def test_impossivel_devolve_vazio():
    # 3 sessões em dias diferentes, mas a janela só tem 2 dias: não há solução
    pedido = {**PEDIDO, "n_sessoes": 3, "n_pessoas": 25, "data_fim": "2026-11-04"}
    resultado = planear_sessoes(pedido, RECURSOS, RESERVAS)
    assert resultado["sessoes"] == []
    assert resultado["nos_explorados"] > 0   # procurou antes de desistir