import { useState } from 'react'
import { useToast } from '../context/useToast'

function saveSubscriber(email) {
  try {
    const existing = JSON.parse(localStorage.getItem('creaciones_subscribers') || '[]')
    if (!existing.some((s) => s.email === email)) {
      existing.push({ email, date: new Date().toISOString() })
      localStorage.setItem('creaciones_subscribers', JSON.stringify(existing))
    }
  } catch {}
}

export default function NewsletterForm({ compact = false, className = '' }) {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = email.trim()
    if (!value) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Ingresa un correo válido, por ejemplo: mama@correo.com')
      return
    }
    saveSubscriber(value)
    setEmail('')
    setError('')
    addToast('¡Te has suscrito a la Comunidad CreacionesBaby!')
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          placeholder="Tu correo electrónico"
          aria-label="Correo electrónico"
          className={`w-full ${compact
            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs p-2.5'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-5 py-3 text-xs'
          } focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-slate-200`}
        />
        <button
          type="submit"
          className={`bg-primary hover:bg-[#4a3e35] text-white font-bold rounded-full transition-all shrink-0 cursor-pointer ${compact ? 'text-xs px-5 py-2.5' : 'text-xs px-8 py-3'}`}
        >
          Suscribirme
        </button>
      </div>
      {error && (
        <p className="text-[11px] font-semibold text-red-500 mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </form>
  )
}
