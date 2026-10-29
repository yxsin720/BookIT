const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const doisDigitos = n => String(n).padStart(2, '0')

const hora = d => `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`

export const formatarData = iso =>
  new Date(iso).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

export const formatarHora = iso =>
  new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

export function formatarIntervalo(inicio, fim) {
  const i = new Date(inicio)
  const f = new Date(fim)
  return `${DIAS[i.getDay()]} ${doisDigitos(i.getDate())}/${doisDigitos(i.getMonth() + 1)}, ${hora(i)} - ${hora(f)}`
}