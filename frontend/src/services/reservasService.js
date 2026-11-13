import { api } from './api'

// A API devolve "recurso_nome"; as páginas usam "nome"
const paraEcra = r => ({ ...r, nome: r.recurso_nome })

export async function pedirReservas() {
  const reservas = await api('/reservas/minhas')
  return reservas.map(paraEcra)
}

export async function criarReserva(opcao, pedido, origem = 'ia') {
  const reserva = await api('/reservas', {
    metodo: 'POST',
    // A chave de idempotência evita reservas duplicadas se o pedido for repetido
    cabecalhos: { 'Idempotency-Key': crypto.randomUUID() },
    corpo: {
      recurso_id: opcao.recurso_id,
      inicio: opcao.inicio,
      fim: opcao.fim,
      n_pessoas: pedido.n_pessoas,
      origem,
    },
  })
  return paraEcra(reserva)
}

export async function cancelarReserva(id) {
  return paraEcra(await api(`/reservas/${id}`, { metodo: 'DELETE' }))
}
