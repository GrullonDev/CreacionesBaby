import { useState, useEffect, useCallback } from 'react'
import { fetchFeaturedProducts } from '../services/productService'
import { testimonials, storeStats } from '../data/testimonials'

export function useHomeLogic() {
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useEffect(() => {
    fetchFeaturedProducts().then((data) => {
      setFeatured(data)
      setLoadingFeatured(false)
    })
  }, [])

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product)
  }, [])

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null)
  }, [])

  return {
    featured,
    loadingFeatured,
    quickViewProduct,
    handleQuickView,
    closeQuickView,
    testimonials,
    storeStats,
  }
}