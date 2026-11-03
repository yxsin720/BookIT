import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ANO = new Date().getFullYear()

// ---------- Textos e listas da página (para mudar um texto, é aqui) ----------
// Para pôr fotos: guarde-as em frontend/public/recursos/ e escreva o caminho
// em "imagem", por exemplo '/recursos/sala-2-14.jpg'.

const TIPOS = [
  { id: 'sala', rotulo: 'Sala' },
  { id: 'laboratorio', rotulo: 'Laboratório' },
  { id: 'equipamento', rotulo: 'Equipamento' },
]

const DURACOES = [1, 2, 3]

const ESPACOS = {
  sala: {
    rotulo: 'Salas',
    itens: [
      { nome: 'Sala 2.14', meta: 'Edifício A · capacidade 8', equipamentos: ['Projetor', 'Quadro'], imagem: null },
      { nome: 'Sala 1.07', meta: 'Edifício A · capacidade 6', equipamentos: ['Quadro'], imagem: null },
      { nome: 'Sala 3.02', meta: 'Edifício B · capacidade 12', equipamentos: ['Projetor', 'Videoconferência'], imagem: null },
    ],
  },
  laboratorio: {
    rotulo: 'Laboratórios',
    itens: [
      { nome: 'Lab. Informática 1', meta: 'Edifício B · capacidade 20', equipamentos: ['Projetor', 'Tomadas extra'], imagem: null },
      { nome: 'Lab. Informática 2', meta: 'Edifício B · capacidade 20', equipamentos: ['Projetor'], imagem: null },
    ],
  },
  equipamento: {
    rotulo: 'Equipamentos',
    itens: [
      { nome: 'Projetor portátil', meta: 'Biblioteca', equipamentos: [], imagem: null },
      { nome: 'Portátil', meta: 'Biblioteca', equipamentos: [], imagem: null },
      { nome: 'Câmara', meta: 'Biblioteca', equipamentos: [], imagem: null },
    ],
  },
  lugar: {
    rotulo: 'Lugares de estudo',
    itens: [
      { nome: 'Zona silenciosa', meta: 'Biblioteca · 1 lugar', equipamentos: ['Tomada'], imagem: null },
      { nome: 'Mesa partilhada', meta: 'Biblioteca · 4 lugares', equipamentos: ['Tomadas extra'], imagem: null },
    ],
  },
}

const PASSOS = [
  { id: 1, titulo: 'Diga o que precisa', texto: 'Tipo, pessoas e datas' },
  { id: 2, titulo: 'Veja as melhores opções', texto: 'Com foto e motivo' },
  { id: 3, titulo: 'Escolha e reserve', texto: 'Um clique' },
]

const GARANTIAS = [
  { titulo: 'Sem reservas duplicadas', texto: 'Nunca duas pessoas na mesma sala à mesma hora.' },
  { titulo: 'Sala indisponível? Há alternativa', texto: 'O sistema propõe outra ao gestor.' },
  { titulo: 'Cada sugestão tem motivo', texto: 'Sabe porque lhe mostramos aquela sala.' },
]

const PERFIS = {
  utilizador: {
    rotulo: 'Utilizador',
    pontos: ['Pede e reserva um espaço', 'Vê fotos e escolhe', 'Cancela quando quiser'],
    menu: ['Nova reserva', 'As minhas reservas', 'Recursos'],
  },
  gestor: {
    rotulo: 'Gestor',
    pontos: ['Acompanha a ocupação', 'Marca recursos indisponíveis', 'Aprova as alternativas do sistema'],
    menu: ['Nova reserva', 'As minhas reservas', 'Recursos', 'Painel do gestor', 'Estado do sistema'],
  },
  administrador: {
    rotulo: 'Administrador',
    pontos: ['Gere contas e perfis', 'Vê o estado dos serviços', 'Acesso a tudo o que o gestor vê'],
    menu: ['Nova reserva', 'Recursos', 'Painel do gestor', 'Utilizadores', 'Estado do sistema'],
  },
}

const PERGUNTAS = [
  { pergunta: 'Posso reservar sem usar as sugestões?', resposta: 'Sim. Em Recursos, reserve diretamente o espaço que já conhece.' },
  { pergunta: 'Posso cancelar uma reserva?', resposta: 'Sim, em As minhas reservas.' },
  { pergunta: 'E se a sala ficar indisponível?', resposta: 'O gestor recebe uma alternativa e a sua reserva aparece como reatribuída.' },
]

