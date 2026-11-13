// Nomes para mostrar no ecrã. A base de dados guarda "sala", "lugar", "projetor"...
export const NOMES_TIPO = {
  sala: 'Sala de estudo',
  laboratorio: 'Laboratório',
  equipamento: 'Equipamento',
  lugar: 'Lugar de estudo',
}

export const maiuscula = texto => (texto ? texto[0].toUpperCase() + texto.slice(1) : texto)

export const nomeEdificio = e => (e === 'Biblioteca' ? 'Biblioteca' : `Edifício ${e}`)
