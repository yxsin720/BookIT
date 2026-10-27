import { pedirUtilizadores } from './utilizadoresService'

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function entrar(email, password) {
  await esperar(300)
  const utilizadores = await pedirUtilizadores()
  const utilizador = utilizadores.find(u => u.email === email)

  if (!utilizador || password !== '1234') {
    throw new Error('Email ou palavra-passe incorretos.')
  }
  return utilizador
}