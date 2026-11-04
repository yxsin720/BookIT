import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RotaPublica() {
  const { utilizador } = useAuth()

  if (utilizador) return <Navigate to="/nova-reserva" replace />

  return <Outlet />
}