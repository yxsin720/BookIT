"""Reatribuir reservas quando uma ou mais salas ficam indisponíveis (US6)."""

from datetime import datetime
from itertools import combinations

from custo import custo_total
from heuristicas import backtracking_fc
from restricoes import valor_valido


def nao_chocam(valor_a, valor_b, _pedido=None):
    """B1 para reservas de pessoas diferentes: na mesma sala, os horários não se sobrepõem.
    Aqui cada valor é (sala, início, fim), porque cada reserva tem a sua duração."""
    sala_a, inicio_a, fim_a = valor_a
    sala_b, inicio_b, fim_b = valor_b
    return not (sala_a == sala_b and inicio_a < fim_b and inicio_b < fim_a)


def pedido_da_reserva(reserva, recurso_original):
    """Transforma uma reserva afetada num "pedido", para reutilizar restrições e custo."""
    inicio = datetime.fromisoformat(reserva["inicio"])
    fim = datetime.fromisoformat(reserva["fim"])
    return {
        "tipo": recurso_original["tipo"],
        "n_pessoas": reserva["n_pessoas"],
        "duracao_min": int((fim - inicio).total_seconds() // 60),
        "equipamentos": reserva.get("equipamentos", []),
        "edificio": recurso_original["edificio"],  # de preferência no mesmo edifício
        "periodo": "qualquer",                     # a hora não muda
    }


def reatribuir(indisponiveis, recursos, reservas):
    """indisponiveis: ids das salas que deixaram de estar disponíveis.
    Cada reserva afetada é uma variável; o domínio são as outras salas, À MESMA HORA."""
    recursos = [{**r, "ativo": r["ativo"] and r["id"] not in indisponiveis} for r in recursos]
    por_id = {r["id"]: r for r in recursos}

    afetadas = [r for r in reservas if r["recurso_id"] in indisponiveis]
    outras = [r for r in reservas if r["recurso_id"] not in indisponiveis]

    # 1. Domínio de cada reserva afetada: salas válidas à mesma hora, da melhor para a pior
    dominios, pedidos = {}, {}
    for reserva in afetadas:
        pedido = pedido_da_reserva(reserva, por_id[reserva["recurso_id"]])
        inicio = datetime.fromisoformat(reserva["inicio"])
        fim = datetime.fromisoformat(reserva["fim"])
        validos = [(r["id"], inicio) for r in recursos
                   if valor_valido((r["id"], inicio), pedido, por_id, outras)]
        validos.sort(key=lambda v: custo_total(v, pedido, por_id, outras))
        dominios[reserva["id"]] = [(sala, inicio, fim) for sala, inicio in validos]
        pedidos[reserva["id"]] = pedido

    # 2. Reservas sem nenhuma sala possível ficam logo de fora
    sem_alternativa = [rid for rid, dom in dominios.items() if not dom]
    variaveis = [rid for rid in dominios if dominios[rid]]

    # 3. Procurar, deixando de fora o MENOR número possível de reservas
    estatisticas = {"nos": 0}
    solucao = None
    for n_fora in range(len(variaveis) + 1):
        for fora in combinations(variaveis, n_fora):
            restantes = [v for v in variaveis if v not in fora]
            solucao = backtracking_fc(restantes, dominios, None,
                                      estatisticas=estatisticas, compat=nao_chocam)
            if solucao is not None:
                sem_alternativa += list(fora)
                break
        if solucao is not None:
            break

    reatribuidas = [
        {
            "reserva_id": rid,
            "recurso_id": sala,
            "recurso_nome": por_id[sala]["nome"],
            "inicio": inicio.isoformat(),
            "fim": fim.isoformat(),
        }
        for rid, (sala, inicio, fim) in sorted((solucao or {}).items())
    ]
    return {
        "reatribuidas": reatribuidas,
        "sem_alternativa": sorted(sem_alternativa),
        "nos_explorados": estatisticas["nos"],
    }