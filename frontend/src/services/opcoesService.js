import { opcoesFalsas } from '../data/opcoesFalsas'

export async function pedirOpcoes(pedido) {
  console.log('Pedido recebido:', pedido)
  // espera 0,4 s para simular o tempo de uma API real
  await new Promise(resolve => setTimeout(resolve, 400))
  return opcoesFalsas
}