import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const CHAVE = 'bookit_utilizador'

function lerSessao() {
  try {
    const guardado = localStorage.getItem(CHAVE)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(lerSessao)

  const iniciarSessao = u => {
    localStorage.setItem(CHAVE, JSON.stringify(u))
    setUtilizador(u)
  }

  const terminarSessao = () => {
    localStorage.removeItem(CHAVE)
    setUtilizador(null)
  }

  return (
    <AuthContext.Provider value={{ utilizador, iniciarSessao, terminarSessao }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}