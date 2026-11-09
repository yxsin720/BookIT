import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { pedirRecursos } from '../services/recursosService'
import { maiuscula, NOMES_TIPO, nomeEdificio } from '../utils/recursos'

const DURACOES = [
  { valor: 60, nome: '1 hora' },
  { valor: 120, nome: '2 horas' },
  { valor: 180, nome: '3 horas' },
]

const PERIODOS = [
  { valor: 'manha', nome: 'Manhã (8h–12h)' },
  { valor: 'tarde', nome: 'Tarde (14h–18h)' },
  { valor: 'qualquer', nome: 'Qualquer' },
]

const PEDIDO_INICIAL = {
  n_pessoas: 6,
  duracao_min: 120,
  data_inicio: '',
  data_fim: '',
  periodo: 'tarde',
  edificio: '',
  equipamentos: [],
}

// ---- datas (formato AAAA-MM-DD, como o input type="date" usa) ----
const dois = n => String(n).padStart(2, '0')
const formatar = d => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`
const somarDias = (d, dias) => {
  const nova = new Date(d)
  nova.setDate(nova.getDate() + dias)
  return nova
}
const curto = iso => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// Fila de botões onde só um fica escolhido
function Chips({ opcoes, valor, aoEscolher }) {
  return (
    <div className="chips">
      {opcoes.map(o => (
        <button
          type="button"
          key={o.valor}
          className={valor === o.valor ? 'chip ativo' : 'chip'}
          aria-pressed={valor === o.valor}
          onClick={() => aoEscolher(o.valor)}
        >
          {o.nome}
        </button>
      ))}
    </div>
  )
}

export default function NovaReserva() {
  const navigate = useNavigate()
  const { state } = useLocation()
  // "Reservar" na página Recursos já traz o tipo escolhido
  const [pedido, setPedido] = useState(() => ({ ...PEDIDO_INICIAL, tipo: state?.tipo ?? 'sala' }))
  const [recursos, setRecursos] = useState([])

  // As opções do formulário vêm dos recursos que existem mesmo na base de dados
  useEffect(() => {
    pedirRecursos().then(setRecursos).catch(() => setRecursos([]))
  }, [])

  const ativos = recursos.filter(r => r.ativo)
  const unicos = lista => [...new Set(lista)].sort()
  const TIPOS = unicos([...ativos.map(r => r.tipo), pedido.tipo]).map(t => ({
    valor: t,
    nome: NOMES_TIPO[t] ?? maiuscula(t),
  }))
  const doTipo = ativos.filter(r => r.tipo === pedido.tipo)
  const EQUIPAMENTOS = unicos(doTipo.flatMap(r => r.equipamentos))
  const EDIFICIOS = [
    { valor: '', nome: 'Sem preferência' },
    ...unicos(doTipo.map(r => r.edificio).filter(Boolean)).map(e => ({ valor: e, nome: nomeEdificio(e) })),
  ]

  const mudar = (campo, valor) => setPedido(p => ({ ...p, [campo]: valor }))

  const alternar = nome => {
    const jaEscolhido = pedido.equipamentos.includes(nome)
    const novaLista = jaEscolhido
      ? pedido.equipamentos.filter(e => e !== nome)
      : [...pedido.equipamentos, nome]
    mudar('equipamentos', novaLista)
  }

  const limpar = () => setPedido({ ...PEDIDO_INICIAL, tipo: 'sala' })

  const procurar = e => {
    e.preventDefault()
    navigate('/opcoes', { state: { pedido } })
  }

  // atalhos de data
  const hoje = new Date()
  const hojeTexto = formatar(hoje)
  const ATALHOS = [
    { nome: 'Hoje', inicio: hojeTexto, fim: hojeTexto },
    { nome: 'Amanhã', inicio: formatar(somarDias(hoje, 1)), fim: formatar(somarDias(hoje, 1)) },
    { nome: 'Próximos 7 dias', inicio: hojeTexto, fim: formatar(somarDias(hoje, 7)) },
  ]

  // texto do resumo
  let quando = 'Escolha a data'
  if (pedido.data_inicio) {
    quando =
      pedido.data_fim && pedido.data_fim !== pedido.data_inicio
        ? `${curto(pedido.data_inicio)} a ${curto(pedido.data_fim)}`
        : curto(pedido.data_inicio)
  }
  const tipoEscolhido = TIPOS.find(t => t.valor === pedido.tipo) ?? { nome: pedido.tipo }
  const periodoEscolhido = PERIODOS.find(p => p.valor === pedido.periodo)
  const edificioEscolhido = EDIFICIOS.find(e => e.valor === pedido.edificio)
  const duracaoEscolhida = DURACOES.find(d => d.valor === pedido.duracao_min)

  return (
    <>
      <h1>Nova reserva</h1>
      <p className="subtitulo">Diga-nos o que precisa e o BookIT sugere as melhores opções.</p>

      <form className="reserva" onSubmit={procurar}>
        <div className="reserva-grid">
          <section className="reserva-blocos">
            {/* 1. O que reservar */}
            <section className="reserva-bloco">
              <h2><span>1</span> O que quer reservar?</h2>

              <Chips
                opcoes={TIPOS}
                valor={pedido.tipo}
                // ao mudar de tipo, o equipamento e o edifício escolhidos podem já não existir
                aoEscolher={v => setPedido(p => ({ ...p, tipo: v, equipamentos: [], edificio: '' }))}
              />

              <div className="campo">
                <span className="campo-rotulo">Quantas pessoas?</span>
                <div className="contador">
                  <button
                    type="button"
                    className="contador-btn"
                    aria-label="Menos uma pessoa"
                    onClick={() => mudar('n_pessoas', Math.max(1, pedido.n_pessoas - 1))}
                  >
                    −
                  </button>
                  <strong>{pedido.n_pessoas}</strong>
                  <button
                    type="button"
                    className="contador-btn"
                    aria-label="Mais uma pessoa"
                    onClick={() => mudar('n_pessoas', Math.min(30, pedido.n_pessoas + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Para quando */}
            <section className="reserva-bloco">
              <h2><span>2</span> Para quando?</h2>

              <div className="campo">
                <span className="campo-rotulo">Atalhos</span>
                <div className="chips">
                  {ATALHOS.map(a => {
                    const ativo = pedido.data_inicio === a.inicio && pedido.data_fim === a.fim
                    return (
                      <button
                        type="button"
                        key={a.nome}
                        className={ativo ? 'chip ativo' : 'chip'}
                        aria-pressed={ativo}
                        onClick={() => setPedido(p => ({ ...p, data_inicio: a.inicio, data_fim: a.fim }))}
                      >
                        {a.nome}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="campo datas">
                <label>
                  Data inicial
                  <input
                    type="date"
                    required
                    min={hojeTexto}
                    value={pedido.data_inicio}
                    onChange={e => mudar('data_inicio', e.target.value)}
                  />
                </label>
                <label>
                  Data final (janela de pesquisa)
                  <input
                    type="date"
                    min={pedido.data_inicio || hojeTexto}
                    value={pedido.data_fim}
                    onChange={e => mudar('data_fim', e.target.value)}
                  />
                </label>
              </div>

              <div className="campo">
                <span className="campo-rotulo">Duração</span>
                <Chips
                  opcoes={DURACOES}
                  valor={pedido.duracao_min}
                  aoEscolher={v => mudar('duracao_min', v)}
                />
              </div>

              <div className="campo">
                <span className="campo-rotulo">Horário preferido</span>
                <Chips
                  opcoes={PERIODOS}
                  valor={pedido.periodo}
                  aoEscolher={v => mudar('periodo', v)}
                />
              </div>

              <div className="campo">
                <span className="campo-rotulo">Edifício preferido (opcional)</span>
                <Chips
                  opcoes={EDIFICIOS}
                  valor={pedido.edificio}
                  aoEscolher={v => mudar('edificio', v)}
                />
              </div>
            </section>

            {/* 3. Equipamento */}
            <section className="reserva-bloco">
              <h2><span>3</span> Precisa de equipamento?</h2>
              {EQUIPAMENTOS.length === 0 && <p className="subtitulo">Este tipo não tem equipamento para escolher.</p>}
              <div className="chips">
                {EQUIPAMENTOS.map(nome => {
                  const ativo = pedido.equipamentos.includes(nome)
                  return (
                    <button
                      type="button"
                      key={nome}
                      className={ativo ? 'chip ativo' : 'chip'}
                      aria-pressed={ativo}
                      onClick={() => alternar(nome)}
                    >
                      {maiuscula(nome)}
                    </button>
                  )
                })}
              </div>
            </section>
          </section>

          {/* Resumo ao lado */}
          <aside className="reserva-resumo">
            <h2>O seu pedido</h2>
            <dl className="resumo-lista">
              <div><dt>Tipo</dt><dd>{tipoEscolhido.nome}</dd></div>
              <div><dt>Pessoas</dt><dd>{pedido.n_pessoas}</dd></div>
              <div><dt>Quando</dt><dd>{quando}</dd></div>
              <div><dt>Duração</dt><dd>{duracaoEscolhida.nome}</dd></div>
              <div><dt>Horário</dt><dd>{periodoEscolhido.nome}</dd></div>
              <div><dt>Edifício</dt><dd>{edificioEscolhido?.nome ?? pedido.edificio}</dd></div>
              <div>
                <dt>Equipamento</dt>
                <dd>{pedido.equipamentos.length ? pedido.equipamentos.map(maiuscula).join(', ') : 'Nenhum'}</dd>
              </div>
            </dl>
            <button type="submit">Procurar melhores opções</button>
            <button type="button" className="secundario" onClick={limpar}>Limpar</button>
          </aside>
        </div>
      </form>
    </>
  )
}