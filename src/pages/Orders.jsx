import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCurrency } from '../utils/currency'
import OrderStatusStepper from '../components/OrderStatusStepper'

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem('creaciones_orders') || '[]')
  } catch {
    return []
  }
}

export default function Orders() {
  usePageTitle('Mis pedidos')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    setOrders(loadOrders())
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Title */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Mis Pedidos</h1>
          <p className="text-xs text-slate-400 mt-1">Historial de compras y seguimiento de envíos</p>
        </div>
        <Link
          to="/products"
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Seguir comprando
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <span className="material-symbols-outlined text-4xl">local_mall</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Aún no tienes pedidos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Cuando realices tu primera compra en nuestra tienda, podrás realizar el seguimiento aquí.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-block bg-primary hover:bg-opacity-95 text-white font-bold py-3 px-8 rounded-xl text-xs transition-all shadow-md shadow-primary/20"
          >
            Ver Productos
          </Link>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.toReversed().map((order, i) => (
            <div
              key={order.id || i}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base block">
                    Pedido #{order.id}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {new Date(order.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Total Pagado</span>
                  <span className="font-black text-primary text-lg sm:text-xl block">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="divide-y divide-slate-50 dark:divide-slate-800 px-5 py-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <div className="w-12 aspect-[4/5] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block line-clamp-1">
                        {item.name}
                      </span>
                      <div className="flex gap-3 text-[10px] text-slate-400 mt-0.5">
                        <span>Cant: <strong className="text-slate-600 dark:text-slate-300">{item.quantity}</strong></span>
                        {item.selectedColor && (
                          <span>Color: <strong className="text-slate-600 dark:text-slate-300">{item.selectedColor}</strong></span>
                        )}
                        {item.selectedSize && (
                          <span>Talla: <strong className="text-slate-600 dark:text-slate-300">{item.selectedSize}</strong></span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white self-center whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-5 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 gap-4">
                <OrderStatusStepper orderDate={order.date} />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-right">
                  Despachado a: <strong>{order.address?.name || 'Cliente'}</strong>, {order.address?.address}, {order.address?.city}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
