import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts, SELLER_CATEGORIES } from '../hooks/useProducts'
import { formatCurrency } from '../utils/currency'

function categoryLabel(id) {
  return SELLER_CATEGORIES.find((c) => c.id === id)?.label || id
}

export default function Inventory() {
  usePageTitle('Inventario')
  const { products, loading, error } = useProducts()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Inventario</h1>
        <p className="text-xs text-slate-400 mt-1">
          Vista básica del stock por producto — edita la cantidad desde cada producto.
        </p>
      </div>

      <div className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
        <span className="material-symbols-outlined text-sm text-primary/70 mt-0.5">info</span>
        <span>
          Todavía en desarrollo: alertas de stock bajo, historial de movimientos y exportar a CSV. Por ahora esta
          tabla refleja el inventario real de tus productos.
        </span>
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : products.length === 0 ? (
        <p className="text-xs text-slate-400 py-10 text-center">Aún no tienes productos con inventario.</p>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 font-bold">Producto</th>
                <th className="px-5 py-3 font-bold hidden sm:table-cell">Categoría</th>
                <th className="px-5 py-3 font-bold text-right">Stock</th>
                <th className="px-5 py-3 font-bold text-right hidden sm:table-cell">Valor</th>
                <th className="px-5 py-3 font-bold text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <td className="px-5 py-3">
                    <Link to={`/productos/${p.id}/editar`} className="font-bold text-slate-800 dark:text-white hover:text-primary line-clamp-1">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                    {categoryLabel(p.category)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-700 dark:text-slate-200">{p.stock}</td>
                  <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                    {formatCurrency(p.price * p.stock)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        p.stock > 0
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                          : 'bg-red-50 text-red-500 dark:bg-red-500/10'
                      }`}
                    >
                      {p.stock > 0 ? 'Disponible' : 'Agotado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
