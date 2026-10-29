import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RotaProtegida from './components/RotaProtegida.jsx'
import Login from './pages/Login.jsx'
import Registo from './pages/Registo.jsx'
import NovaReserva from './pages/NovaReserva.jsx'
import Opcoes from './pages/Opcoes.jsx'
import MinhasReservas from './pages/MinhasReservas.jsx'
import Recursos from './pages/Recursos.jsx'
import PainelGestor from './pages/PainelGestor.jsx'
import Utilizadores from './pages/Utilizadores.jsx'
import EstadoSistema from './pages/EstadoSistema.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="registo" element={<Registo />} />

      <Route element={<Layout />}>
        <Route index element={<Navigate to="/nova-reserva" replace />} />

        <Route element={<RotaProtegida />}>
          <Route path="nova-reserva" element={<NovaReserva />} />
          <Route path="opcoes" element={<Opcoes />} />
          <Route path="minhas-reservas" element={<MinhasReservas />} />
          <Route path="recursos" element={<Recursos />} />
        </Route>

        <Route element={<RotaProtegida perfis={['gestor', 'administrador']} />}>
          <Route path="gestor" element={<PainelGestor />} />
          <Route path="estado" element={<EstadoSistema />} />
        </Route>

        <Route element={<RotaProtegida perfis={['administrador']} />}>
          <Route path="utilizadores" element={<Utilizadores />} />
        </Route>

        <Route path="*" element={<Navigate to="/nova-reserva" replace />} />
      </Route>
    </Routes>
  )
}  