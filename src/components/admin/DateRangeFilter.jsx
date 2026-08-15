import { PERIOD_PRESETS } from '../../utils/dates'

/**
 * Period picker shared by Ventas / Finanzas / Reportes: a row of preset chips
 * plus two date inputs that appear when "Personalizado" is chosen.
 *
 * The parent owns `{ preset, from, to }` (see `usePeriod` in useReportSummary.js)
 * so the same selection can drive several requests at once.
 */
export default function DateRangeFilter({ preset, from, to, onPreset, onFrom, onTo, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Período">
        {PERIOD_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreset(p.id)}
            aria-pressed={preset === p.id}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              preset === p.id
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'personalizado' && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Desde
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => onFrom(e.target.value)}
              className="block mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </label>
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Hasta
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => onTo(e.target.value)}
              className="block mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </label>
        </div>
      )}
    </div>
  )
}
