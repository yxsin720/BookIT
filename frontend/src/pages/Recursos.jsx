import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { pedirRecursos, marcarIndisponivel } from '../services/recursosService'
import { maiuscula, NOMES_TIPO, nomeEdificio } from '../utils/recursos'

const unicos = lista => [...new Set(lista)].filter(Boolean).sort()

// Uma fila de botões de filtro (só um fica escolhido)
function Filtro({ rotulo, opcoes, valor, aoEscolher }) {
  return (
    <div>
      <span className="campo-rotulo">{rotulo}</span>
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
    </div>
  )
}

export default function Recursos() {
  const navigate = useNavigate()
  const { utilizador } = useAuth()
  const [recursos, setRecursos] = useState(null)
  const [filtros, setFiltros] = useState({ tipo: '', edificio: '' })

  const podeGerir = ['gestor', 'administrador'].includes(utilizador?.perfil)

  const [erro, setErro] = useState('')

  useEffect(() => {
    pedirRecursos()
      .then(setRecursos)
      .catch(err => {
        setErro(err.message)
        setRecursos([])
      })
  }, [])

  const mudar = (campo, valor) => setFiltros(f => ({ ...f, [campo]: valor }))

  const marcar = async r => {
    if (!window.confirm(`Marcar ${r.nome} como indisponível?`)) return
    await marcarIndisponivel(r.id)
    setRecursos(await pedirRecursos())
  }

  // Os filtros só mostram tipos e edifícios que existem
  const FILTRO_TIPO = [
    { valor: '', nome: 'Todos' },
    ...unicos((recursos ?? []).map(r => r.tipo)).map(t => ({ valor: t, nome: NOMES_TIPO[t] ?? maiuscula(t) })),
  ]
  const FILTRO_EDIFICIO = [
    { valor: '', nome: 'Todos' },
    ...unicos((recursos ?? []).map(r => r.edificio)).map(e => ({ valor: e, nome: nomeEdificio(e) })),
  ]

  const visiveis = recursos
    ? recursos.filter(
        r =>
          (filtros.tipo === '' || r.tipo === filtros.tipo) &&
          (filtros.edificio === '' || r.edificio === filtros.edificio)
      )
    : null

  return (
    <>
      <h1>Recursos</h1>
      <p className="subtitulo">Salas, laboratórios e equipamento da universidade.</p>

      <div className="filtros">
        <Filtro rotulo="Tipo" opcoes={FILTRO_TIPO} valor={filtros.tipo} aoEscolher={v => mudar('tipo', v)} />
        <Filtro
          rotulo="Edifício"
          opcoes={FILTRO_EDIFICIO}
          valor={filtros.edificio}
          aoEscolher={v => mudar('edificio', v)}
        />
      </div>

      {erro && <p role="alert">{erro}</p>}

      {visiveis === null ? (
        <p>A carregar recursos…</p>
      ) : visiveis.length === 0 ? (
        <p>Nenhum recurso com estes filtros.</p>
      ) : (
        <div className="recursos-grelha">
          {visiveis.map(r => {
            const disponivel = r.estado === 'disponivel'
            return (
              <article key={r.id} className={`espaco recurso ${disponivel ? '' : 'indisponivel'}`}>
                <div className="espaco-corpo">
                  <b>{r.nome}</b>
                  <span className="recurso-meta">
                    {NOMES_TIPO[r.tipo] ?? r.tipo} · {nomeEdificio(r.edificio)}
                    {r.tipo !== 'equipamento' && ` · até ${r.capacidade} pessoas`}
                  </span>
                  {r.equipamentos.length > 0 && (
                    <div className="etiquetas">
                      {r.equipamentos.map(e => (
                        <i key={e}>{maiuscula(e)}</i>
                      ))}
                    </div>
                  )}
                </div>

                <div className="recurso-rodape">
                  <span className={`estado ${disponivel ? 'ativo' : 'em-baixo'}`}>
                    {disponivel ? 'Disponível' : 'Indisponível'}
                  </span>

                  {disponivel && (
                    <div className="acoes">
                      {podeGerir && (
                        <button type="button" className="secundario" onClick={() => marcar(r)}>
                          Marcar indisponível
                        </button>
                      )}
                      {/* MUDOU: o material não se reserva aqui por enquanto */}
                      {r.tipo === 'equipamento' ? (
                        <span className="recurso-meta">Reserva de material em breve</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate('/nova-reserva', { state: { tipo: r.tipo } })}
                        >
                          Reservar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}