import { estadoFalso } from '../data/estadoFalso'

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function pedirEstado() {
  await esperar(300)
  return estadoFalso
}