import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <main className="main">
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="cart-page">
        <div className="cart-header">
          <h2>Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})</h2>
          <button className="btn btn-ghost" onClick={clearCart}>Clear Cart</button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <Link to={`/product/${item.id}`} className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-price">${item.price.toFixed(2)}</span>
                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{subtotal >= 50 ? 'Free' : '$5.99'}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${(subtotal >= 50 ? subtotal : subtotal + 5.99).toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full">Proceed to Checkout</Link>
            <Link to="/products" className="btn btn-secondary btn-full">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
