import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'

export default function ProductRow({ product, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined">image</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-grow">
        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{product.name}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-0.5">
          <span>{formatCurrency(product.price)}</span>
          <span className={product.stock > 0 ? '' : 'text-red-500 font-bold'}>
            {product.stock > 0 ? `${product.stock} en inventario` : 'Sin inventario'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          to={`/productos/${product.id}/editar`}
          aria-label={`Editar ${product.name}`}
          className="p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </Link>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onDelete(product.id, product.name)
                setConfirming(false)
              }}
              className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1.5"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label={`Eliminar ${product.name}`}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        )}
      </div>
    </div>
  )
}
