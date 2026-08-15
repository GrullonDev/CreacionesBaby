import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api'
import { useToast } from '../context/useToast'
import { extractApiError } from '../utils/apiError'
import { presetRange, DEFAULT_PERIOD } from '../utils/dates'

const EMPTY_TOTALS = {
  count: 0,
  cancelledCount: 0,
  units: 0,
  revenue: 0,
  cogs: 0,
  grossProfit: 0,
  marginPct: 0,
  averageTicket: 0,
}

/**
 * The sales list: web checkouts and hand-entered sales together, filtered
 * server-side.
 *
 * Totals come from the API rather than being summed here, because they cover the
 * whole filtered result set, not just the page currently on screen.
 */
export function useSales(initialPeriod = DEFAULT_PERIOD) {
  const { addToast } = useToast()

  const [preset, setPreset] = useState(initialPeriod)
  const [range, setRange] = useState(() => presetRange(initialPeriod))
  const [channel, setChannel] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [sales, setSales] = useState([])
  const [totals, setTotals] = useState(EMPTY_TOTALS)
  const [pageInfo, setPageInfo] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const params = useMemo(
    () => ({
      ...(range.from ? { from: range.from } : {}),
      ...(range.to ? { to: range.to } : {}),
      ...(channel ? { channel } : {}),
      ...(status ? { status } : {}),
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      page,
      pageSize: 25,
    }),
    [range, channel, status, debouncedSearch, page]
  )

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return api
      .get('/sales', { params })
      .then((res) => {
        setSales(res.data.sales)
        setTotals(res.data.totals || EMPTY_TOTALS)
        setPageInfo({ total: res.data.total, totalPages: res.data.totalPages })
      })
      .catch((err) => setError(extractApiError(err, 'No se pudieron cargar las ventas.')))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Any filter change invalidates the current page number.
  const applyPreset = useCallback((id) => {
    setPreset(id)
    setPage(1)
    if (id !== 'personalizado') setRange(presetRange(id))
  }, [])

  const setFrom = useCallback((from) => {
    setPage(1)
    setRange((r) => ({ ...r, from }))
  }, [])

  const setTo = useCallback((to) => {
    setPage(1)
    setRange((r) => ({ ...r, to }))
  }, [])

  const changeStatus = useCallback(
    async (sale, nextStatus) => {
      try {
        await api.patch(`/sales/${sale.id}`, { status: nextStatus })
        await refresh()
        addToast(
          nextStatus === 'CANCELLED'
            ? 'Venta cancelada y stock devuelto al inventario'
            : 'Estado de la venta actualizado'
        )
      } catch (err) {
        addToast(extractApiError(err, 'No se pudo actualizar la venta.'), 'error')
      }
    },
    [refresh, addToast]
  )

  return {
    sales,
    totals,
    pageInfo,
    loading,
    error,
    refresh,
    changeStatus,
    filters: {
      preset,
      from: range.from,
      to: range.to,
      channel,
      status,
      search,
      page,
      applyPreset,
      setFrom,
      setTo,
      setChannel: (value) => {
        setPage(1)
        setChannel(value)
      },
      setStatus: (value) => {
        setPage(1)
        setStatus(value)
      },
      setSearch,
      setPage,
    },
  }
}
