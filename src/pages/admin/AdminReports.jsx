import { Link } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useReportSummary, usePeriod } from '../../hooks/useReportSummary'
import StatCard from '../../components/admin/StatCard'
import DateRangeFilter from '../../components/admin/DateRangeFilter'
import MagnitudeBars from '../../components/admin/MagnitudeBars'
import { formatCurrency } from '../../utils/currency'
import { describeRange } from '../../utils/dates'
import { downloadCsv, csvNumber } from '../../utils/csv'
import { channelLabel, categoryLabel } from '../../utils/salesConstants'

/** Headline figures + the two breakdowns, so the numbers can be sent to an
 *  accountant from the phone without opening the portal. */
function exportSummary(summary, range) {
  const { sales, finance, inventory, netResult } = summary
  downloadCsv(
    ['Concepto', 'Valor'],
    [
      ['Período', describeRange(range)],
      ['Ventas', sales.count],
      ['Unidades vendidas', sales.units],
      ['Ingresos por ventas', csvNumber(sales.revenue)],
      ['Costo de lo vendido', csvNumber(sales.cogs)],
      ['Ganancia bruta', csvNumber(sales.grossProfit)],
      ['Margen bruto %', sales.marginPct.toFixed(2)],
      ['Ticket promedio', csvNumber(sales.averageTicket)],
      ['Otros ingresos', csvNumber(finance.otherIncome)],
      ['Egresos', csvNumber(finance.expenses)],
      ['Resultado neto', csvNumber(netResult)],
      ['Valor de inventario (precio de venta)', csvNumber(inventory.retailValue)],
      ['Valor de inventario (al costo)', csvNumber(inventory.costValue)],
      [],
      ['Ventas por canal', 'Ingresos'],
      ...summary.byChannel.map((c) => [channelLabel(c.channel), csvNumber(c.revenue)]),
      [],
      ['Egresos por categoría', 'Monto'],
      ...finance.byCategory
        .filter((c) => c.direction === 'EGRESO')
        .map((c) => [categoryLabel(c.category), csvNumber(c.amount)]),
    ],
    'reporte-creaciones-baby'
  )
}

function Card({ title, subtitle, children }) {
  return (
    <section>
      <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">{title}</h2>
      {subtitle && <p className="text-[11px] text-slate-400 mb-3">{subtitle}</p>}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
        {children}
      </div>
    </section>
  )
}

/**
 * The numbers, on a phone. Same `/reports/summary` payload the portal uses, cut
 * down to what's worth reading on a small screen — the four headline figures plus
 * three breakdowns, and a CSV of the summary. The ingresos-vs-egresos time series
 * stays in the portal, where there's room for it.
 */
export default function AdminReports() {
  usePageTitle('Reportes')
  const period = usePeriod()
  const { summary, loading, error } = useReportSummary(period)

  const expenses = summary?.finance.byCategory.filter((c) => c.direction === 'EGRESO') || []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Reportes</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {describeRange({ from: period.from, to: period.to })}
          </p>
        </div>
        <button
          onClick={() => exportSummary(summary, { from: period.from, to: period.to })}
          disabled={loading || !summary}
          aria-label="Exportar resumen a CSV"
          className="border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-base">download</span>
          CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
        <DateRangeFilter
          preset={period.preset}
          from={period.from}
          to={period.to}
          onPreset={period.applyPreset}
          onFrom={period.setFrom}
          onTo={period.setTo}
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading || !summary ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="payments"
              label="Ingresos por ventas"
              value={formatCurrency(summary.sales.revenue)}
              hint={`${summary.sales.count} ventas`}
              size="sm"
            />
            <StatCard
              icon="trending_up"
              label="Ganancia bruta"
              value={formatCurrency(summary.sales.grossProfit)}
              hint={`Margen ${summary.sales.marginPct.toFixed(1)}%`}
              tone={summary.sales.grossProfit < 0 ? 'red' : 'emerald'}
              size="sm"
            />
            <StatCard
              icon="arrow_upward"
              label="Egresos"
              value={formatCurrency(summary.finance.expenses)}
              tone="amber"
              size="sm"
            />
            <StatCard
              icon="account_balance"
              label="Resultado neto"
              value={formatCurrency(summary.netResult)}
              tone={summary.netResult < 0 ? 'red' : 'emerald'}
              size="sm"
            />
          </div>

          {summary.inventory.withoutCost > 0 && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-base">info</span>
              <span>
                {summary.inventory.withoutCost}{' '}
                {summary.inventory.withoutCost === 1 ? 'producto no tiene' : 'productos no tienen'} costo
                registrado, así que la ganancia y el margen salen más altos de lo real.
              </span>
            </p>
          )}

          <Card title="Ventas por canal" subtitle="Ingresos según dónde vendiste">
            {summary.byChannel.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin ventas en este período.</p>
            ) : (
              <MagnitudeBars
                rows={summary.byChannel.map((c) => ({
                  id: c.channel,
                  label: channelLabel(c.channel),
                  value: c.revenue,
                  hint: `${c.count} v.`,
                }))}
              />
            )}
          </Card>

          <Card title="Egresos por categoría" subtitle="En qué se está yendo el dinero">
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Sin egresos registrados.{' '}
                <Link to="/admin/finanzas" className="font-bold text-primary hover:underline">
                  Registrar uno
                </Link>
              </p>
            ) : (
              <MagnitudeBars
                fill="var(--viz-expense)"
                rows={expenses.map((c) => ({
                  id: c.category,
                  label: categoryLabel(c.category),
                  value: c.amount,
                  hint: `${c.count} mov.`,
                }))}
              />
            )}
          </Card>

          <Card title="Productos más vendidos" subtitle="Por ingresos en el período">
            {summary.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin ventas en este período.</p>
            ) : (
              <MagnitudeBars
                rows={summary.topProducts.slice(0, 6).map((p) => ({
                  id: p.productId,
                  label: p.name,
                  value: p.revenue,
                  hint: `${p.units} u.`,
                }))}
              />
            )}
          </Card>

          <Card title="Inventario actual" subtitle="No depende del período">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Figure label="Productos" value={summary.inventory.productCount} />
              <Figure label="Unidades" value={summary.inventory.units} />
              <Figure label="Valor de venta" value={formatCurrency(summary.inventory.retailValue)} />
              <Figure label="Valor al costo" value={formatCurrency(summary.inventory.costValue)} />
            </div>
          </Card>

          <p className="text-[11px] text-slate-400 text-center">
            La gráfica de ingresos vs egresos en el tiempo y el detalle completo de inventario están en el panel
            de vendedor.
          </p>
        </>
      )}
    </div>
  )
}

function Figure({ label, value }) {
  return (
    <div>
      <p className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-400 font-semibold">{label}</p>
    </div>
  )
}
