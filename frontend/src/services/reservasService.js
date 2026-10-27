import { reservasFalsas } from '../data/reservasFalsas'

let reservas = [...reservasFalsas]

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function pedirReservas() {
  await esperar(300)
  return reservas
}

export async function criarReserva(opcao, pedido) {
  await esperar(300)
  const nova = {
    id: Date.now(),
    recurso_id: opcao.recurso_id,
    nome: opcao.nome,
    inicio: opcao.inicio,
    fim: opcao.fim,
    n_pessoas: pedido.n_pessoas,
    estado: 'confirmada',
  }
  reservas = [...reservas, nova]
  return nova
}

export async function cancelarReserva(id) {
  await esperar(300)
  reservas = reservas.map(r => (r.id === id ? { ...r, estado: 'cancelada' } : r))
}
