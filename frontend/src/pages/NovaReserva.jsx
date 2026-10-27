import { useState } from 'react'

export default function NovaReserva() {
  const [pedido, setPedido] = useState({
    tipo: 'sala',
    n_pessoas: 6,
    duracao_min: 120,
    data_inicio: '',
    data_fim: '',
    periodo: 'tarde',
    edificio: '',
  })

  const mudar = (campo, valor) => setPedido(p => ({ ...p, [campo]: valor }))

  return (
    <>
      <h1>Nova reserva</h1>
      <p className="subtitulo">Diga-nos o que precisa e o BookIT sugere as melhores opções.</p>

      <form>
        <label>
          Tipo de recurso
          <select value={pedido.tipo} onChange={e => mudar('tipo', e.target.value)}>
            <option value="sala">Sala de estudo</option>
            <option value="laboratorio">Laboratório</option>
            <option value="equipamento">Equipamento</option>
            <option value="lugar">Lugar de estudo</option>
          </select>
        </label>

        <label>
          N.º de pessoas
          <input
            type="number"
            min="1"
            value={pedido.n_pessoas}
            onChange={e => mudar('n_pessoas', Number(e.target.value))}
          />
        </label>

        <label>
          Duração
          <select value={pedido.duracao_min} onChange={e => mudar('duracao_min', Number(e.target.value))}>
            <option value={60}>1 hora</option>
            <option value={120}>2 horas</option>
            <option value={180}>3 horas</option>
          </select>
        </label>

        <label>
          Data inicial
          <input
            type="date"
            value={pedido.data_inicio}
            onChange={e => mudar('data_inicio', e.target.value)}
          />
        </label>

        <label>
          Data final (janela de pesquisa)
          <input
            type="date"
            min={pedido.data_inicio}
            value={pedido.data_fim}
            onChange={e => mudar('data_fim', e.target.value)}
          />
        </label>

        <label>
          Horário preferido
          <select value={pedido.periodo} onChange={e => mudar('periodo', e.target.value)}>
            <option value="manha">Manhã (8h–12h)</option>
            <option value="tarde">Tarde (14h–18h)</option>
            <option value="qualquer">Qualquer</option>
          </select>
        </label>

        <label>
          Edifício preferido (opcional)
          <select value={pedido.edificio} onChange={e => mudar('edificio', e.target.value)}>
            <option value="">Sem preferência</option>
            <option value="A">Edifício A</option>
            <option value="B">Edifício B</option>
            <option value="Biblioteca">Biblioteca</option>
          </select>
        </label>
      </form>

      <pre>{JSON.stringify(pedido, null, 2)}</pre>
    </>
  )
}