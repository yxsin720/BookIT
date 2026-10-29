"""Restrições suaves: dar uma "nota" (custo) a cada opção. Quanto menor, melhor."""

from datetime import datetime, time, timedelta

# Quanto pesa cada preferência no custo total
PESOS = {
    "periodo": 3,      # fora do período preferido (manhã/tarde)
    "edificio": 2,     # noutro edifício
    "desperdicio": 2,  # sala muito maior do que o necessário
    "uso": 1,          # sala que já tem muitas reservas nesse dia
}

# Os períodos que o utilizador pode escolher no frontend
PERIODOS = {
    "manha": (time(8, 0), time(12, 0)),
    "tarde": (time(14, 0), time(18, 0)),
}


def custo_periodo(pedido, inicio, fim):
    """Horas que a reserva passa fora do período preferido (0 se estiver dentro)."""
    periodo = pedido.get("periodo", "qualquer")
    if periodo not in PERIODOS:
        return 0
    janela_ini = datetime.combine(inicio.date(), PERIODOS[periodo][0])
    janela_fim = datetime.combine(inicio.date(), PERIODOS[periodo][1])
    antes = max(timedelta(0), janela_ini - inicio)
    depois = max(timedelta(0), fim - janela_fim)
    return (antes + depois).total_seconds() / 3600


def custo_edificio(pedido, recurso):
    """1 se a sala não está no edifício preferido, 0 se está (ou se não há preferência)."""
    preferido = pedido.get("edificio", "")
    if not preferido:
        return 0
    return 0 if recurso["edificio"] == preferido else 1


def custo_desperdicio(pedido, recurso):
    """Parte dos lugares que fica vazia: 6 pessoas numa sala de 30 = 0,8."""
    return (recurso["capacidade"] - pedido["n_pessoas"]) / recurso["capacidade"]


def custo_uso(recurso, inicio, reservas):
    """Quantas reservas essa sala já tem nesse dia (para espalhar o uso)."""
    return sum(
        1 for r in reservas
        if r["recurso_id"] == recurso["id"]
        and datetime.fromisoformat(r["inicio"]).date() == inicio.date()
    )


def custo_total(valor, pedido, recursos_por_id, reservas):
    """Soma pesada de todos os custos de uma opção (sala, início)."""
    recurso_id, inicio = valor
    recurso = recursos_por_id[recurso_id]
    fim = inicio + timedelta(minutes=pedido["duracao_min"])
    return (PESOS["periodo"] * custo_periodo(pedido, inicio, fim)
            + PESOS["edificio"] * custo_edificio(pedido, recurso)
            + PESOS["desperdicio"] * custo_desperdicio(pedido, recurso)
            + PESOS["uso"] * custo_uso(recurso, inicio, reservas))