import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

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
    const shippingCost = subtotal >= 50 ? 0 : 5.99
    const total = subtotal + shippingCost
    
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
          <div className="text-[10px] text-slate-400 animate-pulse pt-4">
            Redireccionando a tu lista de pedidos...
          </div>
        </div>
      </main>
    )
  }

  const shippingCost = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shippingCost

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
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-opacity-95 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-lg">local_mall</span>
                Finalizar Compra — ${total.toFixed(2)}
              </button>
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
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Envío</span>
              {shippingCost === 0 ? (
                <span className="font-bold text-primary uppercase text-[10px]">Gratis</span>
              ) : (
                <span className="font-bold text-slate-950 dark:text-white">${shippingCost.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="font-black text-xl text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
