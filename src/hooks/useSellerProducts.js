import { useState, useEffect, useCallback } from 'react'
import { getSellerProducts, deleteSellerProduct } from '../data/sellerProducts'
import { useToast } from '../context/useToast'

export function useSellerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const refresh = useCallback(() => {
    setLoading(true)
    return getSellerProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(
    async (id, name) => {
      await deleteSellerProduct(id)
      await refresh()
      addToast(`${name} eliminado`, 'info')
    },
    [refresh, addToast]
  )

  return { products, loading, remove }
}
