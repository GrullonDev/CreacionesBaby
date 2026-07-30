import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Rating from './Rating'

export default function ProductCard({ product, onQuickView }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()

  const wishlisted = isWishlisted(product.id)
  
  // Calculate discount percentage if original price exists
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={product.image} 
            alt={product.name} 
            loading="lazy" 
          />
        </Link>

        {/* Badges */}
        {discountPercent > 0 ? (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            -{discountPercent}%
          </span>
        ) : product.createdAt && new Date(product.createdAt) > new Date('2025-01-01') ? (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            Nuevo
          </span>
        ) : null}

        {!product.inStock && (
          <span className="absolute top-2 left-2 bg-slate-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            Agotado
          </span>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={() => toggleItem(product)}
          className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors flex items-center justify-center ${
            wishlisted 
              ? 'bg-primary text-white' 
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white'
          }`}
          aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <span className={`material-symbols-outlined text-xl ${wishlisted ? 'fill-current' : ''}`}>
            favorite
          </span>
        </button>

        {/* Quick View Trigger on Hover */}
        {onQuickView && (
          <button 
            onClick={() => onQuickView(product)}
            className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm py-2 rounded-lg text-slate-900 dark:text-white text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md"
          >
            Vista Rápida
          </button>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
          <Link 
            to={`/product/${product.id}`} 
            className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 hover:text-primary transition-colors line-clamp-2 block h-10"
          >
            {product.name}
          </Link>
          <div className="mb-2">
            <Rating value={product.rating} reviews={product.reviews} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-primary font-extrabold text-base">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button 
            onClick={() => addItem(product)}
            disabled={!product.inStock}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary transition-all p-2 rounded-lg group/btn flex items-center justify-center"
            title={product.inStock ? 'Añadir al carrito' : 'Sin stock'}
          >
            <span className="material-symbols-outlined text-lg block group-hover/btn:scale-110 transition-transform">
              add_shopping_cart
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
