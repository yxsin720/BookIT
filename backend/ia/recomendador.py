"""Juntar tudo: do pedido às melhores opções."""

from datetime import timedelta

from custo import custo_total
from modelo import criar_dominios, criar_variaveis
from restricoes import aplicar_restricoes_unarias


def recomendar(pedido, recursos, reservas, k=5):
    """Devolve as k melhores opções (sala, horário) para uma sessão."""
    recursos_por_id = {r["id"]: r for r in recursos}

    # 1. Variáveis e domínio
    variaveis = criar_variaveis({**pedido, "n_sessoes": 1})
    dominios = criar_dominios(variaveis, pedido, recursos)

    # 2. Restrições unárias: tirar o que é impossível
    dominios = aplicar_restricoes_unarias(dominios, pedido, recursos, reservas)
    validos = dominios["S1"]

    # 3. Ordenar do menor custo para o maior
    ordenados = sorted(validos, key=lambda v: custo_total(v, pedido, recursos_por_id, reservas))

    # 4. Escolher as k melhores, no máximo uma por sala e por dia (para dar variedade)
    escolhidas, vistos = [], set()
    for recurso_id, inicio in ordenados:
        chave = (recurso_id, inicio.date())
        if chave in vistos:
            continue
        vistos.add(chave)
        escolhidas.append((recurso_id, inicio))
        if len(escolhidas) == k:
            break

    # 5. Pôr no formato que a API espera
    return [
        {
            "recurso_id": recurso_id,
            "recurso_nome": recursos_por_id[recurso_id]["nome"],
            "inicio": inicio.isoformat(),
            "fim": (inicio + timedelta(minutes=pedido["duracao_min"])).isoformat(),
            "custo": round(custo_total((recurso_id, inicio), pedido, recursos_por_id, reservas), 2),
        }
        for recurso_id, inicio in escolhidas
    ]