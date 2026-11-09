import { useEffect, useState } from 'react'
import { pedirPainel } from '../services/painelService'
import { pedirRecursos, marcarIndisponivel } from '../services/recursosService'
import { formatarData, formatarHora } from '../utils/datas'

const nomeEdificio = e => (e === 'Biblioteca' ? 'Biblioteca' : `Edifício ${e}`)

export default function PainelGestor() {
  const [painel, setPainel] = useState(null)
  const [recursos, setRecursos] = useState(null)

  useEffect(() => {
    pedirPainel().then(setPainel)
    pedirRecursos().then(setRecursos)
  }, [])

  const marcar = async r => {
    if (!window.confirm(`Marcar ${r.nome} como indisponível?`)) return
    await marcarIndisponivel(r.id)
    setRecursos(await pedirRecursos())
  }

  return (
    <>
      <h1>Painel do gestor</h1>
      <p className="subtitulo">Estado dos recursos e das reservas, num só sítio.</p>

      {painel === null || recursos === null ? (
        <p>A carregar painel…</p>
      ) : (
        <>
          {/* Números principais */}
          <div className="indicadores">
            <div className="card">
              <span>Ocupação</span>
              <strong>{painel.indicadores.ocupacao_pct}%</strong>
            </div>
            <div className="card">
              <span>Reservas ativas</span>
              <strong>{painel.indicadores.reservas_ativas}</strong>
            </div>
            <div className={`card ${recursos.some(r => r.estado === 'indisponivel') ? 'alerta' : ''}`}>
              <span>Recursos indisponíveis</span>
              <strong>{recursos.filter(r => r.estado === 'indisponivel').length}</strong>
            </div>
          </div>

          {/* Recursos (os indisponíveis aparecem primeiro) */}
          <h2>Recursos</h2>

          {[...recursos]
            .sort((a, b) => (a.estado === 'indisponivel' ? 0 : 1) - (b.estado === 'indisponivel' ? 0 : 1))
            .map(r => {
              const disponivel = r.estado === 'disponivel'
              return (
                <div key={r.id} className="card painel-linha">

                  <div className="painel-nome">
                    <b>{r.nome}</b>
                    <small>{nomeEdificio(r.edificio)}</small>
                  </div>

                  <span className={`estado ${disponivel ? 'ativo' : 'em-baixo'}`}>
                    {disponivel ? 'Disponível' : 'Indisponível'}
                  </span>

                  {disponivel && (
                    <button type="button" className="secundario" onClick={() => marcar(r)}>
                      Marcar indisponível
                    </button>
                  )}
                </div>
              )
            })}

          {/* Reservas que mudaram de sala */}
          <h2>Reatribuídas recentemente</h2>

          {painel.reatribuicoes.length === 0 ? (
            <p>Ainda não houve reatribuições.</p>
          ) : (
            painel.reatribuicoes.map(r => (
              <div key={r.id} className="card hist-item">
                <div>
                  <b>{r.utilizador}</b> · {r.de} → {r.para}
                  <small>
                    {formatarData(r.inicio)}, das {formatarHora(r.inicio)} às {formatarHora(r.fim)}
                  </small>
                </div>
                <span className="estado reatribuida">{r.motivo}</span>
              </div>
            ))
          )}
        </>
      )}
    </>
  )
}