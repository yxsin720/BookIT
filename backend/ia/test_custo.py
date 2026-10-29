from datetime import datetime

from custo import custo_desperdicio, custo_periodo, custo_total
from dados_exemplo import PEDIDO, RECURSOS, RESERVAS

POR_ID = {r["id"]: r for r in RECURSOS}


def test_dentro_da_tarde_nao_custa_nada():
    inicio, fim = datetime(2026, 11, 4, 14, 0), datetime(2026, 11, 4, 16, 0)
    assert custo_periodo(PEDIDO, inicio, fim) == 0


def test_de_manha_custa_as_horas_fora_da_tarde():
    # das 10h às 12h: faltam 4 horas para começar a tarde (14h)
    inicio, fim = datetime(2026, 11, 4, 10, 0), datetime(2026, 11, 4, 12, 0)
    assert custo_periodo(PEDIDO, inicio, fim) == 4


def test_sala_grande_desperdica_mais():
    assert custo_desperdicio(PEDIDO, POR_ID[2]) == 0.8   # 6 pessoas em 30 lugares
    assert custo_desperdicio(PEDIDO, POR_ID[1]) == 0.25  # 6 pessoas em 8 lugares


def test_a_melhor_opcao_ganha():
    # Sala 1 (edifício A, 8 lugares) à tarde vs. Sala 4 (Biblioteca, 10 lugares) à tarde
    sala1 = custo_total((1, datetime(2026, 11, 4, 14, 0)), PEDIDO, POR_ID, RESERVAS)
    sala4 = custo_total((4, datetime(2026, 11, 4, 14, 0)), PEDIDO, POR_ID, RESERVAS)
    assert sala1 == 0.5   # só o desperdício: 2 x 0,25
    assert sala4 == 2.8   # outro edifício (2) + desperdício (2 x 0,4)
    assert sala1 < sala4