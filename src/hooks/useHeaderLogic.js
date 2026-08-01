import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/productService'
import { getRecentSearches, addRecentSearch } from '../utils/recentSearches'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('creaciones_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function useHeaderLogic({ itemCount }) {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [dark, setDark] = useState(getInitialTheme)
  const [cartBump, setCartBump] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState(getRecentSearches)

  useEffect(() => {
    fetchProducts().then(setAllProducts)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('creaciones_theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (itemCount === 0) return
    setCartBump(true)
    const timer = setTimeout(() => setCartBump(false), 350)
    return () => clearTimeout(timer)
  }, [itemCount])

  const toggleDark = useCallback(() => setDark((d) => !d), [])

  const runSearch = useCallback(
    (term) => {
      const value = term.trim()
      if (!value) return
      addRecentSearch(value)
      setRecentSearches(getRecentSearches())
      setSearchQuery('')
      setShowSuggestions(false)
      navigate(`/products?search=${encodeURIComponent(value)}`)
    },
    [navigate]
  )

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault()
      runSearch(searchQuery)
    },
    [searchQuery, runSearch]
  )

  const recordSearchSelection = useCallback((term) => {
    addRecentSearch(term)
    setRecentSearches(getRecentSearches())
    setSearchQuery('')
  }, [])

  const productSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    return allProducts
      .filter((p) =>
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
      .slice(0, 5)
  }, [allProducts, searchQuery])

  const navState = useMemo(
    () => ({
      isHome: pathname === '/',
      isBaby: search.includes('category=baby_gear'),
      isTech: search.includes('category=smart_tech'),
      isStreaming: pathname === '/streaming',
      isDeals: search.includes('deals=true'),
    }),
    [pathname, search]
  )

  return {
    searchQuery,
    setSearchQuery,
    dark,
    toggleDark,
    cartBump,
    showSuggestions,
    setShowSuggestions,
    recentSearches,
    productSuggestions,
    handleSearchSubmit,
    runSearch,
    recordSearchSelection,
    navState,
  }
}