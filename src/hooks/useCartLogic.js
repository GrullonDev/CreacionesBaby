import { useState, useEffect, useCallback } from 'react'
import { fetchProducts } from '../services/productService'

const AVAILABLE_PROMOS = [
  { code: 'BABY10', label: '10% de descuento' },
  { code: 'BABY20', label: '20% de descuento' },
  { code: 'FREESHIP', label: 'Envío gratis' },
]

export function useCartLogic({ items, removeItem, clearCart, subtotal }) {
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (items.length === 0) return
    const cartIds = new Set(items.map((i) => i.id))
    fetchProducts().then((all) => {
      const picks = all
        .filter((p) => !cartIds.has(p.id) && p.inStock)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)
      setSuggestions(picks)
    })
  }, [items])

  const shippingCost = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shippingCost

  const handleClearCart = useCallback(
    (addToast) => {
      clearCart()
      addToast('Carrito vaciado', 'info')
    },
    [clearCart]
  )

  const handleRemoveItem = useCallback(
    (item, addToast) => {
      removeItem(item.id)
      addToast(`${item.name} eliminado del carrito`, 'info')
    },
    [removeItem]
  )

  return {
    suggestions,
    shippingCost,
    total,
    AVAILABLE_PROMOS,
    handleClearCart,
    handleRemoveItem,
    isEmpty: items.length === 0,
  }
}