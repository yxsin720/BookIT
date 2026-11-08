import { useEffect, useState } from 'react'
import { pedirReservas, cancelarReserva } from '../services/reservasService'
import { formatarData, formatarHora } from '../utils/datas'

const ABAS = [
  { valor: 'proximas', nome: 'Próximas' },
  { valor: 'passadas', nome: 'Passadas' },
  { valor: 'canceladas', nome: 'Canceladas' },
]

const VAZIO = {
  proximas: 'Não tem reservas próximas.',
  passadas: 'Ainda não tem reservas passadas.',
  canceladas: 'Não tem reservas canceladas.',
}

const ESTADOS = {
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  reatribuida: 'Reatribuída',
}

// Em que separador fica cada reserva
function separador(r, agora) {
  if (r.estado === 'cancelada') return 'canceladas'
  return new Date(r.fim).getTime() < agora ? 'passadas' : 'proximas'
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState(null)
  const [aba, setAba] = useState('proximas')
  const [agora] = useState(() => Date.now())

  useEffect(() => {
    pedirReservas().then(setReservas)
  }, [])

  const cancelar = async id => {
    if (!window.confirm('Cancelar esta reserva?')) return
    await cancelarReserva(id)
    setReservas(await pedirReservas())
  }

  let visiveis = []
  const contar = valor => (reservas ? reservas.filter(r => separador(r, agora) === valor).length : 0)

  if (reservas) {
    visiveis = reservas
      .filter(r => separador(r, agora) === aba)
      .sort((a, b) =>
        aba === 'proximas'
          ? new Date(a.inicio) - new Date(b.inicio)
          : new Date(b.inicio) - new Date(a.inicio)
      )
  }

  return (
    <>
      <h1>As minhas reservas</h1>
      <p className="subtitulo">Veja as suas reservas e cancele, se precisar.</p>

      {reservas === null ? (
        <p>A carregar reservas…</p>
      ) : (
        <>
          <div className="abas">
            {ABAS.map(a => (
              <button
                type="button"
                key={a.valor}
                className={aba === a.valor ? 'aba ativa' : 'aba'}
                aria-pressed={aba === a.valor}
                onClick={() => setAba(a.valor)}
              >
                {a.nome} ({contar(a.valor)})
              </button>
            ))}
          </div>

          {visiveis.length === 0 ? (
            <p>{VAZIO[aba]}</p>
          ) : (
            visiveis.map(r => (
              <article key={r.id} className={`card minha-reserva ${r.estado === 'cancelada' ? 'apagada' : ''}`}>
                <div
                  className="opcao-foto"
                  style={r.imagem ? { backgroundImage: `url(${r.imagem})` } : undefined}
                >
                  {!r.imagem && 'Foto'}
                </div>

                <div className="minha-corpo">
                  <h2>
                    {r.nome}
                    <span className={`estado ${r.estado}`}>{ESTADOS[r.estado] ?? r.estado}</span>
                  </h2>
                  <p>{formatarData(r.inicio)}, das {formatarHora(r.inicio)} às {formatarHora(r.fim)}</p>
                  <p>{r.n_pessoas} {r.n_pessoas === 1 ? 'pessoa' : 'pessoas'}</p>

                  {r.reatribuida_de && (
                    <p className="aviso-reatribuida">
                      Mudámos a sua reserva de {r.reatribuida_de}
                      {r.motivo && ` (${r.motivo})`}.
                    </p>
                  )}
                </div>

                {r.estado === 'confirmada' && aba === 'proximas' && (
                  <button type="button" className="secundario" onClick={() => cancelar(r.id)}>
                    Cancelar
                  </button>
                )}
              </article>
            ))
          )}
        </>
      )}
    </>
  )
}