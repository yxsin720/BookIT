import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { pedirUtilizadores, alterarPerfil } from '../services/utilizadoresService'

export default function Utilizadores() {
  const { utilizador: eu } = useAuth()
  const [utilizadores, setUtilizadores] = useState(null)

  useEffect(() => {
    pedirUtilizadores().then(setUtilizadores)
  }, [])

  const mudarPerfil = async (id, perfil) => {
    if (id === eu?.id) return
    await alterarPerfil(id, perfil)
    setUtilizadores(await pedirUtilizadores())
  }

  return (
    <>
      <h1>Utilizadores</h1>
      <p className="subtitulo">Gira as contas e os perfis de acesso.</p>

      {utilizadores === null
        ? <p>A carregar utilizadores…</p>
        : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
              </tr>
            </thead>
            <tbody>
              {utilizadores.map(u => {
                const souEu = u.id === eu?.id
                return (
                  <tr key={u.id}>
                    <td>
                      {u.nome}
                      {souEu && <span className="etiqueta">Você</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.perfil}
                        disabled={souEu}
                        title={souEu ? 'Não pode alterar o seu próprio perfil' : undefined}
                        aria-label={`Perfil de ${u.nome}`}
                        onChange={e => mudarPerfil(u.id, e.target.value)}
                      >
                        <option value="utilizador">Utilizador</option>
                        <option value="gestor">Gestor</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
    </>
  )
}