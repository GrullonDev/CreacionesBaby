import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem('creaciones_orders') || '[]')
  } catch {
    return []
  }
}

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    setOrders(loadOrders())
  }, [])

  return (
    <main className="main">
      <div className="orders-page">
        <div className="orders-header">
          <h2>Order History</h2>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h3>No orders yet</h3>
            <p>When you place an order, it will appear here.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.toReversed().map((order, i) => (
              <div key={i} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-number">Order #{order.id}</span>
                    <span className="order-date">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="order-total">${order.total.toFixed(2)}</span>
                </div>
                <div className="order-card-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-card-footer">
                  <span className="order-status">Delivered</span>
                  <span className="order-shipping">Shipped to {order.address?.name || order.shipping?.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
