import { useEffect, useState } from 'react'
import { pedirRecursos } from '../services/recursosService'

export default function Recursos() {
  const [recursos, setRecursos] = useState(null)
  const [filtros, setFiltros] = useState({ tipo: '', edificio: '' })

  useEffect(() => {
    pedirRecursos().then(setRecursos)
  }, [])

  const mudar = (campo, valor) => setFiltros(f => ({ ...f, [campo]: valor }))

  const visiveis = recursos?.filter(r =>
    (filtros.tipo === '' || r.tipo === filtros.tipo) &&
    (filtros.edificio === '' || r.edificio === filtros.edificio)
  )

  return (
    <>
      <h1>Recursos</h1>

      <label>
        Tipo
        <select value={filtros.tipo} onChange={e => mudar('tipo', e.target.value)}>
          <option value="">Todos</option>
          <option value="sala">Sala de estudo</option>
          <option value="laboratorio">Laboratório</option>
          <option value="equipamento">Equipamento</option>
        </select>
      </label>

      <label>
        Edifício
        <select value={filtros.edificio} onChange={e => mudar('edificio', e.target.value)}>
          <option value="">Todos</option>
          <option value="A">Edifício A</option>
          <option value="B">Edifício B</option>
          <option value="Biblioteca">Biblioteca</option>
        </select>
      </label>

      {visiveis === undefined
        ? <p>A carregar recursos…</p>
        : visiveis.length === 0
          ? <p>Nenhum recurso com estes filtros.</p>
          : visiveis.map(r => (
              <div key={r.id} className="card">
                <h2>{r.nome}</h2>
                <p>{r.tipo} · {r.edificio} · capacidade {r.capacidade}</p>
                {r.equipamentos.length > 0 && <p>Equipamento: {r.equipamentos.join(', ')}</p>}
                <p>{r.estado === 'disponivel' ? 'Disponível' : 'Indisponível'}</p>
              </div>
            ))}
    </>
  )
}