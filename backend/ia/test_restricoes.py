from datetime import datetime

from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from modelo import criar_dominios, criar_variaveis
from restricoes import aplicar_restricoes_unarias


def dominio_filtrado():
    variaveis = criar_variaveis(PEDIDO)
    dominios = criar_dominios(variaveis, PEDIDO, RECURSOS)
    return aplicar_restricoes_unarias(dominios, PEDIDO, RECURSOS, RESERVAS)["S1"]


def test_o_dominio_encolhe():
    # de 375 valores possíveis ficam 187
    assert len(dominio_filtrado()) == 187


def test_sala_sem_projetor_e_sala_avariada_saem():
    salas = {sala for sala, _ in dominio_filtrado()}
    assert salas == {1, 2, 4}  # a 3 não tem projetor, a 5 está avariada


def test_horario_ocupado_sai():
    # a Sala 1 está ocupada a 3 de novembro das 14h às 16h
    assert (1, datetime(2026, 11, 3, 14, 0)) not in dominio_filtrado()
    assert (1, datetime(2026, 11, 3, 16, 0)) in dominio_filtrado()


def test_respeita_o_fecho_da_sala():
    # a Sala 1 fecha às 20h: uma reserva de 2h não pode começar às 19h
    assert (1, datetime(2026, 11, 4, 19, 0)) not in dominio_filtrado()
    # a Sala 4 fecha às 22h, por isso às 19h já pode
    assert (4, datetime(2026, 11, 4, 19, 0)) in dominio_filtrado()