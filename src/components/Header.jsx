import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('creaciones_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export default function Header() {
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [dark, setDark] = useState(getInitialTheme)
  const [cartBump, setCartBump] = useState(false)

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

  const toggleDark = () => setDark((d) => !d)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const isHome = pathname === '/'
  const isBaby = search.includes('category=baby_gear')
  const isTech = search.includes('category=smart_tech')
  const isStreaming = pathname === '/streaming'
  const isDeals = search.includes('deals=true')

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              Creaciones<span className="text-primary font-black">Baby</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-semibold transition-colors relative py-1 hover:text-slate-900 dark:hover:text-white ${
                isHome ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Inicio
              {isHome && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
            </Link>
            <Link 
              to="/products?category=baby_gear" 
              className={`text-sm font-semibold transition-colors relative py-1 hover:text-slate-900 dark:hover:text-white ${
                isBaby ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Baby
              {isBaby && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
            </Link>
            <Link 
              to="/products?category=smart_tech" 
              className={`text-sm font-semibold transition-colors relative py-1 hover:text-slate-900 dark:hover:text-white ${
                isTech ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Tech
              {isTech && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
            </Link>
            <Link 
              to="/streaming" 
              className={`text-sm font-semibold transition-colors relative py-1 hover:text-slate-900 dark:hover:text-white ${
                isStreaming ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Streaming
              {isStreaming && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
            </Link>
            <Link 
              to="/products?deals=true" 
              className={`text-sm font-semibold transition-colors relative py-1 hover:text-slate-900 dark:hover:text-white ${
                isDeals ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Deals
              {isDeals && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
            </Link>
          </nav>

          {/* Search Bar & Icons */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg px-3 py-1.5 border border-transparent focus-within:border-slate-200 dark:focus-within:border-slate-800 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-sm mr-2 select-none">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar para tu bebé..." 
                className="bg-transparent border-none outline-none text-xs w-44 placeholder-slate-400 text-slate-800 dark:text-slate-200 p-0"
              />
            </form>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
              aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              <span className="material-symbols-outlined text-xl">
                {dark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Wishlist Icon */}
            <Link 
              to="/account" 
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-900"
              aria-label="Lista de deseos"
            >
              <span className="material-symbols-outlined text-xl">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className={`relative p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 ${cartBump ? 'animate-bump' : ''}`}
              aria-label="Carrito"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#5c4c3e] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <Link 
              to="/account" 
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-900"
              aria-label="Perfil"
            >
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
