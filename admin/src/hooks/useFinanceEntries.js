import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api'
import { useToast } from '../context/useToast'
import { extractApiError } from '../utils/apiError'
import { presetRange, DEFAULT_PERIOD, today } from '../utils/dates'
import { categoriesFor } from '../utils/salesConstants'

const EMPTY_TOTALS = { ingresos: 0, egresos: 0, balance: 0 }

export const EMPTY_ENTRY_FORM = {
  direction: 'EGRESO',
  category: 'MATERIA_PRIMA',
  description: '',
  amount: '',
  paymentMethod: 'EFECTIVO',
  counterparty: '',
  reference: '',
  notes: '',
  occurredAt: today(),
}

/**
 * The cash ledger: ingresos that aren't product sales, and every egreso.
 *
 * Sales revenue deliberately isn't in here — it lives in the sales table and is
 * joined back in on the reports page. Mixing them would mean either
 * double-counting a sale or having to keep two records of it in sync.
 */
export function useFinanceEntries(initialPeriod = DEFAULT_PERIOD) {
  const { addToast } = useToast()

  const [preset, setPreset] = useState(initialPeriod)
  const [range, setRange] = useState(() => presetRange(initialPeriod))
  const [direction, setDirection] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [entries, setEntries] = useState([])
  const [totals, setTotals] = useState(EMPTY_TOTALS)
  const [pageInfo, setPageInfo] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const params = useMemo(
    () => ({
      ...(range.from ? { from: range.from } : {}),
      ...(range.to ? { to: range.to } : {}),
      ...(direction ? { direction } : {}),
      ...(category ? { category } : {}),
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      page,
      pageSize: 50,
    }),
    [range, direction, category, debouncedSearch, page]
  )

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return api
      .get('/finance-entries', { params })
      .then((res) => {
        setEntries(res.data.entries)
        setTotals(res.data.totals || EMPTY_TOTALS)
        setPageInfo({ total: res.data.total, totalPages: res.data.totalPages })
      })
      .catch((err) => setError(extractApiError(err, 'No se pudieron cargar los movimientos.')))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => {
    refresh()
  }, [refresh])

  const applyPreset = useCallback((id) => {
    setPreset(id)
    setPage(1)
    if (id !== 'personalizado') setRange(presetRange(id))
  }, [])

  const validateEntry = useCallback((form) => {
    const errs = {}
    if (!form.description.trim()) errs.description = 'Describe el movimiento'
    if (!(Number(form.amount) > 0)) errs.amount = 'El monto debe ser mayor a 0'
    if (!form.category) errs.category = 'Selecciona una categoría'
    else if (!categoriesFor(form.direction).some((c) => c.id === form.category)) {
      errs.category = 'Esa categoría no corresponde al tipo de movimiento'
    }
    if (!form.occurredAt) errs.occurredAt = 'Indica la fecha'
    else if (form.occurredAt > today()) errs.occurredAt = 'La fecha no puede estar en el futuro'
    return errs
  }, [])

  const save = useCallback(
    async (form, editingId) => {
      const errs = validateEntry(form)
      if (Object.keys(errs).length > 0) return { ok: false, errors: errs }

      setSaving(true)
      try {
        const payload = {
          direction: form.direction,
          category: form.category,
          description: form.description.trim(),
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod || null,
          counterparty: form.counterparty.trim() || null,
          reference: form.reference.trim() || null,
          notes: form.notes.trim() || null,
          occurredAt: form.occurredAt,
        }
        if (editingId) await api.put(`/finance-entries/${editingId}`, payload)
        else await api.post('/finance-entries', payload)
        await refresh()
        addToast(editingId ? 'Movimiento actualizado' : 'Movimiento registrado')
        return { ok: true, errors: {} }
      } catch (err) {
        addToast(extractApiError(err, 'No se pudo guardar el movimiento.'), 'error')
        return { ok: false, errors: {} }
      } finally {
        setSaving(false)
      }
    },
    [validateEntry, refresh, addToast]
  )

  const remove = useCallback(
    async (entry) => {
      try {
        await api.delete(`/finance-entries/${entry.id}`)
        await refresh()
        addToast('Movimiento eliminado', 'info')
      } catch (err) {
        addToast(extractApiError(err, 'No se pudo eliminar el movimiento.'), 'error')
      }
    },
    [refresh, addToast]
  )

  return {
    entries,
    totals,
    pageInfo,
    loading,
    error,
    saving,
    refresh,
    save,
    remove,
    filters: {
      preset,
      from: range.from,
      to: range.to,
      direction,
      category,
      search,
      page,
      applyPreset,
      setFrom: (from) => {
        setPage(1)
        setRange((r) => ({ ...r, from }))
      },
      setTo: (to) => {
        setPage(1)
        setRange((r) => ({ ...r, to }))
      },
      setDirection: (value) => {
        setPage(1)
        setDirection(value)
        // A category from the old direction would filter everything out.
        setCategory('')
      },
      setCategory: (value) => {
        setPage(1)
        setCategory(value)
      },
      setSearch,
      setPage,
    },
  }
}
