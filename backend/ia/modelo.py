"""Modelo do CSP: variáveis, domínios e restrições."""


def criar_variaveis(pedido):
    """Uma variável por cada sessão que é preciso marcar."""
    n = pedido.get("n_sessoes", 1)
    return [f"S{i}" for i in range(1, n + 1)]