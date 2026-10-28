import { useEffect, useState } from 'react'
import { pedirEstado } from '../services/estadoService'
import { formatarHora } from '../utils/datas'

export default function EstadoSistema() {
  const [estado, setEstado] = useState(null)

  useEffect(() => {
    pedirEstado().then(setEstado)
  }, [])

  return (
    <>
      <h1>Estado do sistema</h1>

      {estado === null
        ? <p>A verificar o sistema…</p>
        : (
          <>
            <p>Atualizado às {formatarHora(estado.atualizado_em)}</p>

            {estado.componentes.map(c => (
              <div key={c.id} className="card">
                <h2>{c.nome}</h2>
                <p>
                  <span className={c.estado === 'ativo' ? 'estado ativo' : 'estado em-baixo'}>
                    {c.estado === 'ativo' ? 'Ativo' : 'Em baixo'}
                  </span>
                </p>
                <p>{c.latencia_ms === null ? 'Sem resposta' : `${c.latencia_ms} ms`}</p>
              </div>
            ))}
          </>
        )}
    </>
  )
}