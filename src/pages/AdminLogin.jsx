import { useState } from 'react'
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/useAdminAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const inputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none'

export default function AdminLogin() {
  usePageTitle('Administración')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from || '/admin'

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Already signed in (e.g. arrived here by typing the URL) — go straight in,
  // declaratively rather than navigating during render.
  if (isAuthenticated) return <Navigate to={from} replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="w-14 h-14 rounded-full bg-primary text-white inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">child_care</span>
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-4">
            Panel de administración
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Registra ventas, gastos y consulta tus reportes.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2"
            >
              Correo
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2"
            >
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2.5 flex items-start gap-1.5">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-opacity-95 text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting && <span className="material-symbols-outlined text-base animate-spin">sync</span>}
            Entrar
          </button>

          <p className="text-[11px] text-slate-400 text-center pt-1">
            Solo cuentas de vendedor o administrador.
          </p>
        </form>

        <p className="text-center mt-6">
          <Link to="/" className="text-[11px] font-bold text-slate-400 hover:text-primary">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  )
}
