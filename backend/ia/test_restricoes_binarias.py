from datetime import datetime

from dados_exemplo import PEDIDO
from restricoes_binarias import atribuicao_consistente, compativeis

PEDIDO_3 = {**PEDIDO, "n_sessoes": 3}

SEG_14H_SALA1 = (1, datetime(2026, 11, 3, 14, 0))
SEG_15H_SALA2 = (2, datetime(2026, 11, 3, 15, 0))
SEG_17H_SALA2 = (2, datetime(2026, 11, 3, 17, 0))
TER_14H_SALA1 = (1, datetime(2026, 11, 4, 14, 0))
QUA_14H_SALA1 = (1, datetime(2026, 11, 5, 14, 0))


def test_mesmo_dia_nao_pode():
    # mesmo sem se sobreporem, ficam no mesmo dia (B3)
    assert not compativeis(SEG_14H_SALA1, SEG_17H_SALA2, PEDIDO_3)


def test_sobrepostas_em_salas_diferentes_nao_pode():
    # a mesma pessoa não pode estar em dois sítios (B2)
    assert not compativeis(SEG_14H_SALA1, SEG_15H_SALA2, PEDIDO_3)


def test_dias_diferentes_mesma_sala_e_hora_pode():
    assert compativeis(SEG_14H_SALA1, TER_14H_SALA1, PEDIDO_3)


def test_atribuicao_completa():
    boa = {"S1": SEG_14H_SALA1, "S2": TER_14H_SALA1, "S3": QUA_14H_SALA1}
    ma = {"S1": SEG_14H_SALA1, "S2": SEG_17H_SALA2, "S3": QUA_14H_SALA1}
    assert atribuicao_consistente(boa, PEDIDO_3)
    assert not atribuicao_consistente(ma, PEDIDO_3)