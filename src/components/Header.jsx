import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function Header() {
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 glass-header border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
              Creaciones<span className="text-primary">.</span>Baby
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/products" 
              className={`text-sm font-semibold transition-colors hover:text-primary ${pathname === '/products' && !location.search ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Todos
            </Link>
            <Link 
              to="/products?category=mamelucos" 
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.search.includes('category=mamelucos') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Mamelucos
            </Link>
            <Link 
              to="/products?category=conjuntos" 
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.search.includes('category=conjuntos') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Conjuntos
            </Link>
            <Link 
              to="/products?category=recien_nacidos" 
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.search.includes('category=recien_nacidos') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Recién Nacidos
            </Link>
            <Link 
              to="/products?category=accesorios" 
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.search.includes('category=accesorios') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Accesorios
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5">
              <span className="material-symbols-outlined text-slate-400 text-lg mr-2">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs w-36 placeholder-slate-400 p-0 text-slate-800 dark:text-slate-200" 
                placeholder="Buscar productos..." 
              />
            </form>

            {/* Wishlist */}
            <Link 
              to="/account" 
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Wishlist"
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-[10px] flex items-center justify-center rounded-full text-white font-bold border-2 border-background-light dark:border-background-dark animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Cart"
            >
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-[10px] flex items-center justify-center rounded-full text-white font-bold border-2 border-background-light dark:border-background-dark">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link 
              to="/account" 
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Profile"
            >
              <span className="material-symbols-outlined text-2xl">person</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
