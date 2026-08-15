import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts, SELLER_CATEGORIES } from '../hooks/useProducts'
import ProductRow from '../components/ProductRow'

const PAGE_SIZE = 8

const selectClass =
  'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer'

export default function Products() {
  usePageTitle('Productos')
  const { products, loading, error, remove } = useProducts()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [estado, setEstado] = useState('')
  const [orden, setOrden] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = products

    const q = search.trim().toLowerCase()
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q))
    if (category) result = result.filter((p) => p.category === category)
    if (estado === 'activo') result = result.filter((p) => p.stock > 0)
    if (estado === 'agotado') result = result.filter((p) => p.stock === 0)

    if (orden === 'asc') result = [...result].sort((a, b) => a.price - b.price)
    if (orden === 'desc') result = [...result].sort((a, b) => b.price - a.price)

    return result
  }, [products, search, category, estado, orden])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Productos</h1>
          <p className="text-xs text-slate-400 mt-1">Gestiona el catálogo que ves en la tienda</p>
        </div>
        <Link
          to="/productos/nuevo"
          className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Añadir nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 mb-6 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => updateFilter(setSearch)(e.target.value)}
            placeholder="Buscar productos por nombre..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-sm pl-10 pr-3 py-2.5 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 outline-none"
          />
        </div>
        <select value={category} onChange={(e) => updateFilter(setCategory)(e.target.value)} className={selectClass}>
          <option value="">Categoría</option>
          {SELLER_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select value={estado} onChange={(e) => updateFilter(setEstado)(e.target.value)} className={selectClass}>
          <option value="">Estado</option>
          <option value="activo">Activo</option>
          <option value="agotado">Sin stock</option>
        </select>
        <select value={orden} onChange={(e) => updateFilter(setOrden)(e.target.value)} className={selectClass}>
          <option value="">Precio</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
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
      ) : filtered.length === 0 ? (
        <p className="text-center text-xs text-slate-400 py-20">No hay productos que coincidan con los filtros.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageItems.map((p) => (
              <ProductRow key={p.id} product={p} onDelete={remove} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                    n === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary hover:text-primary'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