// Demonstração do simulador: escolhe um exemplo conforme o que a pessoa pede.
// Os números são de exemplo (a IA a sério está no back-end).
function sugerir(tipo, pessoas) {
  if (tipo === 'laboratorio') return { nome: 'Lab. Informática 1', meta: 'Capacidade 20 · Edifício B', score: 90 }
  if (tipo === 'equipamento') return { nome: 'Projetor portátil', meta: 'Levantar na Biblioteca', score: 95 }
  if (pessoas <= 6) return { nome: 'Sala 1.07', meta: 'Capacidade 6 · Edifício A', score: 92 }
  if (pessoas <= 8) return { nome: 'Sala 2.14', meta: 'Capacidade 8 · Edifício A', score: 90 }
  return { nome: 'Sala 3.02', meta: 'Capacidade 12 · Edifício B', score: 88 }
}

// ---------- A página ----------

export default function Home() {
  const { utilizador } = useAuth()

  // O que a pessoa escolheu em cada zona clicável
  const [tipo, setTipo] = useState('sala')
  const [pessoas, setPessoas] = useState(6)
  const [duracao, setDuracao] = useState(2)
  const [abaEspacos, setAbaEspacos] = useState('sala')
  const [passo, setPasso] = useState(1)
  const [perfil, setPerfil] = useState('utilizador')

  // quem já entrou vai direto para a aplicação; os outros passam pelo login
  const destino = utilizador ? '/nova-reserva' : '/login'

  const sugestao = sugerir(tipo, pessoas)
  const fim = 14 + duracao
  const perfilAtual = PERFIS[perfil]

  return (
    <div className="home">
      <header className="home-topo">
        <div className="logo">
          Book<span>IT</span>
        </div>

        <nav>
          <a href="#espacos">Espaços</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#perfis">Para quem</a>
          <a href="#perguntas">Perguntas</a>
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

      {/* Título + simulador */}
      <section className="hero">
        <div className="hero-texto">
          <h1>Reserve a sala certa, sem andar à procura.</h1>
          <p className="hero-sub">Experimente ao lado. É assim que o BookIT sugere.</p>
        </div>

        <div className="hero-vis">
          <div className="simulador">
            <h3>Experimente</h3>

            <div>
              <span className="simulador-rotulo">O que precisa?</span>
              <div className="chips">
                {TIPOS.map(t => (
                  <button
                    type="button"
                    key={t.id}
                    className={tipo === t.id ? 'chip ativo' : 'chip'}
                    aria-pressed={tipo === t.id}
                    onClick={() => setTipo(t.id)}
                  >
                    {t.rotulo}
                  </button>
                ))}
              </div>
            </div>

            {tipo !== 'equipamento' && (
              <div>
                <span className="simulador-rotulo">Quantas pessoas?</span>
                <div className="contador">
                  <button
                    type="button"
                    className="contador-btn"
                    aria-label="Menos uma pessoa"
                    onClick={() => setPessoas(p => Math.max(1, p - 1))}
                  >
                    −
                  </button>
                  <strong>{pessoas}</strong>
                  <button
                    type="button"
                    className="contador-btn"
                    aria-label="Mais uma pessoa"
                    onClick={() => setPessoas(p => Math.min(30, p + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div>
              <span className="simulador-rotulo">Quanto tempo?</span>
              <div className="chips">
                {DURACOES.map(d => (
                  <button
                    type="button"
                    key={d}
                    className={duracao === d ? 'chip ativo' : 'chip'}
                    aria-pressed={duracao === d}
                    onClick={() => setDuracao(d)}
                  >
                    {d} h
                  </button>
                ))}
              </div>
            </div>

            <div className="sugestao">
              <div className="sugestao-foto">Foto</div>
              <div className="sugestao-info">
                <b>{sugestao.nome}</b>
                <small>Qua 11/11, 14:00 – {fim}:00</small>
                <small>{sugestao.meta}</small>
              </div>
              <div className="sugestao-score">{sugestao.score}</div>
            </div>

            <Link className="botao" to={destino}>Reservar</Link>
          </div>
        </div>
      </section>

      {/* O que pode reservar */}
      <section className="home-secao" id="espacos">
        <h2>O que pode reservar</h2>

        <div className="abas">
          {Object.entries(ESPACOS).map(([id, grupo]) => (
            <button
              type="button"
              key={id}
              className={abaEspacos === id ? 'aba ativa' : 'aba'}
              aria-pressed={abaEspacos === id}
              onClick={() => setAbaEspacos(id)}
            >
              {grupo.rotulo}
            </button>
          ))}
        </div>

        <div className="espacos">
          {ESPACOS[abaEspacos].itens.map(item => (
            <article key={item.nome} className="espaco">
              <div
                className="espaco-foto"
                style={item.imagem ? { backgroundImage: `url(${item.imagem})` } : undefined}
              >
                {!item.imagem && `Foto: ${item.nome}`}
              </div>
              <div className="espaco-corpo">
                <b>{item.nome}</b>
                <span>{item.meta}</span>
                {item.equipamentos.length > 0 && (
                  <div className="etiquetas">
                    {item.equipamentos.map(e => <i key={e}>{e}</i>)}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="home-secao" id="como-funciona">
        <h2>Como funciona</h2>

        <div className="como">
          <div className="como-lista">
            {PASSOS.map(p => (
              <button
                type="button"
                key={p.id}
                className={passo === p.id ? 'passo-item ativo' : 'passo-item'}
                aria-pressed={passo === p.id}
                onClick={() => setPasso(p.id)}
              >
                <span className="passo-num">{p.id}</span>
                <span>
                  <b>{p.titulo}</b>
                  <small>{p.texto}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="como-ecra">
            {passo === 1 && (
              <div className="previsao">
                <div className="chips">
                  <span className="chip ativo">Sala</span>
                  <span className="chip">Laboratório</span>
                </div>
                <div className="chips">
                  <span className="chip">6 pessoas</span>
                  <span className="chip">2 horas</span>
                  <span className="chip ativo">Projetor</span>
                </div>
                <div className="previsao-botao">Procurar melhores opções</div>
              </div>
            )}

            {passo === 2 && (
              <div className="previsao">
                <div className="linha-opcao"><span className="score alta">92</span><div><b>Sala 2.14</b><small>Edifício preferido</small></div></div>
                <div className="linha-opcao"><span className="score media">85</span><div><b>Sala 1.07</b><small>Lotação exata</small></div></div>
                <div className="linha-opcao"><span className="score baixa">76</span><div><b>Sala 3.02</b><small>Outro edifício</small></div></div>
              </div>
            )}

            {passo === 3 && (
              <div className="previsao">
                <b>Sala 2.14 · Edifício A</b>
                <span>Qua 11/11, 14:00 às 16:00</span>
                <span className="previsao-ok">Reserva confirmada</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Garantias */}
      <section className="home-secao">
        <h2>Pensado para não falhar</h2>
        <div className="garantias">
          {GARANTIAS.map(g => (
            <div key={g.titulo} className="garantia">
              <b>{g.titulo}</b>
              <span>{g.texto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Para quem */}
      <section className="home-secao" id="perfis">
        <h2>Para quem</h2>

        <div className="abas">
          {Object.entries(PERFIS).map(([id, p]) => (
            <button
              type="button"
              key={id}
              className={perfil === id ? 'aba ativa' : 'aba'}
              aria-pressed={perfil === id}
              onClick={() => setPerfil(id)}
            >
              {p.rotulo}
            </button>
          ))}
        </div>

        <div className="perfil">
          <ul className="perfil-pontos">
            {perfilAtual.pontos.map(p => <li key={p}>{p}</li>)}
          </ul>

          <div className="perfil-menu">
            <b>O que vê no menu</b>
            <div className="etiquetas">
              {perfilAtual.menu.map(m => <i key={m}>{m}</i>)}
            </div>
          </div>
        </div>
      </section>

      {/* Perguntas */}
      <section className="home-secao" id="perguntas">
        <h2>Perguntas frequentes</h2>

        <div className="perguntas">
          {PERGUNTAS.map((p, i) => (
            <details key={p.pergunta} open={i === 0}>
              <summary>{p.pergunta}</summary>
              <p>{p.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <h2>Precisa de uma sala para esta semana?</h2>
        <Link className="botao" to={utilizador ? '/nova-reserva' : '/registo'}>
          {utilizador ? 'Ir para a aplicação' : 'Criar conta'}
        </Link>
      </section>

      <footer className="home-rodape">
        <span className="logo">
          Book<span>IT</span>
        </span>
        <span>Projeto académico · Universidade Europeia · {ANO}</span>
      </footer>
    </div>
  )
}