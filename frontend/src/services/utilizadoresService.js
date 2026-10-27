import { utilizadoresFalsos } from '../data/utilizadoresFalsos'

let utilizadores = [...utilizadoresFalsos]

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function pedirUtilizadores() {
  await esperar(300)
  return utilizadores
}

export async function alterarPerfil(id, perfil) {
  await esperar(300)
  utilizadores = utilizadores.map(u => (u.id === id ? { ...u, perfil } : u))
}