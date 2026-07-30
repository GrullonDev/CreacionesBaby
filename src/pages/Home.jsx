import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getFeaturedProducts } from '../data/products'

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    getFeaturedProducts().then(setFeatured)
  }, [])

  return (
    <main className="main">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Everything for Baby & Tech</h1>
          <p>Discover premium baby essentials and the latest electronics — all in one place.</p>
          <div className="hero-actions">
            <Link to="/products?category=baby" className="btn btn-primary">Shop Baby</Link>
            <Link to="/products?category=electronics" className="btn btn-secondary">Shop Electronics</Link>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          <Link to="/products?category=baby" className="category-card baby">
            <span className="category-icon">👶</span>
            <span className="category-name">Baby Products</span>
            <span className="category-desc">Clothing, gear, nursery & more</span>
          </Link>
          <Link to="/products?category=electronics" className="category-card electronics">
            <span className="category-icon">💻</span>
            <span className="category-name">Electronics</span>
            <span className="category-desc">Phones, laptops, audio & more</span>
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="featured-section">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="promo-section">
        <div className="promo-card">
          <h3>Free Shipping on Orders Over $50</h3>
          <p>Plus easy 30-day returns on all items.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </section>
    </main>
  )
}
