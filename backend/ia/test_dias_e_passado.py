"""Regras novas: a sala tem de estar aberta nesse dia da semana, e não se sugerem horas que já passaram."""
from datetime import datetime

from dados_exemplo import RECURSOS
from recomendador import recomendar

# 7/11/2026 é sábado, 9/11/2026 é segunda
PEDIDO = {"tipo": "sala", "n_pessoas": 4, "duracao_min": 60, "data_inicio": "2026-11-07",
          "data_fim": "2026-11-09", "periodo": "qualquer", "edificio": "", "equipamentos": []}

SO_DIAS_UTEIS = [{**r, "dias": [1, 2, 3, 4, 5]} for r in RECURSOS]


def test_sem_dias_abre_todos_os_dias():
    opcoes = recomendar(PEDIDO, RECURSOS, [])
    assert any(o["inicio"].startswith("2026-11-07") for o in opcoes)


def test_nao_sugere_fim_de_semana_se_a_sala_fecha():
    opcoes = recomendar(PEDIDO, SO_DIAS_UTEIS, [])
    assert opcoes
    assert all(datetime.fromisoformat(o["inicio"]).isoweekday() <= 5 for o in opcoes)


def test_nao_sugere_horas_que_ja_passaram():
    pedido = {**PEDIDO, "data_inicio": "2026-11-09", "nao_antes": "2026-11-09T16:07"}
    opcoes = recomendar(pedido, RECURSOS, [])
    assert opcoes
    assert all(o["inicio"] >= "2026-11-09T16:07" for o in opcoes)
