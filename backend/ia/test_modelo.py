from dados_exemplo import PEDIDO
from modelo import criar_variaveis


def test_uma_sessao_da_uma_variavel():
    assert criar_variaveis(PEDIDO) == ["S1"]


def test_tres_sessoes_dao_tres_variaveis():
    pedido = {**PEDIDO, "n_sessoes": 3}
    assert criar_variaveis(pedido) == ["S1", "S2", "S3"]