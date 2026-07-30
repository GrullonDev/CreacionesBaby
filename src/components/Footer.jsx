import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-section">
          <h4>Creaciones Baby</h4>
          <p>Your trusted store for baby essentials and electronics.</p>
        </div>
        <div className="footer-section">
          <h4>Shop</h4>
          <Link to="/products?category=baby">Baby Products</Link>
          <Link to="/products?category=electronics">Electronics</Link>
          <Link to="/products">All Products</Link>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <a href="mailto:support@creacionesbaby.com">Contact Us</a>
          <a href="#">Shipping Info</a>
          <a href="#">Returns</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Creaciones Baby. All rights reserved.</p>
      </div>
    </footer>
  )
}
