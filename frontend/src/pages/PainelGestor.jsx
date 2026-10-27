import { useEffect, useState } from 'react'
import { pedirPainel } from '../services/painelService'
import { pedirRecursos, marcarIndisponivel } from '../services/recursosService'

const formatarData = iso =>
  new Date(iso).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

const formatarHora = iso =>
  new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

export default function PainelGestor() {
  const [painel, setPainel] = useState(null)
  const [recursos, setRecursos] = useState(null)

  useEffect(() => {
    pedirPainel().then(setPainel)
    pedirRecursos().then(setRecursos)
  }, [])

  const marcar = async id => {
    if (!window.confirm('Marcar este recurso como indisponível?')) return
    await marcarIndisponivel(id)
    setRecursos(await pedirRecursos())
  }

  return (
    <>
      <h1>Painel do gestor</h1>

      {painel === null || recursos === null
        ? <p>A carregar painel…</p>
        : (
          <>
            <div>
              <div className="card">
                <p><strong>{painel.indicadores.reservas_ativas}</strong></p>
                <p>Reservas ativas</p>
              </div>
              <div className="card">
                <p><strong>{painel.indicadores.ocupacao_pct}%</strong></p>
                <p>Ocupação</p>
              </div>
              <div className="card">
                <p><strong>{recursos.filter(r => r.estado === 'indisponivel').length}</strong></p>
                <p>Recursos indisponíveis</p>
              </div>
            </div>

            <h2>Recursos</h2>

            {recursos.map(r => (
              <div key={r.id} className="card">
                <h3>{r.nome}</h3>
                <p>{r.estado === 'disponivel' ? 'Disponível' : 'Indisponível'}</p>
                {r.estado === 'disponivel' && (
                  <button type="button" onClick={() => marcar(r.id)}>Marcar indisponível</button>
                )}
              </div>
            ))}

            <h2>Reservas reatribuídas</h2>

            {painel.reatribuicoes.length === 0
              ? <p>Ainda não houve reatribuições.</p>
              : painel.reatribuicoes.map(r => (
                  <div key={r.id} className="card">
                    <h3>{r.utilizador}</h3>
                    <p>{r.de} → {r.para}</p>
                    <p>{formatarData(r.inicio)}, das {formatarHora(r.inicio)} às {formatarHora(r.fim)}</p>
                    <p>Motivo: {r.motivo}</p>
                  </div>
                ))}
          </>
        )}
    </>
  )
}