import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import Pagination from '../components/Pagination'
import { getProductsByCategory, searchProducts, categories } from '../data/products'

const PAGE_SIZES = [8, 12, 16, 24]

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [sort, setSort] = useState('default')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  const activeCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const fetchProducts = query
      ? searchProducts(query)
      : getProductsByCategory(activeCategory === 'all' ? null : activeCategory)
    fetchProducts.then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [activeCategory, query])

  const handleCategoryChange = (cat) => {
    setQuery('')
    setSort('default')
    setPriceMin('')
    setPriceMax('')
    const params = cat === 'all' ? {} : { category: cat }
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({})
  }

  const handleClearFilters = () => {
    setQuery('')
    setSort('default')
    setPriceMin('')
    setPriceMax('')
    setSearchParams({})
  }

  let filtered = [...products]

  if (priceMin !== '') filtered = filtered.filter((p) => p.price >= Number(priceMin))
  if (priceMax !== '') filtered = filtered.filter((p) => p.price <= Number(priceMax))

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
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (page - 1) * pageSize
  const paginatedProducts = filtered.slice(start, start + pageSize)

  return (
    <main className="main">
      <div className="products-page">
        <aside className="products-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            <li>
              <button
                className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              </li>
            ))}
          </ul>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </form>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => { setPage(1); setPriceMin(e.target.value) }}
                className="search-input"
                min="0"
              />
              <span className="price-range-sep">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => { setPage(1); setPriceMax(e.target.value) }}
                className="search-input"
                min="0"
              />
            </div>
          </div>

          {(sort !== 'default' || priceMin !== '' || priceMax !== '') && (
            <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </aside>

        <div className="products-content">
          <div className="products-header">
            <div>
              <h2>
                {query
                  ? `Results for "${query}"`
                  : activeCategory === 'all'
                    ? 'All Products'
                    : categories.find((c) => c.id === activeCategory)?.name || 'Products'}
              </h2>
              <span className="products-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="products-controls">
              <div className="sort-control">
                <select
                  value={sort}
                  onChange={(e) => { setPage(1); setSort(e.target.value) }}
                  className="sort-select"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="page-size-control">
                <select
                  value={pageSize}
                  onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)) }}
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span>per page</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>No products found.</p>
              <button className="btn btn-primary" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
                ))}
              </div>
              <div className="pagination-bar">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                <span className="pagination-info">
                  Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </main>
  )
}
