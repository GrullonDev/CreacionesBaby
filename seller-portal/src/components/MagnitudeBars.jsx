import { formatCurrency } from '../utils/currency'

/**
 * Ranked horizontal bars for a single magnitude series — ventas por canal,
 * egresos por categoría, productos más vendidos.
 *
 * One series, so there's no legend: the section heading names it. Every row is
 * directly labelled with its value, so the bar length is a comparison aid rather
 * than the only way to read the number. Bars use a single hue (`--viz-neutral`,
 * or a caller-supplied token) since the encoding is magnitude, not identity.
 */
export default function MagnitudeBars({ rows, fill = 'var(--viz-neutral)', valueFormatter = formatCurrency }) {
  const max = Math.max(...rows.map((r) => r.value), 0)
  if (rows.length === 0) return null

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.id} className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28 sm:w-36 flex-shrink-0 truncate">
            {row.label}
          </span>
          <span
            className="flex-grow h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--viz-track)' }}
            role="presentation"
          >
            <span
              className="block h-full rounded-full"
              style={{
                width: max > 0 ? `${Math.max((row.value / max) * 100, 2)}%` : '0%',
                backgroundColor: fill,
              }}
            />
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-24 text-right flex-shrink-0 tabular-nums">
            {valueFormatter(row.value)}
          </span>
          {row.hint && (
            <span className="text-[10px] text-slate-400 w-16 text-right flex-shrink-0 hidden sm:block truncate">
              {row.hint}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
