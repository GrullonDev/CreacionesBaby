// Note: file kept as ProductRow.jsx even though it now renders a grid card
// (not a row) — renaming would leave the old filename as dead code since
// this environment's tools can't delete files. Safe to `git mv` this to
// ProductCard.jsx (and update the one import in Products.jsx) by hand.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import { SELLER_CATEGORIES } from '../hooks/useProducts'

function categoryLabel(product) {
  return product.subcategory || SELLER_CATEGORIES.find((c) => c.id === product.category)?.label || product.category
}

export default function ProductRow({ product, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const inStock = product.stock > 0

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden group">
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-3xl">image</span>
          </div>
        )}
        <span
          className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
            inStock
              ? 'bg-white/90 text-emerald-600 dark:bg-slate-900/90'
              : 'bg-white/90 text-red-500 dark:bg-slate-900/90'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {inStock ? 'Activo' : 'Sin stock'}
        </span>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/productos/${product.id}/editar`}
            aria-label={`Editar ${product.name}`}
            className="w-8 h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300 hover:text-primary flex items-center justify-center shadow-sm"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </Link>
          {confirming ? (
            <button
              onClick={() => {
                onDelete(product.id, product.name)
                setConfirming(false)
              }}
              className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              Confirmar
            </button>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              aria-label={`Eliminar ${product.name}`}
              className="w-8 h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300 hover:text-red-500 flex items-center justify-center shadow-sm"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {categoryLabel(product)}
        </span>
        <Link to={`/productos/${product.id}/editar`}>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-primary text-sm">{formatCurrency(product.price)}</span>
          <span className={`text-[11px] font-semibold ${inStock ? 'text-slate-400' : 'text-red-500'}`}>
            Stock: {product.stock}
          </span>
        </div>
      </div>
    </div>
  )
}
