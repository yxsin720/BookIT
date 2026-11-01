from dados_exemplo import PEDIDO, RECURSOS, RESERVAS
from primeiro_livre import primeiro_livre
from recomendador import recomendar


def test_devolve_a_primeira_hora_livre():
    primeira = primeiro_livre(PEDIDO, RECURSOS, RESERVAS)[0]
    assert primeira["recurso_nome"] == "Sala 1.01"
    assert primeira["inicio"] == "2026-11-03T08:00:00"   # às 8h, apesar de o utilizador querer à tarde


def test_tambem_respeita_as_regras_obrigatorias():
    salas = {o["recurso_id"] for o in primeiro_livre(PEDIDO, RECURSOS, RESERVAS, k=50)}
    assert 3 not in salas and 5 not in salas   # sem projetor / avariada


def test_a_ia_e_melhor_que_o_primeiro_livre():
    ia = recomendar(PEDIDO, RECURSOS, RESERVAS)[0]["custo"]
    simples = primeiro_livre(PEDIDO, RECURSOS, RESERVAS)[0]["custo"]
    assert ia < simples