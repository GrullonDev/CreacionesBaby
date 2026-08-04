import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'

export default function SellerProductCard({ product, onDelete }) {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
      onDelete(product.id, product.name)
    }
  }

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
      <Link to={`/product/${product.id}`} className="size-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex-shrink-0">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined">image</span>
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-grow">
        <Link to={`/product/${product.id}`} className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-primary transition-colors line-clamp-1 block">
          {product.name}
        </Link>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span className="font-extrabold text-slate-800 dark:text-slate-200">{formatCurrency(product.price)}</span>
          <span className={product.inStock ? 'text-emerald-600' : 'text-red-500'}>
            {product.inStock ? `${product.stock} en stock` : 'Agotado'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          to={`/vendedor/${product.id}/editar`}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
          aria-label="Editar producto"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Eliminar producto"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  )
}
