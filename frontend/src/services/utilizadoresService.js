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

export async function criarUtilizador({ nome, email, password }) {
  await esperar(300)
  const emailLimpo = email.trim().toLowerCase()

  if (utilizadores.some(u => u.email === emailLimpo)) {
    throw new Error('Já existe uma conta com este email.')
  }

  const novo = {
    id: Date.now(),
    nome: nome.trim(),
    email: emailLimpo,
    perfil: 'utilizador',
    password,
  }
  utilizadores = [...utilizadores, novo]

  return { id: novo.id, nome: novo.nome, email: novo.email, perfil: novo.perfil }
}