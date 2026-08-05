import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useToast } from '../context/useToast'
import { extractApiError } from '../utils/apiError'

export const SELLER_CATEGORIES = [
  { id: 'baby_gear', label: 'Baby Essentials' },
  { id: 'smart_tech', label: 'Smart Technology' },
  { id: 'audio_gear', label: 'Audio Gear' },
  { id: 'wearables', label: 'Nursery Tech' },
]

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToast } = useToast()

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return api
      .get('/products', { params: { mine: true } })
      .then((res) => setProducts(res.data))
      .catch((err) => setError(extractApiError(err, 'No se pudieron cargar tus productos.')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(
    async (id, name) => {
      try {
        await api.delete(`/products/${id}`)
        await refresh()
        addToast(`${name} eliminado`, 'info')
      } catch (err) {
        addToast(extractApiError(err, 'No se pudo eliminar el producto.'), 'error')
      }
    },
    [refresh, addToast]
  )

  return { products, loading, error, refresh, remove }
}
