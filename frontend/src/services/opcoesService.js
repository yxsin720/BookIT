import { api } from './api'

// A IA devolve um "custo" (quanto menor, melhor). Para o ecrã, passamos a
// uma pontuação de 0 a 100: custo 0 = 100 pontos.
const pontuacao = custo => (custo == null ? null : Math.round(100 / (1 + custo / 2)))

function motivos(pedido, recurso) {
  if (!recurso) return []
  const lista = []
  if (pedido.edificio) {
    lista.push(recurso.edificio === pedido.edificio ? 'Edifício preferido' : 'Outro edifício')
  }
  const sobra = recurso.capacidade - pedido.n_pessoas
  lista.push(
    sobra === 0
      ? 'Lotação exata'
      : `Capacidade ${sobra <= 4 ? 'adequada' : 'acima do necessário'} (${sobra} lugares livres)`
  )
  if (pedido.equipamentos.length > 0) lista.push('Tem o equipamento pedido')
  return lista
}

export async function pedirOpcoes(pedido) {
  const corpo = {
    ...pedido,
    data_fim: pedido.data_fim || pedido.data_inicio,
    // a BD guarda os equipamentos em minúsculas ("projetor")
    equipamentos: pedido.equipamentos.map(e => e.toLowerCase()),
  }

  const inicio = performance.now()
  const [resposta, recursos] = await Promise.all([
    api('/recomendacoes', { metodo: 'POST', corpo }),
    api('/recursos'),
  ])
  const tempo_ms = performance.now() - inicio
  const porId = Object.fromEntries(recursos.map(r => [r.id, r]))

  return {
    origem: resposta.origem,
    tempo_ms,
    opcoes: resposta.opcoes.map(o => {
      const recurso = porId[o.recurso_id]
      return {
        recurso_id: o.recurso_id,
        nome: o.recurso_nome,
        inicio: o.inicio,
        fim: o.fim,
        capacidade: recurso?.capacidade,
        equipamentos: recurso?.equipamentos ?? [],
        score: pontuacao(o.custo),
        motivos: motivos(pedido, recurso),
      }
    }),
  }
}
