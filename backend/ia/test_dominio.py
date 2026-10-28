from datetime import datetime

from dados_exemplo import PEDIDO, RECURSOS
from modelo import criar_dominio, criar_dominios, criar_variaveis


def test_tamanho_do_dominio():
    # 5 salas x 3 dias x 25 horas de início (08:00 a 20:00, de 30 em 30 min)
    assert len(criar_dominio(PEDIDO, RECURSOS)) == 5 * 3 * 25


def test_primeiro_e_ultimo_valor():
    dominio = criar_dominio(PEDIDO, RECURSOS)
    assert dominio[0] == (1, datetime(2026, 11, 3, 8, 0))
    assert dominio[-1] == (5, datetime(2026, 11, 5, 20, 0))


def test_cada_variavel_tem_o_seu_dominio():
    variaveis = criar_variaveis({**PEDIDO, "n_sessoes": 2})
    dominios = criar_dominios(variaveis, PEDIDO, RECURSOS)
    assert list(dominios.keys()) == ["S1", "S2"]
    assert len(dominios["S1"]) == len(dominios["S2"]) == 375