import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import Pagination from '../components/Pagination'
import products from '../data/products'

const PAGE_SIZES = [8, 12, 16, 24]

const SORT_OPTIONS = [
  { value: 'default', label: 'Ordenar por' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'rating', label: 'Más Valorados' },
]

const SIZES = ['RN', '0-3m', '3-6m', '6-12m', '1-2 años', '3-5 años']

const COLORS = [
  { name: 'Crema', hex: '#fdf5e6' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Gris', hex: '#d1d5db' },
  { name: 'Verde', hex: '#dcfce7' },
  { name: 'Rosa', hex: '#fce7f3' },
  { name: 'Azul', hex: '#dbeafe' },
  { name: 'Café', hex: '#78350f' },
]

const CATEGORY_LABELS = {
  'mamelucos': 'Mamelucos',
  'conjuntos': 'Conjuntos',
  'pijamas': 'Pijamas',
  'accesorios': 'Accesorios',
  'calzado': 'Calzado',
  'recien_nacidos': 'Recién Nacidos'
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [sort, setSort] = useState('default')
  
  // Local filter states
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  const activeCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search') || ''

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [activeCategory, searchQuery, priceMin, priceMax, selectedSize, selectedColor, sort])

  const handleCategoryChange = (categoryKey) => {
    const params = {}
    if (categoryKey !== 'all') params.category = categoryKey
    if (searchQuery) params.search = searchQuery
    setSearchParams(params)
  }

  const handleClearFilters = () => {
    setPriceMin('')
    setPriceMax('')
    setSelectedSize('')
    setSelectedColor('')
    setSort('default')
    setSearchParams({})
  }

  // Filter products logic
  let filtered = [...products]

  // 1. Category Filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter((p) => p.category === activeCategory)
  }

  // 2. Search Query Filter
  if (searchQuery) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 3. Price Filter
  if (priceMin !== '') {
    filtered = filtered.filter((p) => p.price >= Number(priceMin))
  }
  if (priceMax !== '') {
    filtered = filtered.filter((p) => p.price <= Number(priceMax))
  }

  // 4. Size Filter
  if (selectedSize) {
    filtered = filtered.filter((p) => p.sizes && p.sizes.includes(selectedSize))
  }

  // 5. Color Filter
  if (selectedColor) {
    filtered = filtered.filter((p) => p.colors && p.colors.includes(selectedColor))
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const startIdx = (page - 1) * pageSize
  const paginatedProducts = filtered.slice(startIdx, startIdx + pageSize)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-slate-900 dark:text-slate-100 font-bold">Catálogo</span>
        {activeCategory !== 'all' && (
          <>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-slate-400 capitalize">{CATEGORY_LABELS[activeCategory] || activeCategory}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="material-symbols-outlined text-primary text-xl">filter_list</span>
              Filtros
            </h3>
            {(activeCategory !== 'all' || searchQuery || priceMin || priceMax || selectedSize || selectedColor || sort !== 'default') && (
              <button 
                onClick={handleClearFilters}
                className="text-xs text-primary font-bold hover:underline"
              >
                Limpiar todo
              </button>
            )}
          </div>

          {/* Categories Accordion */}
          <details className="group border-b border-slate-100 dark:border-slate-800 pb-4" open>
            <summary className="flex items-center justify-between cursor-pointer list-none py-2 text-slate-900 dark:text-white font-bold text-sm">
              Categorías
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-400">expand_more</span>
            </summary>
            <div className="mt-3 space-y-2">
              <button 
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition-colors ${
                  activeCategory === 'all' 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                Todos los productos
              </button>
              {Object.keys(CATEGORY_LABELS).map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => handleCategoryChange(catKey)}
                  className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition-colors ${
                    activeCategory === catKey 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  {CATEGORY_LABELS[catKey]}
                </button>
              ))}
            </div>
          </details>

          {/* Sizes Accordion */}
          <details className="group border-b border-slate-100 dark:border-slate-800 pb-4" open>
            <summary className="flex items-center justify-between cursor-pointer list-none py-2 text-slate-900 dark:text-white font-bold text-sm">
              Talla
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-400">expand_more</span>
            </summary>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`py-2 text-center rounded-lg border text-xs font-semibold transition-all ${
                    selectedSize === sz
                      ? 'border-primary bg-primary/10 text-primary font-bold scale-95'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </details>

          {/* Color Accordion */}
          <details className="group border-b border-slate-100 dark:border-slate-800 pb-4" open>
            <summary className="flex items-center justify-between cursor-pointer list-none py-2 text-slate-900 dark:text-white font-bold text-sm">
              Color
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-400">expand_more</span>
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLORS.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(selectedColor === col.name ? '' : col.name)}
                  className={`size-7 rounded-full border transition-all ${
                    selectedColor === col.name
                      ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background-dark scale-95 border-primary'
                      : 'border-slate-200 dark:border-slate-800 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </details>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm">Rango de Precio</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs p-2 text-slate-800 dark:text-slate-200 focus:ring-primary focus:border-primary"
                min="0"
              />
              <span className="text-slate-400">—</span>
              <input
                type="number"
                placeholder="Máx"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs p-2 text-slate-800 dark:text-slate-200 focus:ring-primary focus:border-primary"
                min="0"
              />
            </div>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <div className="flex-grow">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {searchQuery 
                  ? `Resultados para "${searchQuery}"`
                  : activeCategory === 'all'
                    ? 'Todos los Productos'
                    : CATEGORY_LABELS[activeCategory] || 'Productos'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>{s} por pág.</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Products */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">No encontramos productos</h3>
                <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o la búsqueda.</p>
              </div>
              <button 
                onClick={handleClearFilters}
                className="bg-primary hover:bg-opacity-95 text-white py-2 px-6 rounded-lg text-xs font-bold transition-all shadow-sm"
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
                <span className="text-xs text-slate-400">
                  Mostrando {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)} de {filtered.length} productos
                </span>
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
