import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/nova-reserva', texto: 'Nova reserva' },
  { to: '/minhas-reservas', texto: 'As minhas reservas' },
  { to: '/recursos', texto: 'Recursos' },
  { to: '/gestor', texto: 'Painel do gestor' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">
        Book<span>IT</span>
      </div>
      <nav>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => (isActive ? 'nav-link ativo' : 'nav-link')}
          >
            {l.texto}
          </NavLink>
        ))}
      </nav>
      <div className="navbar-user">Ana Ferreira (utilizador)</div>
    </header>
  )
}