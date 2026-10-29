"""Restrições unárias: regras que olham para um valor de cada vez."""

from datetime import datetime, time, timedelta


def para_hora(texto):
    """Converte "08:00" num objeto time."""
    return time.fromisoformat(texto)


# ---------- As restrições, uma função cada ----------

def sala_certa(pedido, recurso):
    """U1: o recurso é do tipo pedido e está ativo (não avariado)."""
    return recurso["tipo"] == pedido["tipo"] and recurso["ativo"]


def tem_capacidade(pedido, recurso):
    """U2: cabem todas as pessoas."""
    return recurso["capacidade"] >= pedido["n_pessoas"]


def tem_equipamento(pedido, recurso):
    """U3: tem todo o equipamento pedido."""
    pedido_eq = {e.lower() for e in pedido["equipamentos"]}
    sala_eq = {e.lower() for e in recurso["equipamentos"]}
    return pedido_eq <= sala_eq


def dentro_do_horario(recurso, inicio, fim):
    """U4: começa depois de a sala abrir e acaba antes de fechar."""
    return (inicio.time() >= para_hora(recurso["abertura"])
            and fim.time() <= para_hora(recurso["fecho"])
            and inicio.date() == fim.date())


def sala_livre(recurso, inicio, fim, reservas):
    """U6: não choca com nenhuma reserva já confirmada nessa sala."""
    for r in reservas:
        if r["recurso_id"] != recurso["id"]:
            continue
        r_inicio = datetime.fromisoformat(r["inicio"])
        r_fim = datetime.fromisoformat(r["fim"])
        if inicio < r_fim and r_inicio < fim:  # os dois intervalos sobrepõem-se
            return False
    return True


# ---------- Aplicar todas ao domínio ----------

def valor_valido(valor, pedido, recursos_por_id, reservas):
    """Um valor (sala, início) só fica se cumprir TODAS as restrições unárias."""
    recurso_id, inicio = valor
    recurso = recursos_por_id[recurso_id]
    fim = inicio + timedelta(minutes=pedido["duracao_min"])
    return (sala_certa(pedido, recurso)
            and tem_capacidade(pedido, recurso)
            and tem_equipamento(pedido, recurso)
            and dentro_do_horario(recurso, inicio, fim)
            and sala_livre(recurso, inicio, fim, reservas))


def aplicar_restricoes_unarias(dominios, pedido, recursos, reservas):
    """Consistência de nó: tira de cada domínio os valores que violam uma restrição unária."""
    recursos_por_id = {r["id"]: r for r in recursos}
    return {
        variavel: [v for v in valores if valor_valido(v, pedido, recursos_por_id, reservas)]
        for variavel, valores in dominios.items()
    }