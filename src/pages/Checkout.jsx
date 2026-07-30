import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function saveOrder(order) {
  try {
    const existing = JSON.parse(localStorage.getItem('creaciones_orders') || '[]')
    existing.push(order)
    localStorage.setItem('creaciones_orders', JSON.stringify(existing))
  } catch {}
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = 'ORD-' + Date.now().toString(36).toUpperCase()
    const total = subtotal >= 50 ? subtotal : subtotal + 5.99
    const shippingCost = subtotal >= 50 ? 0 : 5.99
    saveOrder({
      id,
      date: new Date().toISOString(),
      items: [...items],
      subtotal,
      shipping: shippingCost,
      total,
      address: { name: form.name, email: form.email, address: form.address, city: form.city, zip: form.zip },
    })
    setOrderId(id)
    setSubmitted(true)
    setTimeout(() => {
      clearCart()
      navigate('/orders')
    }, 3000)
  }

  if (items.length === 0 && !submitted) {
    return (
      <main className="main">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="main">
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2>Order Placed Successfully!</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Order #{orderId}</p>
          <p>Thank you, {form.name}! Your order is being processed.</p>
          <p className="text-muted">A confirmation has been sent to {form.email}.</p>
        </div>
      </main>
    )
  }

  const total = subtotal >= 50 ? subtotal : subtotal + 5.99

  return (
    <main className="main">
      <div className="checkout-page">
        <div className="checkout-form">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" required value={form.address} onChange={handleChange} placeholder="123 Main St" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input id="city" name="city" required value={form.city} onChange={handleChange} placeholder="City" />
              </div>
              <div className="form-group">
                <label htmlFor="zip">ZIP Code</label>
                <input id="zip" name="zip" required value={form.zip} onChange={handleChange} placeholder="12345" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Place Order — ${total.toFixed(2)}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="checkout-item">
              <img src={item.image} alt={item.name} />
              <div>
                <span className="checkout-item-name">{item.name}</span>
                <span className="checkout-item-qty">Qty: {item.quantity}</span>
              </div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{subtotal >= 50 ? 'Free' : '$5.99'}</span></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
      </div>
    </main>
  )
}
