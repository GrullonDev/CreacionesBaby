import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { getProductById } from '../data/products'
import Rating from '../components/Rating'
import ImageCarousel from '../components/ImageCarousel'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProductById(id).then((p) => {
      setProduct(p)
      setLoading(false)
      setAdded(false)
    })
  }, [id])

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <main className="main"><div className="loading">Loading...</div></main>
  if (!product) return <main className="main"><div className="empty-state"><p>Product not found.</p><Link to="/products" className="btn btn-primary">Back to Products</Link></div></main>

  return (
    <main className="main">
      <div className="product-detail">
        <div className="product-detail-image">
          <ImageCarousel images={product.images || [product.image]} alt={product.name} />
          {product.originalPrice && <span className="sale-badge large">Sale</span>}
        </div>

        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <Rating value={product.rating} reviews={product.reviews} />

          <div className="product-pricing">
            {product.originalPrice ? (
              <>
                <span className="current-price large">${product.price.toFixed(2)}</span>
                <span className="original-price large">${product.originalPrice.toFixed(2)}</span>
                <span className="savings">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
              </>
            ) : (
              <span className="current-price large">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-features">
            <h3>Features</h3>
            <ul>
              {product.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="product-actions">
            <div className="product-actions-row">
              <button
                className={`btn btn-primary btn-lg ${added ? 'btn-success' : ''}`}
                onClick={handleAdd}
                disabled={!product.inStock}
              >
                {!product.inStock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
              </button>
              <button
                className={`btn btn-icon btn-lg ${isWishlisted(product.id) ? 'wishlisted' : ''}`}
                onClick={() => toggleItem(product)}
                aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
