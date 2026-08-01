import { useEffect, useCallback } from 'react'

export function useQuickView({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const handleAdd = useCallback((product, addItem, addToast) => {
    if (!product.inStock) return
    addItem(product)
    addToast(`${product.name} añadido al carrito`)
  }, [])

  const handleWishlist = useCallback((product, toggleItem, isWishlisted, addToast) => {
    toggleItem(product)
    addToast(
      isWishlisted
        ? `${product.name} eliminado de favoritos`
        : `${product.name} añadido a favoritos`,
      isWishlisted ? 'info' : 'success'
    )
  }, [])

  return {
    handleAdd,
    handleWishlist,
  }
}