import { api } from './api'

// A API ainda não tem um endpoint para marcar um recurso como indisponível,
// por isso essa marcação fica só no browser até a página ser recarregada.
const indisponiveisLocais = new Set()

export async function pedirRecursos() {
  const recursos = await api('/recursos')
  return recursos.map(r => ({
    ...r,
    estado: r.ativo && !indisponiveisLocais.has(r.id) ? 'disponivel' : 'indisponivel',
  }))
}

export async function marcarIndisponivel(id) {
  indisponiveisLocais.add(id)
}
