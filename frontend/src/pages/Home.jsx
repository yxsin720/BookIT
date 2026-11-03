import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ANO = new Date().getFullYear()

const PASSOS = [
  {
    titulo: 'Diga o que precisa',
    texto: 'Tipo de espaço, número de pessoas, duração e equipamento. Sem andar a procurar sala a sala.',
  },
  {
    titulo: 'Receba as melhores opções',
    texto: 'O BookIT analisa os espaços livres e ordena-os por pontuação, com o motivo de cada sugestão.',
  },
  {
    titulo: 'Escolha e confirme',
    texto: 'Escolha uma opção e confirme. A reserva fica guardada em As minhas reservas.',
  },
]

const PERFIS = [
  {
    icone: '🎓',
    nome: 'Utilizadores',
    texto: 'Procuram e reservam salas, laboratórios e equipamentos, e acompanham as suas reservas.',
  },
  {
    icone: '📊',
    nome: 'Gestores',
    texto: 'Acompanham a ocupação, marcam recursos como indisponíveis e veem as reservas reatribuídas.',
  },
  {
    icone: '🛡️',
    nome: 'Administradores',
    texto: 'Gerem as contas e os perfis de acesso, e acompanham o estado do sistema.',
  },
]

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
        </nav>

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

      <section className="hero">
        <div>
          <span className="hero-selo">Reservas inteligentes para o campus</span>
          <h1>
            O espaço certo, <span className="texto-gradiente">à primeira.</span>
          </h1>
          <p className="hero-sub">
            Diga-nos o que precisa e o BookIT sugere as melhores salas, laboratórios e lugares de estudo do campus.
          </p>

          <div className="acoes">
            <Link className="botao" to={destino}>Reservar agora</Link>
            <a className="botao secundario" href="#como-funciona">Ver como funciona</a>
          </div>

          <div className="hero-tipos">
            <span>🏫 Salas</span>
            <span>🔬 Laboratórios</span>
            <span>🎥 Equipamentos</span>
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

          <article className="card opcao">
            <div className="score media">85</div>
            <div className="opcao-info">
              <h2>Sala 1.02</h2>
              <p>Qui 29/10, 16:00 - 18:00 · capacidade 6</p>
              <small>Lotação exata · procura média</small>
            </div>
          </article>
        </div>
      </section>

      <section className="home-secao" id="como-funciona">
        <h2>Como funciona</h2>
        <ol className="passos">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="card">
              <span className="passo-num">{i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-secao" id="perfis">
        <h2>Para quem</h2>
        <div className="perfis">
          {PERFIS.map(p => (
            <article key={p.nome} className="card">
              <span className="perfil-icone" aria-hidden="true">{p.icone}</span>
              <h3>{p.nome}</h3>
              <p>{p.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <h2>Pronto para reservar?</h2>
        <p>Crie a sua conta e encontre o espaço ideal em poucos cliques.</p>
        <div className="acoes">
          <Link className="botao" to={utilizador ? '/nova-reserva' : '/registo'}>
            {utilizador ? 'Ir para a aplicação' : 'Criar conta'}
          </Link>
        </div>
      </section>

      <footer className="home-rodape">
        <span className="logo">
          Book<span>IT</span>
        </span>
        <span>Reservas de espaços do campus · {ANO}</span>
      </footer>
    </div>
  )
}