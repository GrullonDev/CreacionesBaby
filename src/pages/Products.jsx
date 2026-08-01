import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import QuickView from '../components/QuickView'
import Pagination from '../components/Pagination'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProductFilters } from '../hooks/useProductFilters'
import { formatCurrency } from '../utils/currency'

export default function Products() {
  const {
    loading,
    filtered,
    paginatedProducts,
    page,
    setPage,
    totalPages,
    startIdx,
    pageSize,
    sort,
    setSort,
    selectedCats,
    maxPrice,
    setMaxPrice,
    selectedBrands,
    minRating,
    setMinRating,
    searchQuery,
    dealsQuery,
    pageTitle,
    handleCatCheckboxChange,
    handleBrandCheckboxChange,
    handleClearFilters,
    SORT_OPTIONS,
    CATEGORY_MAPPING,
    BRANDS,
  } = useProductFilters()

  const [quickViewProduct, setQuickViewProduct] = useState(null)

  usePageTitle(pageTitle)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow text-slate-800 dark:text-slate-100">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-60 flex-shrink-0 space-y-8 text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-base tracking-tight">Filtros</h3>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-slate-400 hover:text-primary transition-colors font-semibold"
            >
              Limpiar todo
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categorías</h4>
            <div className="space-y-2">
              {CATEGORY_MAPPING.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-800">
                  <input 
                    type="checkbox" 
                    checked={selectedCats.includes(cat.id)}
                    onChange={() => handleCatCheckboxChange(cat.id)}
                    className="rounded border-slate-300 text-primary focus:ring-primary size-4"
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rango de Precio</h4>
            <div className="space-y-1">
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#5c4c3e]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-1">
                <span>{formatCurrency(0)}</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">{maxPrice === 2000 ? `${formatCurrency(2000)}+` : formatCurrency(maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Top Brands */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Marcas Destacadas</h4>
            <div className="space-y-2">
              {BRANDS.map((brand) => (
                <label key={brand} className="flex items-center gap-3 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-800">
                  <input 
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandCheckboxChange(brand)}
                    className="rounded border-slate-300 text-primary focus:ring-primary size-4"
                  />
                  {brand}
                </label>
              ))}
            </div>
          </div>

          {/* Min. Rating */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Puntuación Mínima</h4>
            <div className="flex gap-2">
              {[4, 3, 2].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? null : rating)}
                  className={`flex-grow py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                    minRating === rating
                      ? 'bg-primary border-primary text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rating}+
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid Content */}
        <div className="flex-grow w-full">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-5 mb-8 gap-4">
            <div className="text-left">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {searchQuery ? 'Resultados de Búsqueda' : dealsQuery ? 'Ofertas y Deals' : 'Baby & Tech'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Mostrando {filtered.length > 0 ? startIdx + 1 : 0}-{Math.min(startIdx + pageSize, filtered.length)} de {filtered.length} productos
              </p>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Ordenar por:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: pageSize }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">No se encontraron productos</h3>
                <p className="text-xs text-slate-400 mt-1">Intenta restablecer los filtros o modificar tu búsqueda.</p>
              </div>
              <button 
                onClick={handleClearFilters}
                className="bg-primary hover:bg-opacity-95 text-white py-2 px-6 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex flex-col items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-8">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickView 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </main>
  )
}
