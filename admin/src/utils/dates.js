/**
 * Date helpers for the back office.
 *
 * Everything the API takes or returns for a *business date* is a bare
 * `YYYY-MM-DD`, which is also what `<input type="date">` wants, so these
 * deliberately work in local time and never round-trip through UTC — otherwise a
 * sale entered at 8pm in Guatemala (UTC-6) would file itself under tomorrow.
 */

/** `YYYY-MM-DD` for a Date, in the user's own timezone. */
export function toInputDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export const today = () => toInputDate()

function shiftDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toInputDate(d)
}

function startOfMonth(offset = 0) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return toInputDate(d)
}

function endOfMonth(offset = 0) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset + 1)
  d.setDate(0)
  return toInputDate(d)
}

/**
 * The period presets offered by DateRangeFilter. `range()` is a function rather
 * than a precomputed value so a session left open overnight doesn't keep
 * reporting yesterday as "hoy".
 */
export const PERIOD_PRESETS = [
  { id: 'hoy', label: 'Hoy', range: () => ({ from: today(), to: today() }) },
  { id: '7d', label: 'Últimos 7 días', range: () => ({ from: shiftDays(-6), to: today() }) },
  { id: '30d', label: 'Últimos 30 días', range: () => ({ from: shiftDays(-29), to: today() }) },
  { id: 'mes', label: 'Mes actual', range: () => ({ from: startOfMonth(0), to: today() }) },
  {
    id: 'mesPasado',
    label: 'Mes pasado',
    range: () => ({ from: startOfMonth(-1), to: endOfMonth(-1) }),
  },
  {
    id: 'anio',
    label: 'Este año',
    range: () => ({ from: `${new Date().getFullYear()}-01-01`, to: today() }),
  },
  { id: 'todo', label: 'Todo', range: () => ({ from: '', to: '' }) },
  { id: 'personalizado', label: 'Personalizado', range: null },
]

export const DEFAULT_PERIOD = 'mes'

export function presetRange(id) {
  const preset = PERIOD_PRESETS.find((p) => p.id === id)
  return preset?.range ? preset.range() : { from: '', to: '' }
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const withTimeFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.valueOf()) ? '—' : dateTimeFormatter.format(d)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.valueOf()) ? '—' : withTimeFormatter.format(d)
}

/** Short label for a chart axis / series row: `13 ago`. */
export function formatDayShort(value) {
  if (!value) return ''
  // A bare YYYY-MM-DD parses as UTC midnight; add the time so it doesn't shift
  // back a day for negative offsets.
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
  if (Number.isNaN(d.valueOf())) return ''
  return new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'short' }).format(d)
}

export function describeRange({ from, to }) {
  if (!from && !to) return 'Todo el historial'
  if (from && to) return from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`
  return from ? `Desde ${formatDate(from)}` : `Hasta ${formatDate(to)}`
}
