import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts } from '../hooks/useProducts'
import ProductRow from '../components/ProductRow'

export default function Products() {
  usePageTitle('Productos')
  const { products, loading, error, remove } = useProducts()

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Tus productos</h1>
          <p className="text-xs text-slate-400 mt-1">Administra el catálogo que ves en la tienda</p>
        </div>
        <Link
          to="/productos/nuevo"
          className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Añadir producto
        </Link>
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
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Aún no tienes productos</h3>
            <p className="text-xs text-slate-400 mt-1">Añade tu primer producto para que aparezca en la tienda.</p>
          </div>
          <Link
            to="/productos/nuevo"
            className="bg-primary hover:bg-opacity-95 text-white py-2 px-6 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Añadir producto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
