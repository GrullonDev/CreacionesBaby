import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'
import { useToast } from '../context/useToast'
import Rating from './Rating'
import { formatCurrency } from '../utils/currency'
import { useQuickView } from '../hooks/useQuickView'

export default function QuickView({ product, onClose }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { handleAdd: onAdd, handleWishlist: onWishlist } = useQuickView({ onClose })

  if (!product) return null

  const wishlisted = isWishlisted(product.id)
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAdd = () => onAdd(product, addItem, addToast)

  const handleWishlist = () => onWishlist(product, toggleItem, wishlisted, addToast)

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative animate-slide-up border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Column */}
          <div className="relative aspect-[4/5] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />

            {/* Badges */}
            {discountPercent > 0 ? (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                -{discountPercent}% OFF
              </span>
            ) : product.createdAt && new Date(product.createdAt) > new Date('2025-01-01') ? (
              <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Nuevo
              </span>
            ) : null}

            {!product.inStock && (
              <span className="absolute top-4 left-4 bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Agotado
              </span>
            )}
          </div>

          {/* Product Details Column */}
          <div className="p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-primary font-extrabold uppercase tracking-widest block mb-1">
                  {product.category}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white leading-tight">
                  {product.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Rating value={product.rating} reviews={product.reviews} />
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 h-32 overflow-y-auto">
                {product.description}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex gap-3">
                {/* Add to Cart */}
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-bold hover:bg-opacity-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span className="material-symbols-outlined text-lg">shopping_cart</span>
                  {product.inStock ? 'Añadir al carrito' : 'Sin stock'}
                </button>

                {/* Favorite */}
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    wishlisted
                      ? 'bg-primary border-primary text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary'
                  }`}
                  aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <span className={`material-symbols-outlined text-xl ${wishlisted ? 'fill-current' : ''}`}>
                    favorite
                  </span>
                </button>
              </div>

              <Link 
                to={`/product/${product.id}`} 
                onClick={onClose}
                className="w-full border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary py-3 rounded-xl font-semibold transition-colors flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
              >
                Ver todos los detalles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
