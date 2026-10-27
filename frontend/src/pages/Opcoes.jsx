import { useLocation } from 'react-router-dom'

export default function Opcoes() {
  const { state } = useLocation()

  return (
    <>
      <h1>Opções recomendadas</h1>
      <p className="subtitulo">Estas são as melhores opções para o seu pedido.</p>
      <pre>{JSON.stringify(state?.pedido, null, 2)}</pre>
    </>
  )
}