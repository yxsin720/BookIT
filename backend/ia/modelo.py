"""Modelo do CSP: variáveis, domínios e restrições."""

from datetime import date, datetime, time, timedelta

def criar_variaveis(pedido):
    """Uma variável por cada sessão que é preciso marcar."""
    n = pedido.get("n_sessoes", 1)
    return [f"S{i}" for i in range(1, n + 1)]



# ---------- Domínio ----------

PASSO_MIN = 30   # de quanto em quanto tempo pode começar uma reserva
HORA_ABRE = 8    # a universidade abre às 8h
HORA_FECHA = 22  # e fecha às 22h


def dias_da_janela(pedido):
    """Todos os dias entre data_inicio e data_fim (inclusive)."""
    dia = date.fromisoformat(pedido["data_inicio"])
    ultimo = date.fromisoformat(pedido["data_fim"])
    dias = []
    while dia <= ultimo:
        dias.append(dia)
        dia += timedelta(days=1)
    return dias


def horas_de_inicio(dia, duracao_min):
    """Todas as horas a que uma reserva pode começar nesse dia, de 30 em 30 minutos."""
    hora = datetime.combine(dia, time(HORA_ABRE))
    fecho = datetime.combine(dia, time(HORA_FECHA))
    duracao = timedelta(minutes=duracao_min)
    horas = []
    while hora + duracao <= fecho:
        horas.append(hora)
        hora += timedelta(minutes=PASSO_MIN)
    return horas


def criar_dominio(pedido, recursos):
    """Todos os valores possíveis para uma variável: pares (id da sala, início)."""
    valores = []
    for recurso in recursos:
        for dia in dias_da_janela(pedido):
            for inicio in horas_de_inicio(dia, pedido["duracao_min"]):
                valores.append((recurso["id"], inicio))
    return valores


def criar_dominios(variaveis, pedido, recursos):
    """Um domínio para cada variável. No início são todos iguais."""
    return {v: criar_dominio(pedido, recursos) for v in variaveis}