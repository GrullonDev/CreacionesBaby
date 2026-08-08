import { useState, useCallback } from 'react'
import { getFriendDiscount, consumeFriendDiscount } from '../utils/referral'
import { track } from '../utils/analytics'
import api from '../services/api'
import { extractApiError } from '../utils/apiError'

const USE_API = Boolean(import.meta.env.VITE_API_URL)

const PROMO_CODES = {
  BABY10: { discount: 0.1, label: '10% de descuento' },
  FREESHIP: { discount: 0, freeShipping: true, label: 'Envío gratis' },
  BABY20: { discount: 0.2, label: '20% de descuento' },
}

function saveOrder(order) {
  try {
    const existing = JSON.parse(localStorage.getItem('creaciones_orders') || '[]')
    existing.push(order)
    localStorage.setItem('creaciones_orders', JSON.stringify(existing))
  } catch {}
}

export function useCheckoutLogic({ items, subtotal, clearCart, navigate }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  })

  const [couponCode, setCouponCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [couponError, setCouponError] = useState('')

  const handleChange = useCallback((e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }, [])

  const handleApplyCoupon = useCallback((addToast) => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    const promo = PROMO_CODES[code]
    if (promo) {
      setAppliedPromo({ ...promo, code })
      setCouponError('')
      addToast(`Cupón ${code} aplicado: ${promo.label}`)
    } else {
      setAppliedPromo(null)
      setCouponError('Código inválido. Prueba con BABY10, BABY20 o FREESHIP.')
      addToast('Cupón no válido', 'error')
    }
  }, [couponCode])

  const handleRemoveCoupon = useCallback(() => {
    setAppliedPromo(null)
    setCouponCode('')
    setCouponError('')
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (submitting) return

      const baseShipping = subtotal >= 50 ? 0 : 5.99
      const shippingCost = appliedPromo?.freeShipping ? 0 : baseShipping
      const discountAmount = appliedPromo?.discount ? subtotal * appliedPromo.discount : 0
      const friendDiscount = getFriendDiscount()
      const totalDiscount = discountAmount + friendDiscount
      const address = { name: form.name, email: form.email, address: form.address, city: form.city, zip: form.zip }

      setSubmitError('')
      setSubmitting(true)

      try {
        let order
        if (USE_API) {
          // Real order: server recomputes prices/stock and is the source of
          // truth for `order.id`/`order.total` — this is a guest checkout
          // (no login yet), the backend just stores the address as contact info.
          const res = await api.post('/orders', {
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              selectedColor: item.selectedColor || undefined,
              selectedSize: item.selectedSize || undefined,
            })),
            address,
            promoCode: appliedPromo?.code || null,
            discount: totalDiscount,
            shipping: shippingCost,
          })
          order = res.data
        } else {
          const total = Math.max(0, subtotal - totalDiscount + shippingCost)
          order = {
            id: 'ORD-' + Date.now().toString(36).toUpperCase(),
            date: new Date().toISOString(),
            items: [...items],
            subtotal,
            discount: totalDiscount,
            promoCode: appliedPromo?.code || null,
            shipping: shippingCost,
            total,
            address,
          }
        }

        // Kept even in API mode so "Mis Pedidos" (still localStorage-only,
        // no customer login to look orders up by) keeps working unchanged.
        saveOrder(order)
        if (friendDiscount > 0) consumeFriendDiscount()

        track('purchase', {
          orderId: order.id,
          total: order.total,
          itemCount: items.length,
          promoCode: appliedPromo?.code || null,
        })

        setOrderId(order.id)
        setSubmitted(true)

        setTimeout(() => {
          clearCart()
          navigate('/orders')
        }, 4000)
      } catch (err) {
        setSubmitError(extractApiError(err, 'No se pudo completar el pedido. Intenta de nuevo.'))
      } finally {
        setSubmitting(false)
      }
    },
    [items, subtotal, appliedPromo, form, clearCart, navigate, submitting]
  )

  const baseShipping = subtotal >= 50 ? 0 : 5.99
  const shippingCost = appliedPromo?.freeShipping ? 0 : baseShipping
  const discountAmount = appliedPromo?.discount ? subtotal * appliedPromo.discount : 0
  const friendDiscount = getFriendDiscount()
  const total = Math.max(0, subtotal - discountAmount - friendDiscount + shippingCost)

  return {
    submitted,
    submitting,
    submitError,
    orderId,
    form,
    couponCode,
    setCouponCode,
    appliedPromo,
    couponError,
    handleChange,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleSubmit,
    baseShipping,
    shippingCost,
    discountAmount,
    friendDiscount,
    total,
    PROMO_CODES,
    isEmpty: items.length === 0,
  }
}
