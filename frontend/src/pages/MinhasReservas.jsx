import { useEffect, useState } from 'react'
import { pedirReservas, cancelarReserva } from '../services/reservasService'
import { formatarData, formatarHora } from '../utils/datas'

export default function MinhasReservas() {
  const [reservas, setReservas] = useState(null)

  useEffect(() => {
    pedirReservas().then(setReservas)
  }, [])

  const cancelar = async id => {
    if (!window.confirm('Cancelar esta reserva?')) return
    await cancelarReserva(id)
    setReservas(await pedirReservas())
  }

  return (
    <>
      <h1>As minhas reservas</h1>

      {reservas === null
        ? <p>A carregar reservas…</p>
        : reservas.length === 0
          ? <p>Ainda não tem reservas.</p>
          : reservas.map(r => (
              <div key={r.id} className="card">
                <h2>{r.nome}</h2>
                <p>{formatarData(r.inicio)}, das {formatarHora(r.inicio)} às {formatarHora(r.fim)}</p>
                <p>{r.n_pessoas} pessoas · {r.estado}</p>
                {r.estado === 'confirmada' && (
                  <button type="button" onClick={() => cancelar(r.id)}>Cancelar</button>
                )}
              </div>
            ))}
    </>
  )
}