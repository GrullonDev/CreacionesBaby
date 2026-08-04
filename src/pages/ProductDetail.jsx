import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'
import { useToast } from '../context/useToast'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProductDetail } from '../hooks/useProductDetail'
import Rating from '../components/Rating'
import ImageCarousel from '../components/ImageCarousel'
import ProductCard from '../components/ProductCard'
import NotifyStockForm from '../components/NotifyStockForm'
import RecentlyViewed from '../components/RecentlyViewed'
import ViewerBadge from '../components/ViewerBadge'
import SaleCountdown from '../components/SaleCountdown'
import { formatCurrency } from '../utils/currency'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const { addToast } = useToast()

  const {
    product,
    related,
    loading,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    quantity,
    setQuantity,
    added,
    reviews,
    reviewForm,
    setReviewForm,
    discountPercent,
    handleReviewSubmit,
    handleAdd: addToCart,
    handleWishlistToggle: toggleWishlist,
  } = useProductDetail({ id })

  usePageTitle(product ? product.name : 'Producto', product?.description)

  const handleAdd = () => addToCart(addItem, addToast)
  const handleWishlistToggle = () => toggleWishlist(toggleItem, addToast, wishlisted)

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
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs">verified</span>
                100% Algodón Orgánico
              </div>
              {product.isSellerProduct && (
                <Link
                  to={`/vendedor/${product.id}/editar`}
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                  Editar producto
                </Link>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <Rating value={product.rating} reviews={product.reviews} />
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 space-y-3">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-primary">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-slate-400 line-through text-base">{formatCurrency(product.originalPrice)}</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                    AHORRA {discountPercent}%
                  </span>
                </>
              )}
            </div>
            {product.originalPrice && <SaleCountdown />}
          </div>

          {/* Social proof */}
          <ViewerBadge productId={product.id} />

          {/* Stock Level */}
          {product.inStock && product.stock !== undefined && product.stock <= 5 && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="inline-block size-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-600 dark:text-red-400">Solo {product.stock} unidad{product.stock !== 1 ? 'es' : ''} restante{product.stock !== 1 ? 's' : ''}</span>
            </div>
          )}
          {!product.inStock && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="inline-block size-2 rounded-full bg-slate-400"></span>
                <span className="text-slate-500">Agotado</span>
              </div>
              <NotifyStockForm productId={product.id} />
            </div>
          )}

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
                onClick={handleWishlistToggle}
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

      {/* Reviews Section */}
      <section className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Reseñas de Clientes</h3>
          <p className="text-xs text-slate-400 mb-8">{reviews.length} opinión{reviews.length !== 1 ? 'es' : ''}</p>

          {/* Review Form */}
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-10 space-y-4 border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Escribe tu opinión</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tu nombre"
                value={reviewForm.author}
                onChange={(e) => setReviewForm((f) => ({ ...f, author: e.target.value }))}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Puntuación:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      className={`material-symbols-outlined text-lg cursor-pointer ${
                        star <= reviewForm.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              placeholder="Comparte tu experiencia con este producto..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-opacity-95 text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Publicar Reseña
            </button>
          </form>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-3xl text-slate-300">rate_review</span>
              <p className="text-xs text-slate-400 mt-3">No hay reseñas todavía. ¡Sé el primero en opinar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs">
                        {r.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{r.author}</p>
                        <p className="text-[10px] text-slate-400">{new Date(r.date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined text-xs ${
                            star <= r.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Grid */}
      {related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">También te puede gustar</h3>
              <p className="text-xs text-slate-400 mt-1">Productos similares que podrían interesarte</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Ver catálogo
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </main>
  )
}
