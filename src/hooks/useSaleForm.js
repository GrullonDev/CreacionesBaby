import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../context/useToast'
import { extractApiError } from '../utils/apiError'
import { today } from '../utils/dates'

const emptyLine = (index = 0) => ({
  key: `l${index}`,
  productId: '',
  quantity: '1',
  unitPrice: '',
  selectedColor: '',
  selectedSize: '',
})

const EMPTY_FORM = {
  soldAt: today(),
  channel: 'PRESENCIAL',
  paymentMethod: 'EFECTIVO',
  status: 'PAID',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  customerCity: '',
  discount: '',
  shipping: '',
  notes: '',
}

/**
 * State, validation and submission for the sale entry form.
 *
 * The whole point of this screen is speed — Jorge is entering a sale he already
 * made, often several in a row — so: sensible defaults (today, presencial,
 * efectivo, pagada), unit price prefilled from the catalog, totals recalculated
 * as you type, and "guardar y registrar otra" that keeps the date and channel.
 */
export function useSaleForm(id, { listPath = '/ventas' } = {}) {
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [form, setForm] = useState(EMPTY_FORM)
  const [lines, setLines] = useState([emptyLine()])
  const [products, setProducts] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    // `?mine=true` also carries `cost`, which is what makes the live margin
    // estimate on this form possible.
    api
      .get('/products', { params: { mine: true } })
      .then((res) => {
        if (!cancelled) setProducts(res.data)
      })
      .catch((err) => addToast(extractApiError(err, 'No se pudieron cargar tus productos.'), 'error'))
      .finally(() => {
        if (!cancelled && !isEditMode) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [addToast, isEditMode])

  useEffect(() => {
    if (!isEditMode) return
    api
      .get(`/sales/${id}`)
      .then((res) => {
        const sale = res.data
        setForm({
          soldAt: String(sale.soldAt).slice(0, 10),
          channel: sale.channel,
          paymentMethod: sale.paymentMethod || '',
          status: sale.status,
          customerName: sale.customer?.name || '',
          customerPhone: sale.customer?.phone || '',
          customerEmail: sale.customer?.email || '',
          customerAddress: sale.customer?.address || '',
          customerCity: sale.customer?.city || '',
          discount: sale.discount ? String(sale.discount) : '',
          shipping: sale.shipping ? String(sale.shipping) : '',
          notes: sale.notes || '',
        })
        setLines(
          sale.items.map((item, i) => ({
            key: `e${i}`,
            productId: item.productId,
            quantity: String(item.quantity),
            unitPrice: String(item.price),
            selectedColor: item.selectedColor || '',
            selectedSize: item.selectedSize || '',
          }))
        )
      })
      .catch((err) => addToast(extractApiError(err, 'No se pudo cargar la venta.'), 'error'))
      .finally(() => setLoading(false))
  }, [id, isEditMode, addToast])

  const setField = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
  }, [])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  /** Live totals for the summary card — the server recomputes them on submit. */
  const totals = useMemo(() => {
    let subtotal = 0
    let cogs = 0
    let units = 0
    let missingCost = false

    for (const line of lines) {
      const product = productById.get(line.productId)
      if (!product) continue
      const quantity = Number(line.quantity) || 0
      const unitPrice = line.unitPrice === '' ? product.price : Number(line.unitPrice) || 0
      subtotal += quantity * unitPrice
      units += quantity
      if (product.cost === null || product.cost === undefined) missingCost = true
      else cogs += quantity * product.cost
    }

    const discount = Number(form.discount) || 0
    const shipping = Number(form.shipping) || 0
    const total = Math.max(0, subtotal - discount + shipping)

    return {
      subtotal,
      discount,
      shipping,
      total,
      units,
      cogs,
      // Shipping charged to the customer is a pass-through, not margin.
      grossProfit: total - shipping - cogs,
      // Flagged so the UI can caveat the number instead of showing a margin
      // that's only high because a cost is missing.
      missingCost,
    }
  }, [lines, form.discount, form.shipping, productById])

  const validate = useCallback(() => {
    const errs = {}
    if (!form.soldAt) errs.soldAt = 'Indica la fecha de la venta'
    else if (form.soldAt > today()) errs.soldAt = 'La fecha no puede estar en el futuro'
    if (!form.channel) errs.channel = 'Selecciona el canal de venta'

    const filled = lines.filter((line) => line.productId)
    if (filled.length === 0) errs.items = 'Añade al menos un producto a la venta'

    lines.forEach((line, index) => {
      if (!line.productId) {
        // Only complain about a blank row if it isn't the only thing left to fill.
        if (lines.length > 1) errs[`line-${index}-product`] = 'Selecciona un producto o quita la línea'
        return
      }
      if (!(Number(line.quantity) > 0)) errs[`line-${index}-quantity`] = 'La cantidad debe ser al menos 1'
      if (line.unitPrice !== '' && Number(line.unitPrice) < 0) {
        errs[`line-${index}-quantity`] = 'El precio no puede ser negativo'
      }
    })

    // Stock is checked per product across all lines, matching what the server
    // does, so the user sees the problem before the request round-trips.
    const requested = new Map()
    for (const line of filled) {
      requested.set(line.productId, (requested.get(line.productId) || 0) + (Number(line.quantity) || 0))
    }
    for (const [productId, quantity] of requested) {
      const product = productById.get(productId)
      // Editing an existing sale doesn't re-reserve stock, so skip the check there.
      if (!isEditMode && product && quantity > product.stock) {
        errs.items = `No hay suficiente stock de "${product.name}" (disponible ${product.stock}, pediste ${quantity})`
      }
    }

    if (Number(form.discount) < 0) errs.discount = 'El descuento no puede ser negativo'
    if (Number(form.shipping) < 0) errs.shipping = 'El envío no puede ser negativo'
    if (totals.subtotal <= 0 && filled.length > 0) errs.items = 'El total de la venta debe ser mayor a 0'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form, lines, productById, totals.subtotal, isEditMode])

  const buildPayload = useCallback(() => {
    const filled = lines.filter((line) => line.productId)
    return {
      soldAt: form.soldAt,
      channel: form.channel,
      status: form.status,
      paymentMethod: form.paymentMethod || null,
      items: filled.map((line) => ({
        productId: line.productId,
        quantity: Number(line.quantity),
        // Only send a price when it differs from the catalog, so the server keeps
        // authority over pricing in the normal case.
        ...(line.unitPrice !== '' && Number(line.unitPrice) !== productById.get(line.productId)?.price
          ? { unitPrice: Number(line.unitPrice) }
          : {}),
        ...(line.selectedColor.trim() ? { selectedColor: line.selectedColor.trim() } : {}),
        ...(line.selectedSize.trim() ? { selectedSize: line.selectedSize.trim() } : {}),
      })),
      customer: {
        name: form.customerName.trim(),
        phone: form.customerPhone.trim(),
        ...(form.customerEmail.trim() ? { email: form.customerEmail.trim() } : {}),
        address: form.customerAddress.trim(),
        city: form.customerCity.trim(),
      },
      discount: Number(form.discount) || 0,
      shipping: Number(form.shipping) || 0,
      notes: form.notes.trim(),
    }
  }, [form, lines, productById])

  /** Keep the date/channel/payment method; clear the rest. Entering a batch of
   *  sales from the same fair shouldn't mean re-picking those every time. */
  const resetForNext = useCallback(() => {
    setForm((f) => ({
      ...EMPTY_FORM,
      soldAt: f.soldAt,
      channel: f.channel,
      paymentMethod: f.paymentMethod,
      status: f.status,
    }))
    setLines([emptyLine(Date.now())])
    setErrors({})
  }, [])

  const submit = useCallback(
    async ({ andAnother = false } = {}) => {
      if (!validate()) return false
      setSubmitting(true)
      try {
        if (isEditMode) {
          // Line items of a recorded sale aren't editable — that would mean
          // re-reserving stock. Cancel and re-enter instead.
          await api.patch(`/sales/${id}`, {
            status: form.status,
            paymentMethod: form.paymentMethod || null,
            channel: form.channel,
            soldAt: form.soldAt,
            notes: form.notes.trim() || null,
          })
          addToast('Venta actualizada')
          navigate(listPath)
          return true
        }

        await api.post('/sales', buildPayload())
        addToast('Venta registrada y stock actualizado')
        if (andAnother) {
          // Products were just decremented, so refresh the picker's stock numbers.
          const res = await api.get('/products', { params: { mine: true } })
          setProducts(res.data)
          resetForNext()
        } else {
          navigate(listPath)
        }
        return true
      } catch (err) {
        addToast(extractApiError(err, 'No se pudo registrar la venta.'), 'error')
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [validate, isEditMode, id, form, buildPayload, addToast, navigate, resetForNext, listPath]
  )

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      return submit()
    },
    [submit]
  )

  return {
    isEditMode,
    loading,
    submitting,
    form,
    setField,
    lines,
    setLines,
    products,
    errors,
    totals,
    handleSubmit,
    submitAndAnother: () => submit({ andAnother: true }),
  }
}
