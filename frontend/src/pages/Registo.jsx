import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { criarUtilizador } from '../services/utilizadoresService'
import { useAuth } from '../context/AuthContext.jsx'

export default function Registo() {
  const navigate = useNavigate()
  const { iniciarSessao } = useAuth()
  const [form, setForm] = useState({ nome: '', email: '', password: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [aCriar, setACriar] = useState(false)

  const mudar = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const submeter = async e => {
    e.preventDefault()
    setErro('')

    if (form.password.length < 6) {
      setErro('A palavra-passe deve ter pelo menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirmar) {
      setErro('As palavras-passe não coincidem.')
      return
    }

    setACriar(true)
    try {
      const u = await criarUtilizador({
        nome: form.nome,
        email: form.email,
        password: form.password,
      })
      iniciarSessao(u)
      navigate('/nova-reserva')
    } catch (err) {
      setErro(err.message)
    } finally {
      setACriar(false)
    }
  }

  return (
    <div className="auth">
      <div className="logo">Book<span>IT</span></div>
      <h1>Criar conta</h1>
      <p className="subtitulo">Registe-se para começar a reservar espaços.</p>

      <form onSubmit={submeter}>
        <label>
          Nome
          <input
            type="text"
            required
            value={form.nome}
            onChange={e => mudar('nome', e.target.value)}
          />
        </label>

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

        <label>
          Confirmar palavra-passe
          <input
            type="password"
            required
            value={form.confirmar}
            onChange={e => mudar('confirmar', e.target.value)}
          />
        </label>

        {erro && <p role="alert">{erro}</p>}

        <button type="submit" disabled={aCriar}>
          {aCriar ? 'A criar conta…' : 'Criar conta'}
        </button>
      </form>

      <p className="auth-rodape">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  )
}