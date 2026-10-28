import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const TODOS = ['utilizador', 'gestor', 'administrador']

const LINKS = [
  { to: '/nova-reserva', texto: 'Nova reserva', perfis: TODOS },
  { to: '/minhas-reservas', texto: 'As minhas reservas', perfis: TODOS },
  { to: '/recursos', texto: 'Recursos', perfis: TODOS },
  { to: '/gestor', texto: 'Painel do gestor', perfis: ['gestor', 'administrador'] },
   { to: '/estado', texto: 'Estado do sistema', perfis: ['gestor', 'administrador'] },
  { to: '/utilizadores', texto: 'Utilizadores', perfis: ['administrador'] },
]

export default function Navbar() {
  const { utilizador, terminarSessao } = useAuth()
  const navigate = useNavigate()

  const sair = () => {
    terminarSessao()
    navigate('/login')
  }

  const visiveis = LINKS.filter(l => utilizador && l.perfis.includes(utilizador.perfil))

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
        {utilizador
          ? (
            <>
              {utilizador.nome} ({utilizador.perfil}){' '}
              <button type="button" onClick={sair}>Sair</button>
            </>
          )
          : <NavLink to="/login">Entrar</NavLink>}
      </div>
    </header>
  )
}