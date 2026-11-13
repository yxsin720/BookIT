import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ANO = new Date().getFullYear()

const PASSOS = [
  { titulo: 'Diga o que precisa', texto: 'Tipo de espaço, número de pessoas, datas e equipamento.' },
  { titulo: 'Veja as melhores opções', texto: 'O BookIT procura as salas livres e ordena-as pelo que pediu.' },
  { titulo: 'Reserve', texto: 'Escolha uma opção. Pode cancelar mais tarde em As minhas reservas.' },
]

export default function Home() {
  const { utilizador } = useAuth()

  return (
    <div className="home">
      <header className="home-topo">
        <div className="logo">
          Book<span>IT</span>
        </div>

        <div className="acoes">
          {utilizador ? (
            <Link className="botao" to="/nova-reserva">Ir para a aplicação</Link>
          ) : (
            <>
              <Link className="botao secundario" to="/login">Entrar</Link>
              <Link className="botao" to="/registo">Criar conta</Link>
            </>
          )}
        </div>
      </header>

      <main className="home-corpo">
        <section className="hero">
          <h1>Reserve salas da universidade sem andar à procura.</h1>
          <p className="hero-sub">
            Diga o que precisa e o BookIT mostra-lhe as salas livres que melhor servem.
          </p>
          <Link className="botao" to={utilizador ? '/nova-reserva' : '/login'}>
            Fazer uma reserva
          </Link>
        </section>

        <section className="home-secao">
          <h2>Como funciona</h2>
          <ol className="passos">
            {PASSOS.map(p => (
              <li key={p.titulo}>
                <b>{p.titulo}</b>
                <span>{p.texto}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="home-rodape">
        Projeto académico · Universidade Europeia · {ANO}
      </footer>
    </div>
  )
}
