import { api } from './api'

export async function entrar(email, password) {
  const emailLimpo = email.trim().toLowerCase()
  const resposta = await api('/login', {
    metodo: 'POST',
    corpo: { email: emailLimpo, password },
  })

  return {
    nome: resposta.nome,
    email: emailLimpo,
    perfil: resposta.perfil,
    token: resposta.token,
  }
}

export async function registar({ nome, email, password }) {
  const emailLimpo = email.trim().toLowerCase()
  const resposta = await api('/registo', {
    metodo: 'POST',
    corpo: { nome: nome.trim(), email: emailLimpo, password },
  })

  return {
    nome: resposta.nome,
    email: emailLimpo,
    perfil: resposta.perfil,
    token: resposta.token,
  }
}
