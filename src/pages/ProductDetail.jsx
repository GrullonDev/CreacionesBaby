import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { getProductById, getRelatedProducts } from '../data/products'
import Rating from '../components/Rating'
import ImageCarousel from '../components/ImageCarousel'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Selection states
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProductById(id).then((p) => {
      setProduct(p)
      if (p) {
        // Set default selects
        if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0])
        if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0])
        
        getRelatedProducts(p.category, p.id).then(setRelated)
      }
      setLoading(false)
      setQuantity(1)
      setAdded(false)
    })
  }, [id])

  const handleAdd = () => {
    // Add product to cart multiple times if quantity > 1
    for (let i = 0; i < quantity; i++) {
      addItem({
        ...product,
        // Override with selected attributes if they exist
        selectedColor,
        selectedSize
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
          <span className="text-xs font-bold uppercase tracking-widest">Cargando producto...</span>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Producto no encontrado</h2>
            <p className="text-xs text-slate-400 mt-1">El producto solicitado no existe o fue retirado.</p>
          </div>
          <Link to="/products" className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-lg text-xs hover:bg-opacity-95 shadow-sm">
            Volver al catálogo
          </Link>
        </div>
      </main>
    )
  }

  const wishlisted = isWishlisted(product.id)
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <Link to="/products" className="hover:text-primary transition-colors">Catálogo</Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors capitalize">
          {product.category}
        </Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image Carousel */}
        <div className="lg:col-span-7">
          <ImageCarousel images={product.images || [product.image]} alt={product.name} />
        </div>

        {/* Right Column: Product Information */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-xs">verified</span>
              100% Algodón Orgánico
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <Rating value={product.rating} reviews={product.reviews} />
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 border-t border-b border-slate-100 dark:border-slate-800 py-4">
            <span className="text-3xl font-black text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-slate-400 line-through text-base">${product.originalPrice.toFixed(2)}</span>
                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                  AHORRA {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Color: <span className="text-slate-500 font-semibold">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`size-8 rounded-full border transition-all ${
                      selectedColor === color
                        ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background-dark scale-95 border-primary'
                        : 'border-slate-200 dark:border-slate-800 hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: 
                        color === 'Crema' ? '#fdf5e6' :
                        color === 'Blanco' ? '#ffffff' :
                        color === 'Gris' ? '#d1d5db' :
                        color === 'Verde' ? '#dcfce7' :
                        color === 'Rosa' ? '#fce7f3' :
                        color === 'Azul' ? '#dbeafe' :
                        color === 'Café' ? '#78350f' : '#cbd5e1'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Talla</label>
                <button className="text-xs text-primary font-bold hover:underline">Guía de tallas</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center rounded-lg border text-xs font-bold transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary/10 text-primary font-extrabold scale-95'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {/* Quantity Picker */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden h-12">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-slate-800 dark:text-slate-200 w-10 text-center">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`flex-grow h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer text-sm ${
                  added 
                    ? 'bg-slate-900 text-white shadow-none' 
                    : 'bg-primary text-white hover:bg-opacity-95'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {added ? 'done' : 'shopping_cart'}
                </span>
                {added ? '¡Añadido!' : 'Añadir al carrito'}
              </button>

              {/* Favorite Button */}
              <button
                onClick={() => toggleItem(product)}
                className={`h-12 w-12 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  wishlisted
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary'
                }`}
                aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <span className={`material-symbols-outlined text-xl ${wishlisted ? 'fill-current' : ''}`}>
                  favorite
                </span>
              </button>
            </div>
          </div>

          {/* Product Specifications / Care Accordions */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <details className="group" open>
              <summary className="flex items-center justify-between cursor-pointer list-none text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                Especificaciones
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-400">expand_more</span>
              </summary>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside pl-2 leading-relaxed">
                {product.features && product.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
                <li>Envío y entrega en embalaje reciclable y biodegradable.</li>
              </ul>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                Instrucciones de Lavado
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-400">expand_more</span>
              </summary>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Lavar a máquina en ciclo delicado con agua fría y jabón neutro. No usar blanqueador. Secar en superficie plana a la sombra para mantener la integridad de las fibras orgánicas. Planchar a temperatura baja si es necesario.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {related.length > 0 && (
        <section className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-8">Productos Relacionados</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
