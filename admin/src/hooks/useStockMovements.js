import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api'
import { useToast } from '../context/useToast'
import { extractApiError } from '../utils/apiError'

export const EMPTY_MOVEMENT_FORM = {
  type: 'ENTRADA',
  quantity: '',
  newStock: '',
  reason: '',
  unitCost: '',
}

/**
 * The stock audit trail, plus the "ajustar stock" action.
 *
 * VENTA rows are created by the sales routes, never here — this hook only posts
 * the manual movement types (entrada, salida, ajuste, merma, devolución).
 */
export function useStockMovements({ productId = '', type = '' } = {}) {
  const { addToast } = useToast()

  const [filters, setFilters] = useState({ productId, type })
  const [page, setPage] = useState(1)
  const [movements, setMovements] = useState([])
  const [pageInfo, setPageInfo] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const params = useMemo(
    () => ({
      ...(filters.productId ? { productId: filters.productId } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      page,
      pageSize: 50,
    }),
    [filters, page]
  )

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return api
      .get('/stock-movements', { params })
      .then((res) => {
        setMovements(res.data.movements)
        setPageInfo({ total: res.data.total, totalPages: res.data.totalPages })
      })
      .catch((err) => setError(extractApiError(err, 'No se pudo cargar el historial de inventario.')))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => {
    refresh()
  }, [refresh])

  const validateMovement = useCallback((form, product) => {
    const errs = {}
    if (!form.type) errs.type = 'Selecciona el tipo de movimiento'

    if (form.type === 'AJUSTE') {
      if (form.newStock === '' || Number(form.newStock) < 0) {
        errs.newStock = 'Indica el conteo real (0 o más)'
      } else if (product && Number(form.newStock) === product.stock) {
        errs.newStock = `El stock ya es ${product.stock} — no hay nada que ajustar`
      }
    } else {
      if (!(Number(form.quantity) > 0)) errs.quantity = 'Indica cuántas unidades'
      else if (product && (form.type === 'SALIDA' || form.type === 'MERMA') && Number(form.quantity) > product.stock) {
        errs.quantity = `Solo hay ${product.stock} unidades disponibles`
      }
    }
    if (form.unitCost !== '' && Number(form.unitCost) < 0) errs.unitCost = 'El costo no puede ser negativo'
    return errs
  }, [])

  const create = useCallback(
    async (form, product) => {
      const errs = validateMovement(form, product)
      if (Object.keys(errs).length > 0) return { ok: false, errors: errs }

      setSaving(true)
      try {
        await api.post('/stock-movements', {
          productId: product.id,
          type: form.type,
          ...(form.type === 'AJUSTE'
            ? { newStock: Number(form.newStock) }
            : { quantity: Number(form.quantity) }),
          ...(form.reason.trim() ? { reason: form.reason.trim() } : {}),
          ...(form.unitCost !== '' ? { unitCost: Number(form.unitCost) } : {}),
        })
        await refresh()
        addToast('Inventario actualizado')
        return { ok: true, errors: {} }
      } catch (err) {
        addToast(extractApiError(err, 'No se pudo registrar el movimiento.'), 'error')
        return { ok: false, errors: {} }
      } finally {
        setSaving(false)
      }
    },
    [validateMovement, refresh, addToast]
  )

  return {
    movements,
    pageInfo,
    loading,
    error,
    saving,
    refresh,
    create,
    page,
    setPage,
    filters,
    setFilter: (key, value) => {
      setPage(1)
      setFilters((f) => ({ ...f, [key]: value }))
    },
  }
}
