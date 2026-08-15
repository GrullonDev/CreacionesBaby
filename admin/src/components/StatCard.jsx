/**
 * The icon-chip stat card used across Dashboard / Inventario / Ventas / Finanzas
 * / Reportes.
 *
 * This existed as three near-identical copies inside those pages; it lives here
 * now so a change to the KPI look happens once.
 */

const TONES = {
  primary: 'bg-primary/10 text-primary',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
  red: 'bg-red-50 text-red-500 dark:bg-red-500/10',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10',
  slate: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

const VALUE_TONES = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  red: 'text-red-500',
  amber: 'text-amber-600 dark:text-amber-400',
}

export default function StatCard({ icon, label, value, hint, tone = 'primary', size = 'md' }) {
  const chip = TONES[tone] || TONES.primary
  const valueClass = VALUE_TONES[tone] || 'text-slate-900 dark:text-white'
  const compact = size === 'sm'

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3 ${
        compact ? 'p-4' : 'p-5 gap-4'
      } ${tone === 'red' ? 'border-l-4 border-l-red-400' : ''}`}
    >
      <div
        className={`rounded-xl flex items-center justify-center flex-shrink-0 ${chip} ${
          compact ? 'w-10 h-10' : 'w-11 h-11'
        }`}
      >
        <span className={`material-symbols-outlined ${compact ? 'text-lg' : 'text-xl'}`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className={`font-extrabold truncate ${compact ? 'text-base' : 'text-lg'} ${valueClass}`}>{value}</p>
        <p className="text-[11px] text-slate-400 font-semibold truncate">{label}</p>
        {hint && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  )
}
