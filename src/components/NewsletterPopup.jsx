import { useEffect, useState } from 'react'
import NewsletterForm from './NewsletterForm'

const DISMISSED_KEY = 'creaciones_newsletter_popup_dismissed_at'
const SNOOZE_DAYS = 7

function alreadySubscribed() {
  try {
    const subs = JSON.parse(localStorage.getItem('creaciones_subscribers') || '[]')
    return subs.length > 0
  } catch {
    return false
  }
}

function recentlyDismissed() {
  try {
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (!dismissedAt) return false
    const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24)
    return days < SNOOZE_DAYS
  } catch {
    return false
  }
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (alreadySubscribed() || recentlyDismissed()) return

    let triggered = false
    const trigger = () => {
      if (triggered) return
      triggered = true
      setVisible(true)
      cleanup()
    }

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) trigger()
    }
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const full = document.documentElement.scrollHeight
      if (full > 0 && scrolled / full >= 0.6) trigger()
    }

    function cleanup() {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return cleanup
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch {}
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={dismiss}
    >
      <div
        className="bg-[#fff1f2] dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-slide-up border border-rose-100/70 dark:border-slate-800 p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/60 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-[#5c4c3e] dark:text-rose-200 uppercase bg-[#5c4c3e]/10 rounded-full mb-4">
          Oferta de bienvenida
        </span>
        <h3 className="text-2xl font-extrabold text-[#5c4c3e] dark:text-white leading-tight">
          Antes de irte, únete a la familia
        </h3>
        <p className="text-xs text-stone-600 dark:text-slate-300 mt-2 mb-6 leading-relaxed">
          Suscríbete y recibe consejos de crianza, promociones exclusivas y novedades de CreacionesBaby directo a tu correo.
        </p>
        <NewsletterForm onSubscribed={dismiss} />
      </div>
    </div>
  )
}
