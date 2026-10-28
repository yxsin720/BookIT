import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RotaProtegida({ perfis }) {
  const { utilizador } = useAuth()

  if (!utilizador) return <Navigate to="/login" replace />
  if (perfis && !perfis.includes(utilizador.perfil)) return <Navigate to="/nova-reserva" replace />

  return <Outlet />
}