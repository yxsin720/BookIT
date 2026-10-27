import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { entrar } from '../services/loginService'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { iniciarSessao } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [erro, setErro] = useState('')
  const [aEntrar, setAEntrar] = useState(false)

  const mudar = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const submeter = async e => {
    e.preventDefault()
    setErro('')
    setAEntrar(true)
    try {
      const u = await entrar(form.email, form.password)
      iniciarSessao(u)
      navigate('/nova-reserva')
    } catch (err) {
      setErro(err.message)
    } finally {
      setAEntrar(false)
    }
  }

  return (
    <>
      <h1>Entrar</h1>

      <form onSubmit={submeter}>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={e => mudar('email', e.target.value)}
          />
        </label>

        <label>
          Palavra-passe
          <input
            type="password"
            required
            value={form.password}
            onChange={e => mudar('password', e.target.value)}
          />
        </label>

        {erro && <p role="alert">{erro}</p>}

        <button type="submit" disabled={aEntrar}>
          {aEntrar ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
    </>
  )
}