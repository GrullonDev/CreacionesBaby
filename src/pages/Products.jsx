import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import Pagination from '../components/Pagination'
import products from '../data/products'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

const CATEGORY_MAPPING = [
  { id: 'baby_gear', label: 'Baby Essentials' },
  { id: 'smart_tech', label: 'Smart Technology' },
  { id: 'audio_gear', label: 'Audio Gear' },
  { id: 'wearables', label: 'Nursery Tech' }
]

const BRANDS = ['Nanit', 'Apple', 'Bose', 'UPPAbaby']

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [sort, setSort] = useState('recommended')
  
  // Filters state
  const [selectedCats, setSelectedCats] = useState([])
  const [maxPrice, setMaxPrice] = useState(2000)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [minRating, setMinRating] = useState(null)
  
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  const categoryQuery = searchParams.get('category')
  const searchQuery = searchParams.get('search')
  const dealsQuery = searchParams.get('deals')

  // Initialize from search URL parameters
  useEffect(() => {
    if (categoryQuery) {
      setSelectedCats([categoryQuery])
    } else {
      setSelectedCats([])
    }
  }, [categoryQuery])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [selectedCats, maxPrice, selectedBrands, minRating, sort, searchQuery, dealsQuery])

  const handleCatCheckboxChange = (catId) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter(c => c !== catId))
    } else {
      setSelectedCats([...selectedCats, catId])
    }
  }

  const handleBrandCheckboxChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand))
    } else {
      setSelectedBrands([...selectedBrands, brand])
    }
  }

  const handleClearFilters = () => {
    setSelectedCats([])
    setMaxPrice(2000)
    setSelectedBrands([])
    setMinRating(null)
    setSort('recommended')
    setSearchParams({})
  }

  // Filter products logic
  let filtered = products.filter(p => p.category !== 'streaming') // exclude streaming subs in normal catalog

  // 1. Search Query
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 2. Deals / Sale Query
  if (dealsQuery) {
    filtered = filtered.filter(p => p.originalPrice !== null)
  }

  // 3. Category Filter
  if (selectedCats.length > 0) {
    filtered = filtered.filter(p => selectedCats.includes(p.category))
  }

  // 4. Price Filter
  filtered = filtered.filter(p => p.price <= maxPrice)

  // 5. Brand Filter
  if (selectedBrands.length > 0) {
    filtered = filtered.filter(p => selectedBrands.includes(p.brand))
  }

  // 6. Rating Filter
  if (minRating) {
    filtered = filtered.filter(p => p.rating >= minRating)
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
    default:
      // recommended: sort popular first or by ID
      filtered.sort((a, b) => b.rating - a.rating)
      break
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const startIdx = (page - 1) * pageSize
  const paginatedProducts = filtered.slice(startIdx, startIdx + pageSize)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow text-slate-800 dark:text-slate-100">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-60 flex-shrink-0 space-y-8 text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-base tracking-tight">Filters</h3>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-slate-400 hover:text-primary transition-colors font-semibold"
            >
              Clear all
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h4>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range</h4>
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
                <span>$0</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">${maxPrice === 2000 ? '2,000+' : maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Top Brands */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Brands</h4>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Min. Rating</h4>
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
                {searchQuery ? 'Search Results' : 'Baby & Tech'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Showing {filtered.length > 0 ? startIdx + 1 : 0}-{Math.min(startIdx + pageSize, filtered.length)} of {filtered.length} products
              </p>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Sort by:</span>
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
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">No products found</h3>
                <p className="text-xs text-slate-400 mt-1">Try resetting the filters or modifying your search query.</p>
              </div>
              <button 
                onClick={handleClearFilters}
                className="bg-primary hover:bg-opacity-95 text-white py-2 px-6 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Reset Filters
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
