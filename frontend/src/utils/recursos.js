// Nomes para mostrar no ecrã. A base de dados guarda "sala", "lugar", "projetor"...
export const NOMES_TIPO = {
  sala: 'Sala de estudo',
  laboratorio: 'Laboratório',
  equipamento: 'Equipamento',
  lugar: 'Lugar de estudo',
}

export const maiuscula = texto => (texto ? texto[0].toUpperCase() + texto.slice(1) : texto)

// Biblioteca e Receção não são "Edifício X"
export const nomeEdificio = e => (['Biblioteca', 'Receção'].includes(e) ? e : `Edifício ${e}`)