import { pedirUtilizadores } from './utilizadoresService'

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function entrar(email, password) {
  await esperar(300)
  const utilizadores = await pedirUtilizadores()
  const emailLimpo = email.trim().toLowerCase()
  const utilizador = utilizadores.find(u => u.email === emailLimpo)
  const passwordCerta = utilizador?.password ?? '1234'

  if (!utilizador || password !== passwordCerta) {
    throw new Error('Email ou palavra-passe incorretos.')
  }

  return {
    id: utilizador.id,
    nome: utilizador.nome,
    email: utilizador.email,
    perfil: utilizador.perfil,
  }
}