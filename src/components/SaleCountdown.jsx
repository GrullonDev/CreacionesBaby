import { useEffect, useState } from 'react'

function getRemainingMs() {
  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  return Math.max(0, endOfDay - now)
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function SaleCountdown() {
  const [remaining, setRemaining] = useState(getRemainingMs)

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemainingMs()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-2.5 py-1 rounded-full">
      <span className="material-symbols-outlined text-sm">timer</span>
      Oferta termina en {formatDuration(remaining)}
    </div>
  )
}
