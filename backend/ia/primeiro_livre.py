"""A estratégia simples, sem IA: as primeiras opções livres, por ordem de sala, dia e hora.
Serve de alternativa quando a IA está em baixo (cenário C2) e de termo de comparação."""

from datetime import timedelta

from custo import custo_total
from modelo import criar_dominio
from restricoes import valor_valido


def primeiro_livre(pedido, recursos, reservas, k=5):
    """Devolve as k primeiras opções que cumprem as regras obrigatórias, sem olhar ao custo."""
    recursos_por_id = {r["id"]: r for r in recursos}
    opcoes = []
    for valor in criar_dominio(pedido, recursos):  # ordem natural: sala, dia, hora
        if valor_valido(valor, pedido, recursos_por_id, reservas):
            opcoes.append(valor)
            if len(opcoes) == k:
                break

    return [
        {
            "recurso_id": recurso_id,
            "recurso_nome": recursos_por_id[recurso_id]["nome"],
            "inicio": inicio.isoformat(),
            "fim": (inicio + timedelta(minutes=pedido["duracao_min"])).isoformat(),
            # o custo é calculado só para podermos comparar com a IA
            "custo": round(custo_total((recurso_id, inicio), pedido, recursos_por_id, reservas), 2),
        }
        for recurso_id, inicio in opcoes
    ]