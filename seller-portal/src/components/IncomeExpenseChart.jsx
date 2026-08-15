import { useState, useMemo } from 'react'
import { formatCurrency } from '../utils/currency'
import { formatDayShort } from '../utils/dates'

/**
 * Ingresos vs egresos over time, as grouped bars. Plain HTML/CSS — no chart
 * library, so it inherits the app's tokens and dark mode for free.
 *
 * Both series are money in GTQ, so they share one scale — never two y-axes.
 * The two colours come from `--viz-income` / `--viz-expense` (validated for
 * colour-vision separation in index.css) and are backed up by a legend, a hover
 * tooltip with the actual figures, and the tables on Ventas/Finanzas as the
 * text-only view of the same data.
 */

/** Fill in days with no activity so the time axis isn't misleadingly compressed. */
function fillDays(daily, from, to) {
  if (!from || !to) return daily
  const byDate = new Map(daily.map((d) => [d.date, d]))
  const out = []
  const cursor = new Date(`${from}T12:00:00`)
  const end = new Date(`${to}T12:00:00`)
  if (Number.isNaN(cursor.valueOf()) || Number.isNaN(end.valueOf())) return daily
  // Guard against a silly range producing tens of thousands of columns.
  let guard = 0
  while (cursor <= end && guard < 400) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate()
    ).padStart(2, '0')}`
    out.push(byDate.get(key) || { date: key, revenue: 0, expenses: 0, cogs: 0, units: 0, count: 0 })
    cursor.setDate(cursor.getDate() + 1)
    guard += 1
  }
  return out
}

/** Past ~6 weeks, per-day columns get unreadably thin — roll up to months. */
function bucketByMonth(rows) {
  const map = new Map()
  for (const row of rows) {
    const key = String(row.date).slice(0, 7)
    const bucket = map.get(key) || { date: key, revenue: 0, expenses: 0, count: 0 }
    bucket.revenue += row.revenue
    bucket.expenses += row.expenses
    bucket.count += row.count
    map.set(key, bucket)
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
}

const MONTH_FMT = new Intl.DateTimeFormat('es-GT', { month: 'short', year: '2-digit' })

function labelFor(row, grouped) {
  if (!grouped) return formatDayShort(row.date)
  const [year, month] = row.date.split('-')
  return MONTH_FMT.format(new Date(Number(year), Number(month) - 1, 1))
}

export default function IncomeExpenseChart({ daily, from, to }) {
  const [hovered, setHovered] = useState(null)

  const { rows, grouped } = useMemo(() => {
    const filled = fillDays(daily, from, to)
    return filled.length > 45 ? { rows: bucketByMonth(filled), grouped: true } : { rows: filled, grouped: false }
  }, [daily, from, to])

  const max = Math.max(...rows.map((r) => Math.max(r.revenue, r.expenses)), 0)

  if (rows.length === 0 || max === 0) {
    return (
      <p className="text-xs text-slate-400 py-8 text-center">
        No hay ingresos ni egresos registrados en este período.
      </p>
    )
  }

  // Only label a handful of columns, otherwise the axis becomes a wall of text.
  const labelEvery = Math.ceil(rows.length / 8)

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Legend color="var(--viz-income)" label="Ingresos por ventas" />
        <Legend color="var(--viz-expense)" label="Egresos" />
        <span className="text-[10px] text-slate-400 ml-auto">
          Máximo {formatCurrency(max)}
          {grouped && ' · agrupado por mes'}
        </span>
      </div>

      <div className="relative">
        {hovered !== null && rows[hovered] && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 bg-slate-900 dark:bg-slate-950 text-white rounded-xl px-3 py-2 shadow-lg pointer-events-none">
            <p className="text-[11px] font-extrabold">{labelFor(rows[hovered], grouped)}</p>
            <p className="text-[10px] flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--viz-income)' }} />
              Ingresos {formatCurrency(rows[hovered].revenue)}
            </p>
            <p className="text-[10px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--viz-expense)' }} />
              Egresos {formatCurrency(rows[hovered].expenses)}
            </p>
            {rows[hovered].count > 0 && (
              <p className="text-[10px] text-white/60 mt-0.5">
                {rows[hovered].count} {rows[hovered].count === 1 ? 'venta' : 'ventas'}
              </p>
            )}
          </div>
        )}

        <div className="flex items-end gap-1 h-40 pt-10">
          {rows.map((row, i) => (
            <button
              key={row.date}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              aria-label={`${labelFor(row, grouped)}: ingresos ${formatCurrency(row.revenue)}, egresos ${formatCurrency(row.expenses)}`}
              className={`flex-1 min-w-0 h-full flex items-end justify-center gap-[2px] rounded-t transition-colors ${
                hovered === i ? 'bg-slate-100 dark:bg-slate-800/60' : ''
              }`}
            >
              {/* 2px gap between the paired fills keeps them readable when both
                  are tall; a 2px floor keeps a non-zero value visible. */}
              <span
                className="w-1/2 max-w-3 rounded-t"
                style={{
                  height: `${row.revenue > 0 ? Math.max((row.revenue / max) * 100, 2) : 0}%`,
                  backgroundColor: 'var(--viz-income)',
                }}
              />
              <span
                className="w-1/2 max-w-3 rounded-t"
                style={{
                  height: `${row.expenses > 0 ? Math.max((row.expenses / max) * 100, 2) : 0}%`,
                  backgroundColor: 'var(--viz-expense)',
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-1 border-t border-slate-100 dark:border-slate-800 pt-1.5">
          {rows.map((row, i) => (
            <span
              key={row.date}
              className="flex-1 min-w-0 text-[9px] text-slate-400 text-center truncate"
            >
              {i % labelEvery === 0 ? labelFor(row, grouped) : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
