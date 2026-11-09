// Cliente único para falar com a API do backend.
// Os pedidos vão para "/api/..." e o Vite reencaminha-os para o backend
// (ver vite.config.js), por isso não há problemas de CORS em desenvolvimento.

const CHAVE_SESSAO = 'bookit_utilizador'

export function lerToken() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO))?.token ?? null
  } catch {
    return null
  }
}

export async function api(caminho, { metodo = 'GET', corpo, cabecalhos = {} } = {}) {
  const token = lerToken()
  let resposta
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...cabecalhos,
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new Error('Não foi possível contactar o servidor. Confirme que o backend está a correr.')
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // Sessão expirada ou inválida: limpa e volta ao login
    if (resposta.status === 401 && token) {
      localStorage.removeItem(CHAVE_SESSAO)
      window.location.assign('/login')
    }
    const detalhe = dados?.detail
    const mensagem = typeof detalhe === 'string' ? detalhe : `Erro ${resposta.status} no servidor`
    throw new Error(mensagem)
  }

  return dados
}
