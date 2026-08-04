import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useSellerProducts } from '../hooks/useSellerProducts'
import SellerProductCard from '../components/SellerProductCard'

export default function SellerDashboard() {
  usePageTitle('Panel de Vendedor')
  const { products, loading, remove } = useSellerProducts()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Panel de Vendedor</h1>
          <p className="text-xs text-slate-400 mt-1">Administra las fotos, títulos y descripciones de tus productos</p>
        </div>
        <Link
          to="/vendedor/nuevo"
          className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Añadir producto
        </Link>
      </div>

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
            to="/vendedor/nuevo"
            className="bg-primary hover:bg-opacity-95 text-white py-2 px-6 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Añadir producto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <SellerProductCard key={p.id} product={p} onDelete={remove} />
          ))}
        </div>
      )}
    </main>
  )
}
