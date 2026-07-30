import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

export default function Account() {
  const { items: wishlist, clearWishlist } = useWishlist()

  return (
    <main className="main">
      <div className="account-page">
        <div className="account-header">
          <h2>My Account</h2>
        </div>

        <div className="account-grid">
          <div className="account-card">
            <h3>Wishlist</h3>
            {wishlist.length === 0 ? (
              <div className="account-empty">
                <p>Your wishlist is empty.</p>
                <Link to="/products" className="btn btn-primary btn-sm">Browse Products</Link>
              </div>
            ) : (
              <>
                <div className="wishlist-grid">
                  {wishlist.map((item) => (
                    <div key={item.id} className="wishlist-item">
                      <Link to={`/product/${item.id}`} className="wishlist-item-image">
                        <img src={item.image} alt={item.name} />
                      </Link>
                      <div className="wishlist-item-info">
                        <Link to={`/product/${item.id}`} className="wishlist-item-name">{item.name}</Link>
                        <span className="wishlist-item-price">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={clearWishlist} style={{ marginTop: 12 }}>
                  Clear Wishlist
                </button>
              </>
            )}
          </div>

          <div className="account-card">
            <h3>Recent Orders</h3>
            <p className="account-card-desc">View your order history and track shipments.</p>
            <Link to="/orders" className="btn btn-secondary btn-sm">View Orders</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
