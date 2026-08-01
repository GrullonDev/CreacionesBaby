import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'
import { useToast } from '../context/useToast'
import { formatCurrency } from '../utils/currency'
import { useProductBadge, useCategoryTheme, useStockStatus } from '../hooks/useProductHelpers'

export default function ProductCard({ product, onQuickView }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const [added, setAdded] = useState(false)

  const wishlisted = isWishlisted(product.id)
  const badge = useProductBadge(product)
  const theme = useCategoryTheme(product.category)
  const stockStatus = useStockStatus(product)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) return
    addItem(product)
    addToast(`${product.name} añadido al carrito`)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
    addToast(
      wishlisted
        ? `${product.name} eliminado de favoritos`
        : `${product.name} añadido a favoritos`,
      wishlisted ? 'info' : 'success'
    )
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
        {badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${badge.className}`}>
            {badge.text}
          </span>
        )}

        {stockStatus.status === 'out' && (
          <span className="absolute top-3 left-3 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {stockStatus.text}
          </span>
        )}
        {stockStatus.status === 'low' && (
          <span className={`absolute top-3 right-12 ${stockStatus.className} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
            {stockStatus.text}
          </span>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
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
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
              added ? 'bg-emerald-500 text-white' : theme.btnBg
            }`}
          >
            <span className={`material-symbols-outlined text-xs ${added ? 'animate-bump' : ''}`}>
              {added ? 'check' : 'add_shopping_cart'}
            </span>
            {added ? 'Añadido' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
