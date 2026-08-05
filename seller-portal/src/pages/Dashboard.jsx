import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useProducts } from '../hooks/useProducts'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCurrency } from '../utils/currency'

const QUICK_LINKS = [
  { to: '/productos/nuevo', label: 'Añadir producto', icon: 'add_box' },
  { to: '/productos', label: 'Ver productos', icon: 'inventory_2' },
  { to: '/inventario', label: 'Ver inventario', icon: 'warehouse' },
  { to: '/reportes', label: 'Ver reportes', icon: 'monitoring' },
]

export default function Dashboard() {
  usePageTitle('Resumen')
  const { user } = useAuth()
  const { products, loading } = useProducts()

  const totalProducts = products.length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hola, {user?.name?.split(' ')[0]}</h1>
        <p className="text-xs text-slate-400 mt-1">Este es el resumen de tu tienda en Creaciones Baby.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="inventory_2" label="Productos activos" value={loading ? '—' : totalProducts} />
        <StatCard
          icon="warning"
          label="Sin inventario"
          value={loading ? '—' : outOfStock}
          alert={!loading && outOfStock > 0}
        />
        <StatCard
          icon="payments"
          label="Valor de inventario"
          value={loading ? '—' : formatCurrency(inventoryValue)}
        />
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-2xl">{link.icon}</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, alert }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          alert ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-primary/10 text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{value}</p>
        <p className="text-[11px] text-slate-400 font-semibold">{label}</p>
      </div>
    </div>
  )
}
