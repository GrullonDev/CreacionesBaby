import { useState, useEffect, useCallback } from 'react'
import { fetchProductById, fetchRelatedProducts } from '../services/productService'
import { recordProductView } from '../utils/recentlyViewed'

function loadReviews(productId) {
  try {
    const data = localStorage.getItem('creaciones_reviews')
    const all = data ? JSON.parse(data) : {}
    return all[productId] || []
  } catch {
    return []
  }
}

function saveReview(productId, review) {
  try {
    const data = localStorage.getItem('creaciones_reviews')
    const all = data ? JSON.parse(data) : {}
    if (!all[productId]) all[productId] = []
    all[productId].unshift(review)
    localStorage.setItem('creaciones_reviews', JSON.stringify(all))
  } catch {}
}

export function useProductDetail({ id }) {
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, comment: '' })

  useEffect(() => {
    setLoading(true)
    fetchProductById(id).then((p) => {
      setProduct(p)
      if (p) {
        if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0])
        if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0])
        fetchRelatedProducts(p.category, p.id).then(setRelated)
        recordProductView(p.id)
      }
      setLoading(false)
      setQuantity(1)
      setAdded(false)
    })
    setReviews(loadReviews(id))
  }, [id])

  const handleReviewSubmit = useCallback(
    (e) => {
      e.preventDefault()
      if (!reviewForm.author.trim() || !reviewForm.comment.trim()) return
      const newReview = { ...reviewForm, id: Date.now(), date: new Date().toISOString() }
      saveReview(id, newReview)
      setReviews((prev) => [newReview, ...prev])
      setReviewForm({ author: '', rating: 5, comment: '' })
    },
    [id, reviewForm]
  )

  const handleAdd = useCallback(
    (addItem, addToast) => {
      if (!product) return
      for (let i = 0; i < quantity; i++) {
        addItem({
          ...product,
          selectedColor,
          selectedSize,
        })
      }
      setAdded(true)
      addToast(
        quantity > 1
          ? `${quantity} × ${product.name} añadidos al carrito`
          : `${product.name} añadido al carrito`
      )
      setTimeout(() => setAdded(false), 2000)
    },
    [product, quantity, selectedColor, selectedSize]
  )

  const handleWishlistToggle = useCallback(
    (toggleItem, addToast, isWishlisted) => {
      if (!product) return
      toggleItem(product)
      addToast(
        isWishlisted
          ? `${product.name} eliminado de favoritos`
          : `${product.name} añadido a favoritos`,
        isWishlisted ? 'info' : 'success'
      )
    },
    [product]
  )

  const discountPercent = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return {
    product,
    related,
    loading,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    quantity,
    setQuantity,
    added,
    reviews,
    reviewForm,
    setReviewForm,
    discountPercent,
    handleReviewSubmit,
    handleAdd,
    handleWishlistToggle,
  }
}