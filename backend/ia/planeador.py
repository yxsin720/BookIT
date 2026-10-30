"""Marcar várias sessões de uma vez (US5)."""

from datetime import timedelta

from backtracking import backtracking
from custo import custo_total
from modelo import criar_dominios, criar_variaveis
from restricoes import aplicar_restricoes_unarias


def planear_sessoes(pedido, recursos, reservas):
    """Encontra uma sala e um horário para cada sessão pedida."""
    recursos_por_id = {r["id"]: r for r in recursos}

    # 1. Variáveis (S1, S2, ...) e domínios, já sem os valores impossíveis
    variaveis = criar_variaveis(pedido)
    dominios = criar_dominios(variaveis, pedido, recursos)
    dominios = aplicar_restricoes_unarias(dominios, pedido, recursos, reservas)

    # 2. Ordenar cada domínio pelo custo: o backtracking experimenta primeiro as melhores
    def custo(valor):
        return custo_total(valor, pedido, recursos_por_id, reservas)

    dominios = {v: sorted(valores, key=custo) for v, valores in dominios.items()}

    # 3. Procurar
    estatisticas = {"nos": 0}
    solucao = backtracking(variaveis, dominios, pedido, estatisticas=estatisticas)

    if solucao is None:
        return {"sessoes": [], "custo_total": None, "nos_explorados": estatisticas["nos"]}

    sessoes = [
        {
            "sessao": variavel,
            "recurso_id": recurso_id,
            "recurso_nome": recursos_por_id[recurso_id]["nome"],
            "inicio": inicio.isoformat(),
            "fim": (inicio + timedelta(minutes=pedido["duracao_min"])).isoformat(),
            "custo": round(custo((recurso_id, inicio)), 2),
        }
        for variavel, (recurso_id, inicio) in solucao.items()
    ]
    return {
        "sessoes": sessoes,
        "custo_total": round(sum(s["custo"] for s in sessoes), 2),
        "nos_explorados": estatisticas["nos"],
    }