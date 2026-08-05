import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const inputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none'
const labelClass = 'text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2'

export default function Register() {
  usePageTitle('Crear cuenta')
  const { register, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white">Creaciones Baby</h1>
          <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">Panel de Vendedor</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Crea tu cuenta de vendedor</h2>

          {error && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className={labelClass} htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ej. María López"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-opacity-95 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {submitting && <span className="material-symbols-outlined text-lg animate-spin">sync</span>}
            Crear cuenta
          </button>

          <p className="text-xs text-center text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
