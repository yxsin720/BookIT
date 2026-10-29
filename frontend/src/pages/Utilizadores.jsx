import { useEffect, useState } from 'react'
import { pedirUtilizadores, alterarPerfil } from '../services/utilizadoresService'

export default function Utilizadores() {
  const [utilizadores, setUtilizadores] = useState(null)

  useEffect(() => {
    pedirUtilizadores().then(setUtilizadores)
  }, [])

  const mudarPerfil = async (id, perfil) => {
    await alterarPerfil(id, perfil)
    setUtilizadores(await pedirUtilizadores())
  }

  return (
    <>
      <h1>Utilizadores</h1>

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
              {utilizadores.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.perfil} onChange={e => mudarPerfil(u.id, e.target.value)}>
                      <option value="utilizador">Utilizador</option>
                      <option value="gestor">Gestor</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </>
  )
}