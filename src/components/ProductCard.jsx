import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'

export default function ProductCard({ product, onQuickView }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()

  const wishlisted = isWishlisted(product.id)
  
  // Calculate discount percentage if original price exists
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0

  // Category labels and color accents
  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'smart_tech':
      case 'audio_gear':
      case 'wearables':
        return {
          label: cat.replace('_', ' ').toUpperCase(),
          btnBg: 'bg-tech-blue hover:bg-sky-700 text-white',
          textClass: 'text-tech-blue'
        }
      case 'streaming':
        return {
          label: 'STREAMING',
          btnBg: 'bg-stream-purple hover:bg-violet-700 text-white',
          textClass: 'text-stream-purple'
        }
      default:
        return {
          label: 'BABY GEAR',
          btnBg: 'bg-[#5c4c3e] hover:bg-[#4a3e35] text-white',
          textClass: 'text-[#5c4c3e]'
        }
    }
  }

  const theme = getCategoryTheme(product.category)

  // Badge text
  let badgeText = ''
  let badgeClass = ''
  if (discountPercent > 0) {
    badgeText = `Sale -${discountPercent}%`
    badgeClass = 'bg-red-50 text-red-600 border border-red-200'
  } else if (product.createdAt && new Date(product.createdAt) > new Date('2025-01-01')) {
    badgeText = 'New'
    badgeClass = 'bg-slate-50 text-slate-700 border border-slate-200'
  } else if (product.rating >= 4.9) {
    badgeText = 'Popular'
    badgeClass = 'bg-sky-50 text-sky-600 border border-sky-200'
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300">
      
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-950 group">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={product.image} 
            alt={product.name} 
            loading="lazy" 
          />
        </Link>

        {/* Badges */}
        {badgeText && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeClass}`}>
            {badgeText}
          </span>
        )}

        {!product.inStock && (
          <span className="absolute top-3 left-3 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Agotado
          </span>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={() => toggleItem(product)}
          className={`absolute top-3 right-3 rounded-full size-8 transition-colors flex items-center justify-center border ${
            wishlisted 
              ? 'bg-red-500 border-red-500 text-white' 
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500'
          }`}
          aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <span className={`material-symbols-outlined text-base ${wishlisted ? 'fill-current' : ''}`}>
            favorite
          </span>
        </button>

        {/* Quick View Button */}
        {onQuickView && (
          <button 
            onClick={() => onQuickView(product)}
            className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm py-2 rounded-xl text-slate-800 dark:text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md cursor-pointer"
          >
            Vista Rápida
          </button>
        )}
      </div>

      {/* Info details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          {/* Category & Rating row */}
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className={`${theme.textClass} tracking-widest`}>
              {product.subcategory || theme.label}
            </span>
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined text-[10px] text-amber-400 fill-current select-none">star</span>
              {product.rating.toFixed(1)}
            </span>
          </div>

          <Link 
            to={`/product/${product.id}`} 
            className="font-extrabold text-slate-800 dark:text-slate-200 text-sm hover:text-primary transition-colors line-clamp-1 block"
          >
            {product.name}
          </Link>
          
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed h-7">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add Button row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-slate-800 dark:text-slate-100 font-extrabold text-sm sm:text-base">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button 
            onClick={() => addItem(product)}
            disabled={!product.inStock}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${theme.btnBg}`}
          >
            <span className="material-symbols-outlined text-xs">add_shopping_cart</span>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
