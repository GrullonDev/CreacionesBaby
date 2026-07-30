import { createContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

function loadCart() {
  try {
    const data = localStorage.getItem('creaciones_cart')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i.id === action.product.id)
      if (existing) {
        return state.map((i) =>
          i.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...state, { ...action.product, quantity: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i.id !== action.id)
    case 'UPDATE_QUANTITY':
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: Math.max(1, action.quantity) } : i
      )
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart)

  useEffect(() => {
    localStorage.setItem('creaciones_cart', JSON.stringify(items))
  }, [items])

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', product })
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id })
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', id, quantity })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }
