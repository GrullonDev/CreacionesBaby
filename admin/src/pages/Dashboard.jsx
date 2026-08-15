import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { useReportSummary, usePeriod } from '../hooks/useReportSummary'
import StatCard from '../components/StatCard'
import { formatCurrency } from '../utils/currency'
import { describeRange } from '../utils/dates'
import { LOW_STOCK_THRESHOLD } from '../utils/salesConstants'

const QUICK_LINKS = [
  { to: '/ventas/nueva', label: 'Registrar venta', icon: 'point_of_sale' },
  { to: '/finanzas', label: 'Registrar gasto', icon: 'account_balance_wallet' },
  { to: '/productos/nuevo', label: 'Añadir producto', icon: 'add_box' },
  { to: '/inventario', label: 'Ver inventario', icon: 'warehouse' },
]

export default function Dashboard() {
  usePageTitle('Resumen')
  const { user } = useAuth()
  const period = usePeriod('mes')
  const { summary, loading } = useReportSummary(period)

  const sales = summary?.sales
  const inventory = summary?.inventory
  const finance = summary?.finance
  const dash = loading || !summary ? '—' : null

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl px-6 py-7 sm:px-8 sm:py-8 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h1 className="text-2xl font-extrabold">Hola, {user?.name?.split(' ')[0]}</h1>
          <p className="text-xs text-white/75 mt-1.5">
            Resumen de {describeRange({ from: period.from, to: period.to }).toLowerCase()}.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">Este mes</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="payments"
            label="Ingresos por ventas"
            value={dash ?? formatCurrency(sales.revenue)}
            hint={dash ?? `${sales.count} ventas · ${sales.units} unidades`}
            size="sm"
          />
          <StatCard
            icon="trending_up"
            label="Ganancia bruta"
            value={dash ?? formatCurrency(sales.grossProfit)}
            hint={dash ?? `Margen ${sales.marginPct.toFixed(1)}%`}
            tone={!dash && sales.grossProfit < 0 ? 'red' : 'emerald'}
            size="sm"
          />
          <StatCard
            icon="arrow_upward"
            label="Egresos"
            value={dash ?? formatCurrency(finance.expenses)}
            size="sm"
            tone="amber"
          />
          <StatCard
            icon="account_balance"
            label="Resultado neto"
            value={dash ?? formatCurrency(summary.netResult)}
            hint="Ganancia bruta + otros ingresos − egresos"
            tone={!dash && summary.netResult < 0 ? 'red' : 'emerald'}
            size="sm"
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">Inventario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon="inventory_2"
            label="Productos activos"
            value={dash ?? inventory.productCount}
            hint={dash ?? `${inventory.units} unidades`}
          />
          <StatCard
            icon="warning"
            label="Sin inventario"
            value={dash ?? inventory.outOfStock}
            tone={!dash && inventory.outOfStock > 0 ? 'red' : 'primary'}
          />
          <StatCard
            icon="sell"
            label="Valor de inventario"
            value={dash ?? formatCurrency(inventory.retailValue)}
            hint={dash ?? `Al costo: ${formatCurrency(inventory.costValue)}`}
          />
        </div>
        {!dash && inventory.withoutCost > 0 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-sm">info</span>
            <span>
              {inventory.withoutCost}{' '}
              {inventory.withoutCost === 1 ? 'producto no tiene' : 'productos no tienen'} costo registrado, así
              que tu margen aparece más alto de lo real.{' '}
              <Link to="/productos" className="font-bold text-primary hover:underline">
                Añadir costos
              </Link>
            </span>
          </p>
        )}
      </div>

      {!dash && summary.topProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Lo que más se vende</h2>
            <Link to="/reportes" className="text-[11px] font-bold text-primary hover:underline">
              Ver reportes
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-50 dark:divide-slate-800/50">
            {summary.topProducts.slice(0, 5).map((p) => (
              <div key={p.productId} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.units} unidades vendidas</p>
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex-shrink-0">
                  {formatCurrency(p.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center hover:border-primary hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 transition-all"
            >
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">{link.icon}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        Stock bajo se marca cuando quedan menos de {LOW_STOCK_THRESHOLD} unidades.
      </p>
    </div>
  )
}
