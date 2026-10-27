import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { pedirOpcoes } from '../services/opcoesService'
import { criarReserva } from '../services/reservasService'

const formatarData = iso =>
  new Date(iso).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

const formatarHora = iso =>
  new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

export default function Opcoes() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    pedirOpcoes(state?.pedido).then(setResultado)
  }, [state])

  const reservar = async opcao => {
    await criarReserva(opcao, state.pedido)
    navigate('/minhas-reservas')
  }

  return (
    <>
      <h1>Opções recomendadas</h1>
      <p className="subtitulo">Estas são as melhores opções para o seu pedido.</p>

      {resultado === null
        ? <p>A calcular as melhores opções…</p>
        : (
          <div>
            <p>{resultado.analisadas} combinações analisadas em {resultado.tempo_ms} ms</p>

            {resultado.opcoes.map(o => (
              <div key={o.recurso_id} className="card">
                <h2>{o.nome}</h2>
                <p>Pontuação: {o.score}</p>
                <p>{formatarData(o.inicio)}, das {formatarHora(o.inicio)} às {formatarHora(o.fim)}</p>
                <p>Capacidade: {o.capacidade} pessoas</p>
                <p>{o.motivos.join(' · ')}</p>
                <button type="button" onClick={() => reservar(o)}>Reservar</button>
              </div>
            ))}
          </div>
        )}
    </>
  )
}