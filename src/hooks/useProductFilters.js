import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts } from '../services/productService'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'rating', label: 'Mejor Valorados' },
]

const CATEGORY_MAPPING = [
  { id: 'baby_gear', label: 'Baby Essentials' },
  { id: 'smart_tech', label: 'Smart Technology' },
  { id: 'audio_gear', label: 'Audio Gear' },
  { id: 'wearables', label: 'Nursery Tech' },
]

const BRANDS = ['Nanit', 'Apple', 'Bose', 'UPPAbaby']

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [sort, setSort] = useState('recommended')

  const [selectedCats, setSelectedCats] = useState([])
  const [maxPrice, setMaxPrice] = useState(2000)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [minRating, setMinRating] = useState(null)

  const categoryQuery = searchParams.get('category')
  const searchQuery = searchParams.get('search')
  const dealsQuery = searchParams.get('deals')

  useEffect(() => {
    fetchProducts().then((data) => {
      setAllProducts(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (categoryQuery) {
      setSelectedCats([categoryQuery])
    } else {
      setSelectedCats([])
    }
  }, [categoryQuery])

  useEffect(() => {
    setPage(1)
  }, [selectedCats, maxPrice, selectedBrands, minRating, sort, searchQuery, dealsQuery])

  const handleCatCheckboxChange = useCallback((catId) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    )
  }, [])

  const handleBrandCheckboxChange = useCallback((brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }, [])

  const handleClearFilters = useCallback(() => {
    setSelectedCats([])
    setMaxPrice(2000)
    setSelectedBrands([])
    setMinRating(null)
    setSort('recommended')
    setSearchParams({})
  }, [setSearchParams])

  const filtered = useMemo(() => {
    let result = allProducts.filter((p) => p.category !== 'streaming')

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    }

    if (dealsQuery) {
      result = result.filter((p) => p.originalPrice !== null)
    }

    if (selectedCats.length > 0) {
      result = result.filter((p) => selectedCats.includes(p.category))
    }

    result = result.filter((p) => p.price <= maxPrice)

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand))
    }

    if (minRating) {
      result = result.filter((p) => p.rating >= minRating)
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        result.sort((a, b) => b.rating - a.rating)
        break
    }

    return result
  }, [
    allProducts,
    searchQuery,
    dealsQuery,
    selectedCats,
    maxPrice,
    selectedBrands,
    minRating,
    sort,
  ])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize)),
    [filtered, pageSize]
  )
  const startIdx = useMemo(() => (page - 1) * pageSize, [page, pageSize])
  const paginatedProducts = useMemo(
    () => filtered.slice(startIdx, startIdx + pageSize),
    [filtered, startIdx, pageSize]
  )

  const pageTitle = useMemo(() => {
    if (searchQuery) return `Búsqueda: ${searchQuery}`
    if (dealsQuery) return 'Ofertas y Deals'
    if (categoryQuery === 'baby_gear') return 'Colección Baby'
    if (categoryQuery === 'smart_tech') return 'Smart Technology'
    return 'Catálogo Completo'
  }, [searchQuery, dealsQuery, categoryQuery])

  return {
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
    setSelectedCats,
    maxPrice,
    setMaxPrice,
    selectedBrands,
    setSelectedBrands,
    minRating,
    setMinRating,
    searchQuery,
    dealsQuery,
    categoryQuery,
    pageTitle,
    handleCatCheckboxChange,
    handleBrandCheckboxChange,
    handleClearFilters,
    SORT_OPTIONS,
    CATEGORY_MAPPING,
    BRANDS,
  }
}