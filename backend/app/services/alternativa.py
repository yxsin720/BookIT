"""Alternativa SEM IA, usada quando nenhuma cópia da IA responde (cenário C2):
as primeiras opções livres que cumprem as regras obrigatórias."""
from datetime import date, datetime, time, timedelta


def primeiro_livre(pedido, recursos, reservas, k=5):
    duracao = timedelta(minutes=pedido["duracao_min"])
    pedido_eq = {e.lower() for e in pedido["equipamentos"]}
    ocupado = [(r["recurso_id"], datetime.fromisoformat(r["inicio"]),
                datetime.fromisoformat(r["fim"])) for r in reservas]
    nao_antes = datetime.fromisoformat(pedido["nao_antes"]) if pedido.get("nao_antes") else None
    opcoes = []
    dia = date.fromisoformat(pedido["data_inicio"])
    while dia <= date.fromisoformat(pedido["data_fim"]):
        for sala in recursos:
            serve = (sala["ativo"] and sala["tipo"] == pedido["tipo"]
                     and sala["capacidade"] >= pedido["n_pessoas"]
                     and pedido_eq <= {e.lower() for e in sala["equipamentos"]}
                     and dia.isoweekday() % 7 in sala.get("dias", range(7)))  # 0 = domingo
            if not serve:
                continue
            inicio = datetime.combine(dia, time.fromisoformat(sala["abertura"]))
            fecho = datetime.combine(dia, time.fromisoformat(sala["fecho"]))
            while inicio + duracao <= fecho:
                fim = inicio + duracao
                livre = (nao_antes is None or inicio >= nao_antes) and all(
                    not (rid == sala["id"] and inicio < f and i < fim) for rid, i, f in ocupado)
                if livre:
                    opcoes.append({"recurso_id": sala["id"], "recurso_nome": sala["nome"],
                                   "inicio": inicio.isoformat(), "fim": fim.isoformat()})
                    break  # uma opção por sala e por dia
                inicio += timedelta(minutes=30)
            if len(opcoes) == k:
                return opcoes
        dia += timedelta(days=1)
    return opcoes