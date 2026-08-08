import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useToast } from '../context/useToast'
import ReferralBanner from '../components/ReferralBanner'
import TrustBadges from '../components/TrustBadges'
import { usePageTitle } from '../hooks/usePageTitle'
import { useCheckoutLogic } from '../hooks/useCheckoutLogic'
import { formatCurrency } from '../utils/currency'

export default function Checkout() {
  usePageTitle('Pago seguro')
  const { items, subtotal, clearCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const {
    submitted,
    submitting,
    submitError,
    orderId,
    form,
    couponCode,
    setCouponCode,
    appliedPromo,
    couponError,
    handleChange,
    handleApplyCoupon: applyCoupon,
    handleRemoveCoupon,
    handleSubmit: submitOrder,
    shippingCost,
    discountAmount,
    friendDiscount,
    total,
    PROMO_CODES,
    isEmpty,
  } = useCheckoutLogic({ items, subtotal, clearCart, navigate })

  const handleApplyCoupon = () => applyCoupon(addToast)
  const handleSubmit = submitOrder

  if (isEmpty && !submitted) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <span className="material-symbols-outlined text-4xl">shopping_cart</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Tu carrito está vacío</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              No puedes proceder al pago sin artículos en tu carrito de compras.
            </p>
          </div>
          <Link 
            to="/products" 
            className="inline-block bg-primary hover:bg-opacity-95 text-white font-bold py-3 px-8 rounded-xl text-xs transition-all shadow-md shadow-primary/20"
          >
            Ver Catálogo
          </Link>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 px-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 sm:p-12 rounded-3xl text-center shadow-xl max-w-lg space-y-6">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-2 border-emerald-500/20">
            <span className="material-symbols-outlined text-4xl font-extrabold">check_circle</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">¡Pedido Confirmado con Éxito!</h2>
            <p className="text-xs font-bold text-primary tracking-widest uppercase">ID: #{orderId}</p>
          </div>
          <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 leading-normal">
            <p>¡Muchas gracias, <strong>{form.name}</strong>! Tu pedido se está procesando.</p>
            <p>Hemos enviado un correo de confirmación con los detalles a: <strong className="text-slate-900 dark:text-slate-100">{form.email}</strong>.</p>
          </div>

          {/* Referral */}
          <div className="pt-2 text-left">
            <ReferralBanner customerName={form.name} />
          </div>

          <div className="text-[10px] text-slate-400 animate-pulse pt-2">
            Redireccionando a tu lista de pedidos...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Title */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Proceso de Pago</h1>
        <p className="text-xs text-slate-400 mt-1">Completa tus datos para finalizar la compra</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
            Información de Envío
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nombre Completo</label>
              <input 
                id="name" 
                name="name" 
                type="text"
                required 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Nombre y Apellido" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Correo Electrónico</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                value={form.email} 
                onChange={handleChange} 
                placeholder="correo@ejemplo.com" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Dirección de Entrega</label>
              <input 
                id="address" 
                name="address" 
                type="text"
                required 
                value={form.address} 
                onChange={handleChange} 
                placeholder="Dirección, departamento, número" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Ciudad / Comuna</label>
                <input 
                  id="city" 
                  name="city" 
                  type="text"
                  required 
                  value={form.city} 
                  onChange={handleChange} 
                  placeholder="Santiago, Bogotá, etc." 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="zip" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Código Postal</label>
                <input 
                  id="zip" 
                  name="zip" 
                  type="text"
                  required 
                  value={form.zip} 
                  onChange={handleChange} 
                  placeholder="Código postal" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="pt-6">
              {submitError && (
                <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3 mb-4">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-opacity-95 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-lg ${submitting ? 'animate-spin' : ''}`}>
                  {submitting ? 'sync' : 'local_mall'}
                </span>
                {submitting ? 'Procesando pedido…' : `Finalizar Compra — ${formatCurrency(total)}`}
              </button>
              <TrustBadges className="justify-center mt-4" />
            </div>
          </form>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-4">
            Resumen del Pedido
          </h3>

          {/* Cart Item rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-14 aspect-[4/5] rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cant: {item.quantity}</p>
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon Code */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">¿Tienes un cupón?</h4>
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">redeem</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{appliedPromo.code}</span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{appliedPromo.label}</p>
                  </div>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs text-slate-400 hover:text-red-500 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Ingresa código"
                    className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-primary hover:bg-opacity-95 text-white px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.keys(PROMO_CODES).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCouponCode(code)}
                      className="px-2 py-0.5 rounded-md border border-dashed border-primary/40 bg-primary/5 text-[9px] font-black text-primary tracking-wider hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </>
            )}
            {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
          </div>

          <div className="space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-slate-950 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Descuento ({appliedPromo?.code})</span>
                <span className="font-bold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {friendDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Bono de invitación</span>
                <span className="font-bold">-{formatCurrency(friendDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Envío</span>
              {shippingCost === 0 ? (
                <span className="font-bold text-primary uppercase text-[10px]">Gratis</span>
              ) : (
                <span className="font-bold text-slate-950 dark:text-white">{formatCurrency(shippingCost)}</span>
              )}
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="font-black text-xl text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
