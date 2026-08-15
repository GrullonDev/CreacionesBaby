import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api'
import { extractApiError } from '../utils/apiError'
import { presetRange, DEFAULT_PERIOD } from '../utils/dates'

/**
 * Shared period state for any page that filters by date range.
 *
 * Split out from the data hooks so Reportes and the Dashboard can each own their
 * own selection without duplicating the preset-vs-custom logic.
 */
export function usePeriod(initial = DEFAULT_PERIOD) {
  const [preset, setPreset] = useState(initial)
  const [range, setRange] = useState(() => presetRange(initial))

  const applyPreset = useCallback((id) => {
    setPreset(id)
    if (id !== 'personalizado') setRange(presetRange(id))
  }, [])

  return {
    preset,
    from: range.from,
    to: range.to,
    applyPreset,
    setFrom: (from) => setRange((r) => ({ ...r, from })),
    setTo: (to) => setRange((r) => ({ ...r, to })),
  }
}

/**
 * The whole reports payload in one request — revenue, COGS, margin, other
 * income, expenses by category, inventory value, top products, sales by channel
 * and a daily series.
 *
 * The arithmetic lives on the server so this page never has to download the
 * entire sales history to add it up.
 */
export function useReportSummary({ from, to }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const params = useMemo(
    () => ({ ...(from ? { from } : {}), ...(to ? { to } : {}) }),
    [from, to]
  )

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return api
      .get('/reports/summary', { params })
      .then((res) => setSummary(res.data))
      .catch((err) => setError(extractApiError(err, 'No se pudieron cargar los reportes.')))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { summary, loading, error, refresh }
}
