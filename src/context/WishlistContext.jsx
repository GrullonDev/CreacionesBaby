import { createContext, useContext, useReducer, useEffect } from 'react'

const WishlistContext = createContext()

function loadWishlist() {
  try {
    const data = localStorage.getItem('creaciones_wishlist')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return state.some((i) => i.id === action.product.id)
        ? state.filter((i) => i.id !== action.product.id)
        : [...state, action.product]
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(wishlistReducer, [], loadWishlist)

  useEffect(() => {
    localStorage.setItem('creaciones_wishlist', JSON.stringify(items))
  }, [items])

  const toggleItem = (product) => dispatch({ type: 'TOGGLE', product })
  const clearWishlist = () => dispatch({ type: 'CLEAR' })
  const isWishlisted = (id) => items.some((i) => i.id === id)

  return (
    <WishlistContext.Provider value={{ items, toggleItem, clearWishlist, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
