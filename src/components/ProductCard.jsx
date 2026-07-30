import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Rating from './Rating'

export default function ProductCard({ product, onQuickView }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()

  return (
    <div className="product-card">
      <div className="product-card-image">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        {product.originalPrice && <span className="sale-badge">Sale</span>}
        {!product.inStock && <span className="out-of-stock-badge">Out of Stock</span>}

        <button
          className={`wishlist-btn ${isWishlisted(product.id) ? 'active' : ''}`}
          onClick={() => toggleItem(product)}
          aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {onQuickView && (
          <button className="quick-view-btn" onClick={() => onQuickView(product)} aria-label="Quick view">
            Quick View
          </button>
        )}
      </div>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <Rating value={product.rating} reviews={product.reviews} />
        <div className="product-pricing">
          {product.originalPrice ? (
            <>
              <span className="current-price">${product.price.toFixed(2)}</span>
              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="current-price">${product.price.toFixed(2)}</span>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => addItem(product)}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  )
}
