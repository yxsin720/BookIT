import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import NovaReserva from './pages/NovaReserva.jsx'
import Opcoes from './pages/Opcoes.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/nova-reserva" replace />} />
        <Route path="nova-reserva" element={<NovaReserva />} />
        <Route path="opcoes" element={<Opcoes />} />
      </Route>
    </Routes>
  )
}