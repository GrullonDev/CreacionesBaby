import { useState } from 'react'
import { useToast } from '../context/useToast'

const STORAGE_KEY = 'creaciones_stock_notifications'

function saveRequest(productId, email) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (existing.some((r) => r.productId === productId && r.email === email)) return false
    existing.push({ productId, email, date: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch {
    return false
  }
}

export default function NotifyStockForm({ productId }) {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Ingresa un correo válido para avisarte.')
      return
    }
    const saved = saveRequest(productId, value)
    setError('')
    setSubmitted(true)
    addToast(saved ? 'Te avisaremos cuando vuelva a estar disponible' : 'Ya estás en la lista de aviso para este producto')
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3">
        <span className="material-symbols-outlined text-base">mark_email_read</span>
        Te avisaremos por correo en cuanto haya stock.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
        Avísame cuando esté disponible
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          placeholder="tu@correo.com"
          aria-label="Correo electrónico"
          className="flex-grow bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
        />
        <button
          type="submit"
          className="bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
        >
          Notificarme
        </button>
      </div>
      {error && (
        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </form>
  )
}
