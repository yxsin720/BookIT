import { recursosFalsos } from '../data/recursosFalsos'

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function pedirRecursos() {
  await esperar(300)
  return recursosFalsos
}