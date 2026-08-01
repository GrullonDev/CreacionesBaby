import { useState, useCallback } from 'react'
import { getFriendDiscount, consumeFriendDiscount } from '../utils/referral'
import { track } from '../utils/analytics'

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
    (e) => {
      e.preventDefault()
      const id = 'ORD-' + Date.now().toString(36).toUpperCase()
      const baseShipping = subtotal >= 50 ? 0 : 5.99
      const shippingCost = appliedPromo?.freeShipping ? 0 : baseShipping
      const discountAmount = appliedPromo?.discount ? subtotal * appliedPromo.discount : 0
      const friendDiscount = getFriendDiscount()
      const total = Math.max(0, subtotal - discountAmount - friendDiscount + shippingCost)

      saveOrder({
        id,
        date: new Date().toISOString(),
        items: [...items],
        subtotal,
        discount: discountAmount + friendDiscount,
        promoCode: appliedPromo?.code || null,
        shipping: shippingCost,
        total,
        address: { name: form.name, email: form.email, address: form.address, city: form.city, zip: form.zip },
      })

      if (friendDiscount > 0) consumeFriendDiscount()

      track('purchase', { orderId: id, total, itemCount: items.length, promoCode: appliedPromo?.code || null })

      setOrderId(id)
      setSubmitted(true)

      setTimeout(() => {
        clearCart()
        navigate('/orders')
      }, 4000)
    },
    [items, subtotal, appliedPromo, form, clearCart, navigate]
  )

  const baseShipping = subtotal >= 50 ? 0 : 5.99
  const shippingCost = appliedPromo?.freeShipping ? 0 : baseShipping
  const discountAmount = appliedPromo?.discount ? subtotal * appliedPromo.discount : 0
  const friendDiscount = getFriendDiscount()
  const total = Math.max(0, subtotal - discountAmount - friendDiscount + shippingCost)

  return {
    submitted,
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