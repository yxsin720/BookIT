import { recursosFalsos } from '../data/recursosFalsos'

let recursos = [...recursosFalsos]

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function pedirRecursos() {
  await esperar(300)
  return recursos
}

export async function marcarIndisponivel(id) {
  await esperar(300)
  recursos = recursos.map(r => (r.id === id ? { ...r, estado: 'indisponivel' } : r))
}