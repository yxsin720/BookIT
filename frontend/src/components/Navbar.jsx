import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const LINKS = [
  { to: '/nova-reserva', texto: 'Nova reserva' },
  { to: '/minhas-reservas', texto: 'As minhas reservas' },
  { to: '/recursos', texto: 'Recursos' },
  { to: '/gestor', texto: 'Painel do gestor', perfis: ['gestor', 'administrador'] },
  { to: '/estado', texto: 'Estado do sistema', perfis: ['gestor', 'administrador'] },
  { to: '/utilizadores', texto: 'Utilizadores', perfis: ['administrador'] },
]

export default function Navbar() {
  const { utilizador, terminarSessao } = useAuth()
  const navigate = useNavigate()

  // mostra o link se não tem restrição de perfis, ou se o perfil do utilizador está na lista
  const visiveis = LINKS.filter(l => !l.perfis || l.perfis.includes(utilizador?.perfil))

  const sair = () => {
    terminarSessao()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="logo">
        Book<span>IT</span>
      </div>
      <nav>
        {visiveis.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => (isActive ? 'nav-link ativo' : 'nav-link')}
          >
            {l.texto}
          </NavLink>
        ))}
      </nav>
      <div className="navbar-user">
        {utilizador ? (
          <>
            {utilizador.nome} ({utilizador.perfil})
            <button type="button" onClick={sair}>Sair</button>
          </>
        ) : (
          <NavLink to="/login">Entrar</NavLink>
        )}
      </div>
    </header>
  )
}