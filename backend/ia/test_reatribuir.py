from dados_exemplo import RECURSOS
from reatribuidor import reatribuir


def reserva(rid, sala, inicio, fim, pessoas, equipamentos=()):
    return {"id": rid, "recurso_id": sala, "inicio": inicio, "fim": fim,
            "n_pessoas": pessoas, "equipamentos": list(equipamentos)}


def test_sala_avariada_muda_para_outra_compativel():
    reservas = [reserva(101, 1, "2026-11-03T14:00", "2026-11-03T16:00", 6, ["projetor"])]
    resultado = reatribuir([1], RECURSOS, reservas)
    assert resultado["sem_alternativa"] == []
    nova = resultado["reatribuidas"][0]
    assert nova["recurso_id"] != 1                 # já não é a sala avariada
    assert nova["inicio"] == "2026-11-03T14:00:00"  # à mesma hora


def test_fica_no_mesmo_edificio_se_puder():
    # a Sala 1.01 (edifício A) avaria: a 1.02 também é no A e tem projetor
    reservas = [reserva(101, 1, "2026-11-03T14:00", "2026-11-03T16:00", 6, ["projetor"])]
    nova = reatribuir([1], RECURSOS, reservas)["reatribuidas"][0]
    assert nova["recurso_nome"] == "Sala 1.02"


def test_duas_reservas_ao_mesmo_tempo_nao_vao_para_a_mesma_sala():
    # falha de luz no edifício A: as salas 1 e 2 ficam indisponíveis
    reservas = [
        reserva(101, 1, "2026-11-03T14:00", "2026-11-03T16:00", 6, ["projetor"]),
        reserva(102, 2, "2026-11-03T15:00", "2026-11-03T17:00", 5),
    ]
    resultado = reatribuir([1, 2], RECURSOS, reservas)
    salas = [r["recurso_id"] for r in resultado["reatribuidas"]]
    assert len(salas) == 2
    assert len(set(salas)) == 2   # B1: ficaram em salas diferentes


def test_quando_nao_ha_sala_para_todas_deixa_de_fora_o_minimo():
    # as duas precisam de projetor e só a Sala 0.10 serve: cabe uma, a outra fica de fora
    reservas = [
        reserva(101, 1, "2026-11-03T14:00", "2026-11-03T16:00", 6, ["projetor"]),
        reserva(102, 2, "2026-11-03T15:00", "2026-11-03T17:00", 8, ["projetor"]),
    ]
    resultado = reatribuir([1, 2], RECURSOS, reservas)
    assert len(resultado["reatribuidas"]) == 1
    assert len(resultado["sem_alternativa"]) == 1