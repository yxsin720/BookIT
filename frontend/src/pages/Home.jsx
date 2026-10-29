import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { utilizador } = useAuth()

  // quem já entrou vai direto para a aplicação; os outros passam pelo login
  const destino = utilizador ? '/nova-reserva' : '/login'

  return (
    <div className="home">
      <header className="home-topo">
        <div className="logo">
          Book<span>IT</span>
        </div>

        <nav>
          <a href="#como-funciona">Como funciona</a>
          <a href="#perfis">Para quem</a>
          <a href="#perguntas">Perguntas</a>
        </nav>

        <Link className="botao" to={destino}>
          {utilizador ? 'Ir para a aplicação' : 'Entrar'}
        </Link>
      </header>

      <section className="hero">
        <div>
          <span className="selo">Universidade Europeia</span>
          <h1>O espaço certo, à primeira.</h1>
          <p className="hero-sub">
            Diga-nos o que precisa e o BookIT sugere as melhores salas, laboratórios e lugares de estudo do campus.
          </p>

          <div className="acoes">
            <Link className="botao" to={destino}>Reservar agora</Link>
            <a className="botao secundario" href="#como-funciona">Ver como funciona</a>
          </div>
        </div>

        <div className="hero-exemplo" aria-hidden="true">
          <article className="card opcao destaque">
            <div className="score alta">92</div>
            <div className="opcao-info">
              <h2>
                Sala 1.07
                <span className="etiqueta">Melhor opção</span>
              </h2>
              <p>Qui 29/10, 14:00 - 16:00 · capacidade 8</p>
              <small>Edifício preferido · horário com baixa procura</small>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}