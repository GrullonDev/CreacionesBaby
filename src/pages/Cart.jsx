import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useToast } from '../context/useToast'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCurrency } from '../utils/currency'
import { fetchProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'

const AVAILABLE_PROMOS = [
  { code: 'BABY10', label: '10% de descuento' },
  { code: 'BABY20', label: '20% de descuento' },
  { code: 'FREESHIP', label: 'Envío gratis' },
]

export default function Cart() {
  usePageTitle('Carrito de compras')
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart()
  const { addToast } = useToast()
  const [suggestions, setSuggestions] = useState([])

  const shippingCost = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shippingCost

  useEffect(() => {
    if (items.length === 0) return
    const cartIds = new Set(items.map((i) => i.id))
    fetchProducts().then((all) => {
      const picks = all
        .filter((p) => !cartIds.has(p.id) && p.inStock)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)
      setSuggestions(picks)
    })
  }, [items])

  const handleClearCart = () => {
    clearCart()
    addToast('Carrito vaciado', 'info')
  }

  const handleRemoveItem = (item) => {
    removeItem(item.id)
    addToast(`${item.name} eliminado del carrito`, 'info')
  }

  if (items.length === 0) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <span className="material-symbols-outlined text-4xl">shopping_cart</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Tu carrito está vacío</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Parece que aún no has agregado ninguna prenda de nuestra colección a tu carrito de compras.
            </p>
          </div>
          <Link 
            to="/products" 
            className="inline-block bg-primary hover:bg-opacity-95 text-white font-bold py-3 px-8 rounded-xl text-xs transition-all shadow-md shadow-primary/20"
          >
            Empezar a Comprar
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Carrito de Compras</h1>
          <p className="text-xs text-slate-400 mt-1">Tienes {itemCount} prenda{itemCount !== 1 ? 's' : ''} en tu bolsa</p>
        </div>
        <button 
          onClick={handleClearCart}
          className="text-xs text-slate-500 hover:text-red-500 font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          Vaciar Carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              {/* Product Image */}
              <Link to={`/product/${item.id}`} className="w-20 sm:w-24 aspect-[4/5] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              </Link>

              {/* Product Info */}
              <div className="flex-grow min-w-0 flex flex-col justify-between h-full py-1">
                <div>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <Link 
                    to={`/product/${item.id}`} 
                    className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors text-sm sm:text-base line-clamp-1 block"
                  >
                    {item.name}
                  </Link>
                  {/* Selected attributes */}
                  {(item.selectedColor || item.selectedSize) && (
                    <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-400 mt-1">
                      {item.selectedColor && (
                        <span>Color: <strong className="text-slate-600 dark:text-slate-300">{item.selectedColor}</strong></span>
                      )}
                      {item.selectedSize && (
                        <span>Talla: <strong className="text-slate-600 dark:text-slate-300">{item.selectedSize}</strong></span>
                      )}
                    </div>
                  )}
                </div>

                {/* Controls & Price Mobile */}
                <div className="flex items-center justify-between mt-4">
                  {/* Qty Picker */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden h-9 bg-slate-50 dark:bg-slate-950">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold transition-colors disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-300 min-w-6 text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => handleRemoveItem(item)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer"
                    title="Eliminar artículo"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              {/* Item Total Price */}
              <div className="text-right flex-shrink-0 self-start pt-1 hidden sm:block">
                <span className="font-extrabold text-slate-900 dark:text-white text-base block">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatCurrency(item.price)} c/u
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-4">
            Resumen del Pedido
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Envío</span>
              {shippingCost === 0 ? (
                <span className="font-bold text-primary uppercase text-xs">Gratis</span>
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(shippingCost)}</span>
              )}
            </div>

            {shippingCost > 0 && (
              <div className="bg-primary/5 p-3 rounded-lg text-[10px] text-primary leading-normal">
                Agrega <strong>{formatCurrency(50 - subtotal)}</strong> más en productos para obtener <strong>Envío Gratis</strong>.
              </div>
            )}

            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 dark:border-slate-800 text-base">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="font-black text-2xl text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link 
              to="/checkout" 
              className="w-full bg-primary hover:bg-opacity-95 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span className="material-symbols-outlined text-lg">credit_card</span>
              Proceder al Pago
            </Link>
            <Link 
              to="/products" 
              className="w-full border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            >
              Continuar Comprando
            </Link>
          </div>

          {/* Available Promo Codes */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">redeem</span>
              Códigos activos
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_PROMOS.map((promo) => (
                <div
                  key={promo.code}
                  className="border border-dashed border-primary/40 bg-primary/5 rounded-lg p-2 text-center"
                >
                  <span className="block text-[11px] font-black text-primary tracking-wider">{promo.code}</span>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{promo.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
              Aplica tu código en el checkout para obtener tu descuento.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      {suggestions.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Completa tu compra</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
