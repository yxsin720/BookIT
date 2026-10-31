"""Backtracking melhorado: MRV para escolher a variável e forward checking para olhar em frente."""

from restricoes_binarias import compativeis


def escolher_variavel_mrv(livres, dominios):
    """MRV (Minimum Remaining Values): a variável com MENOS valores possíveis primeiro.
    Em caso de empate fica a primeira (aqui todas as sessões se ligam entre si,
    por isso a heurística do grau daria sempre empate)."""
    return min(livres, key=lambda v: len(dominios[v]))


def forward_checking(variavel, valor, livres, dominios, pedido):
    """Depois de escolher um valor, tira dos domínios das outras variáveis
    tudo o que deixou de ser compatível. Devolve None se algum domínio ficar vazio."""
    novos = {}
    for outra in livres:
        if outra == variavel:
            continue
        filtrado = [w for w in dominios[outra] if compativeis(valor, w, pedido)]
        if not filtrado:
            return None          # beco sem saída detetado JÁ, sem descer mais
        novos[outra] = filtrado
    return novos


def backtracking_fc(variaveis, dominios, pedido, atribuicao=None, estatisticas=None):
    """Igual ao backtracking simples, mas com MRV e forward checking."""
    if atribuicao is None:
        atribuicao = {}
    if estatisticas is None:
        estatisticas = {"nos": 0}

    if len(atribuicao) == len(variaveis):
        return dict(atribuicao)

    livres = [v for v in variaveis if v not in atribuicao]
    variavel = escolher_variavel_mrv(livres, dominios)

    for valor in dominios[variavel]:
        estatisticas["nos"] += 1

        novos = forward_checking(variavel, valor, livres, dominios, pedido)
        if novos is None:
            continue             # este valor deixava outra variável sem opções

        atribuicao[variavel] = valor
        resultado = backtracking_fc(variaveis, {**dominios, **novos}, pedido,
                                    atribuicao, estatisticas)
        if resultado is not None:
            return resultado
        del atribuicao[variavel]

    return None