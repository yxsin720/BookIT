import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { pedirRecursos, marcarIndisponivel } from '../services/recursosService'

const NOMES_TIPO = {
  sala: 'Sala de estudo',
  laboratorio: 'Laboratório',
  equipamento: 'Equipamento',
  lugar: 'Lugar de estudo',
}

const FILTRO_TIPO = [
  { valor: '', nome: 'Todos' },
  { valor: 'sala', nome: 'Salas' },
  { valor: 'laboratorio', nome: 'Laboratórios' },
  { valor: 'equipamento', nome: 'Equipamento' },
]

const FILTRO_EDIFICIO = [
  { valor: '', nome: 'Todos' },
  { valor: 'A', nome: 'Edifício A' },
  { valor: 'B', nome: 'Edifício B' },
  { valor: 'Biblioteca', nome: 'Biblioteca' },
]

const nomeEdificio = e => (e === 'Biblioteca' ? 'Biblioteca' : `Edifício ${e}`)

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

  useEffect(() => {
    pedirRecursos().then(setRecursos)
  }, [])

  const mudar = (campo, valor) => setFiltros(f => ({ ...f, [campo]: valor }))

  const marcar = async r => {
    if (!window.confirm(`Marcar ${r.nome} como indisponível?`)) return
    await marcarIndisponivel(r.id)
    setRecursos(await pedirRecursos())
  }

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
                <div
                  className="espaco-foto"
                  style={r.imagem ? { backgroundImage: `url(${r.imagem})` } : undefined}
                >
                  {!r.imagem && 'Foto'}
                </div>

                <div className="espaco-corpo">
                  <b>{r.nome}</b>
                  <span className="recurso-meta">
                    {NOMES_TIPO[r.tipo] ?? r.tipo} · {nomeEdificio(r.edificio)}
                    {r.tipo !== 'equipamento' && ` · até ${r.capacidade} pessoas`}
                  </span>
                  {r.equipamentos.length > 0 && (
                    <div className="etiquetas">
                      {r.equipamentos.map(e => (
                        <i key={e}>{e}</i>
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
                      <button
                        type="button"
                        onClick={() => navigate('/nova-reserva', { state: { tipo: r.tipo } })}
                      >
                        Reservar
                      </button>
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