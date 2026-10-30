"""Procura com backtracking: experimentar, e voltar atrás quando uma restrição falha."""

from restricoes_binarias import atribuicao_consistente


def backtracking(variaveis, dominios, pedido, atribuicao=None, estatisticas=None):
    """Devolve a primeira atribuição completa e consistente, ou None se não houver."""
    if atribuicao is None:
        atribuicao = {}
    if estatisticas is None:
        estatisticas = {"nos": 0}

    # 1. Todas as variáveis têm valor? Encontrámos uma solução.
    if len(atribuicao) == len(variaveis):
        return dict(atribuicao)

    # 2. Escolher a próxima variável sem valor (por ordem: S1, S2, S3...)
    variavel = next(v for v in variaveis if v not in atribuicao)

    # 3. Experimentar cada valor do domínio dessa variável
    for valor in dominios[variavel]:
        estatisticas["nos"] += 1
        atribuicao[variavel] = valor

        if atribuicao_consistente(atribuicao, pedido):
            resultado = backtracking(variaveis, dominios, pedido, atribuicao, estatisticas)
            if resultado is not None:
                return resultado

        # 4. Não deu: tirar o valor e experimentar o seguinte (é isto o "voltar atrás")
        del atribuicao[variavel]

    # 5. Nenhum valor serviu: avisar a chamada anterior para mudar a escolha dela
    return None