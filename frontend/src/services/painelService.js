import { painelFalso } from '../data/painelFalso'

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function pedirPainel() {
  await esperar(300)
  return painelFalso
}