import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts, SELLER_CATEGORIES } from '../hooks/useProducts'
import { formatCurrency } from '../utils/currency'
import ComingSoon from '../components/ComingSoon'

export default function Reports() {
  usePageTitle('Reportes')
  const { products, loading } = useProducts()

  const totalProducts = products.length
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0)
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const outOfStock = products.filter((p) => p.stock === 0).length

  const byCategory = SELLER_CATEGORIES.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.id).length,
  })).filter((c) => c.count > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reportes</h1>
        <p className="text-xs text-slate-400 mt-1">Vista básica calculada a partir de tu catálogo actual</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MiniStat label="Productos" value={totalProducts} />
            <MiniStat label="Unidades en inventario" value={totalUnits} />
            <MiniStat label="Valor de inventario" value={formatCurrency(inventoryValue)} />
            <MiniStat label="Productos agotados" value={outOfStock} alert={outOfStock > 0} />
          </div>

          {byCategory.length > 0 && (
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">Productos por categoría</h2>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                {byCategory.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-32 flex-shrink-0 truncate">
                      {c.label}
                    </span>
                    <div className="flex-grow h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(c.count / totalProducts) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-6 text-right flex-shrink-0">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ComingSoon
        icon="monitoring"
        title="Reportes de ventas"
        description="Ingresos, pedidos y tendencias por período todavía no están disponibles: la API de pedidos (/orders) hoy solo se puede consultar desde la cuenta del comprador, no filtrada por vendedor. Falta ese enlace en el backend antes de poder mostrar reportes de ventas reales."
        plannedFeatures={[
          'Ingresos por día/semana/mes',
          'Productos más vendidos',
          'Exportar reportes en PDF o CSV',
        ]}
      />
    </div>
  )
}

function MiniStat({ label, value, alert }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
      <p className={`text-lg font-extrabold ${alert ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{label}</p>
    </div>
  )
}
