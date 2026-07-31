import { Link } from 'react-router-dom'
import { useWishlist } from '../context/useWishlist'
import ReferralBanner from '../components/ReferralBanner'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCurrency } from '../utils/currency'

export default function Account() {
  usePageTitle('Mi cuenta')
  const { items: wishlist, clearWishlist } = useWishlist()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Title */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Mi Cuenta</h1>
        <p className="text-xs text-slate-400 mt-1">Administra tus favoritos e historial de pedidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Wishlist Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">favorite</span>
              Lista de Deseos
            </h3>
            {wishlist.length > 0 && (
              <button 
                onClick={clearWishlist}
                className="text-xs text-slate-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <p className="text-xs text-slate-400">No tienes productos en tu lista de deseos.</p>
              <Link 
                to="/products" 
                className="inline-block bg-primary hover:bg-opacity-95 text-white font-bold py-2 px-6 rounded-lg text-[10px] uppercase tracking-wider transition-all"
              >
                Explorar Colecciones
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-2">
              {wishlist.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/50"
                >
                  <Link to={`/product/${item.id}`} className="w-12 aspect-[4/5] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <Link 
                      to={`/product/${item.id}`} 
                      className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {item.name}
                    </Link>
                    <span className="font-extrabold text-primary text-xs mt-1 block">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
              Pedidos Recientes
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Revisa el historial de tus pedidos, descarga facturas y haz seguimiento del estado de tus despachos en tiempo real.
            </p>
            <div className="pt-2">
              <Link 
                to="/orders" 
                className="inline-block border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary py-3 px-8 rounded-xl font-bold transition-all text-xs text-slate-700 dark:text-slate-300"
              >
                Ver Historial de Pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Program */}
      <div className="mt-10">
        <ReferralBanner customerName="" />
      </div>
    </main>
  )
}
