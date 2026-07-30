import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Rating from './Rating'

export default function QuickView({ product, onClose }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  if (!product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="quickview-layout">
          <div className="quickview-image">
            <img src={product.image} alt={product.name} />
            {product.originalPrice && <span className="sale-badge large">Sale</span>}
            {!product.inStock && <span className="out-of-stock-badge">Out of Stock</span>}
          </div>

          <div className="quickview-info">
            <span className="product-category">{product.category}</span>
            <h2>{product.name}</h2>
            <Rating value={product.rating} reviews={product.reviews} />

            <div className="product-pricing">
              {product.originalPrice ? (
                <>
                  <span className="current-price large">${product.price.toFixed(2)}</span>
                  <span className="original-price large">${product.originalPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="current-price large">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            <div className="quickview-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => addItem(product)}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Unavailable'}
              </button>
              <button
                className={`btn btn-icon ${isWishlisted(product.id) ? 'wishlisted' : ''}`}
                onClick={() => toggleItem(product)}
                aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            <Link to={`/product/${product.id}`} className="btn btn-ghost btn-full" onClick={onClose}>
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
