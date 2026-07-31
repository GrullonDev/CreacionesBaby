const BADGES = [
  { icon: 'lock', label: 'Pago 100% seguro' },
  { icon: 'local_shipping', label: 'Envío garantizado' },
  { icon: 'replay', label: 'Devoluciones fáciles' },
]

export default function TrustBadges({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      {BADGES.map((badge) => (
        <span key={badge.label} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-sm text-primary">{badge.icon}</span>
          {badge.label}
        </span>
      ))}
    </div>
  )
}
