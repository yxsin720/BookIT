import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null)

  const iniciarSessao = u => setUtilizador(u)
  const terminarSessao = () => setUtilizador(null)

  return (
    <AuthContext.Provider value={{ utilizador, iniciarSessao, terminarSessao }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}