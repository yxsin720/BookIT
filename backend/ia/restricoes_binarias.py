"""Restrições binárias: regras que ligam DUAS variáveis (duas sessões)."""

from datetime import timedelta
from itertools import combinations


def intervalo(valor, pedido):
    """De um valor (sala, início) tira o início e o fim da sessão."""
    _, inicio = valor
    return inicio, inicio + timedelta(minutes=pedido["duracao_min"])


def sobrepoem(valor_a, valor_b, pedido):
    """Verdade se as duas sessões se sobrepõem no tempo."""
    inicio_a, fim_a = intervalo(valor_a, pedido)
    inicio_b, fim_b = intervalo(valor_b, pedido)
    return inicio_a < fim_b and inicio_b < fim_a


def b1_mesma_sala_sem_choque(valor_a, valor_b, pedido):
    """B1: se for a mesma sala, os horários não se podem sobrepor."""
    mesma_sala = valor_a[0] == valor_b[0]
    return not (mesma_sala and sobrepoem(valor_a, valor_b, pedido))


def b2_mesma_pessoa_sem_choque(valor_a, valor_b, pedido):
    """B2: a mesma pessoa não pode estar em duas sessões ao mesmo tempo."""
    return not sobrepoem(valor_a, valor_b, pedido)


def b3_dias_diferentes(valor_a, valor_b, pedido):
    """B3: as sessões do mesmo pedido ficam em dias diferentes."""
    return valor_a[1].date() != valor_b[1].date()


def compativeis(valor_a, valor_b, pedido):
    """Duas sessões são compatíveis se cumprirem as três restrições binárias."""
    return (b1_mesma_sala_sem_choque(valor_a, valor_b, pedido)
            and b2_mesma_pessoa_sem_choque(valor_a, valor_b, pedido)
            and b3_dias_diferentes(valor_a, valor_b, pedido))


def atribuicao_consistente(atribuicao, pedido):
    """Verifica todos os pares de sessões já atribuídas: {"S1": valor, "S2": valor, ...}."""
    for var_a, var_b in combinations(atribuicao, 2):
        if not compativeis(atribuicao[var_a], atribuicao[var_b], pedido):
            return False
    return True