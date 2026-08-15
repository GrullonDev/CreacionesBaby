/** Small pill for a status / channel / movement type. */

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
  red: 'bg-red-50 text-red-500 dark:bg-red-500/10',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10',
  primary: 'bg-primary/10 text-primary',
  slate: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

export default function Badge({ children, tone = 'slate', icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap ${
        TONES[tone] || TONES.slate
      }`}
    >
      {icon && <span className="material-symbols-outlined text-xs">{icon}</span>}
      {children}
    </span>
  )
}
