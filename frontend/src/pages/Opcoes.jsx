import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { pedirOpcoes } from '../services/opcoesService'
import { criarReserva } from '../services/reservasService'
import { formatarIntervalo } from '../utils/datas'

const PESOS =
  'Pesos do score: preferência de local 30% · ajuste da capacidade 30% · ocupação do horário 20% · continuidade com reservas anteriores 20%'

function resumirPedido(p) {
  const partes = [
    `${p.n_pessoas} ${p.n_pessoas === 1 ? 'pessoa' : 'pessoas'}`,
    `${p.duracao_min / 60} ${p.duracao_min === 60 ? 'hora' : 'horas'}`,
  ]
  if (p.equipamentos.length > 0) partes.push(p.equipamentos.join(', ').toLowerCase())
  return partes.join(' · ')
}

// Cor do círculo da pontuação
function classeScore(score) {
  if (score >= 90) return 'alta'
  if (score >= 80) return 'media'
  return 'baixa'
}

export default function Opcoes() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const pedido = state?.pedido

  const [resultado, setResultado] = useState(null)
  const [aReservar, setAReservar] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (pedido) pedirOpcoes(pedido).then(setResultado)
  }, [pedido])

  // quem abre /opcoes sem passar pelo formulário volta à Nova reserva
  if (!pedido) return <Navigate to="/nova-reserva" replace />

  const reservar = async opcao => {
    setAReservar(true)
    setErro('')
    try {
      await criarReserva(opcao, pedido)
      navigate('/minhas-reservas')
    } catch (err) {
      setErro(err.message)
    } finally {
      setAReservar(false)
    }
  }

  return (
    <>
      <h1>Opções recomendadas</h1>

      {resultado === null ? (
        <p className="subtitulo">A calcular as melhores opções…</p>
      ) : (
        <>
          <p className="subtitulo">
            {resumirPedido(pedido)} · {resultado.analisadas} combinações analisadas em{' '}
            {(resultado.tempo_ms / 1000).toFixed(1).replace('.', ',')} s
          </p>

          {erro && <p role="alert">{erro}</p>}

          {resultado.opcoes.map((o, i) => (
            <article key={o.recurso_id} className={`card opcao ${i === 0 ? 'destaque' : ''}`}>
              <div className={`score ${classeScore(o.score)}`}>{o.score}</div>

              <div className="opcao-info">
                <h2>
                  {o.nome}
                  {i === 0 && <span className="etiqueta">Melhor opção</span>}
                </h2>
                <p>
                  {formatarIntervalo(o.inicio, o.fim)} · capacidade {o.capacidade} · {o.equipamentos.join(', ')}
                </p>
                <small>{o.motivos.join(' · ')}</small>
              </div>

              <button disabled={aReservar} onClick={() => reservar(o)}>Reservar</button>
            </article>
          ))}

          <p className="pesos">{PESOS}</p>
        </>
      )}
    </>
  )
}