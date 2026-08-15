import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useReportSummary, usePeriod } from '../hooks/useReportSummary'
import StatCard from '../components/StatCard'
import DateRangeFilter from '../components/DateRangeFilter'
import MagnitudeBars from '../components/MagnitudeBars'
import IncomeExpenseChart from '../components/IncomeExpenseChart'
import { formatCurrency } from '../utils/currency'
import { describeRange } from '../utils/dates'
import { downloadCsv, csvNumber } from '../utils/csv'
import { channelLabel, categoryLabel } from '../utils/salesConstants'

function Section({ title, subtitle, action, children }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
        {children}
      </div>
    </section>
  )
}

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
      ['Productos', inventory.productCount],
      ['Productos agotados', inventory.outOfStock],
      [],
      ['Egresos por categoría', 'Monto'],
      ...finance.byCategory
        .filter((c) => c.direction === 'EGRESO')
        .map((c) => [categoryLabel(c.category), csvNumber(c.amount)]),
      [],
      ['Ventas por canal', 'Ingresos'],
      ...summary.byChannel.map((c) => [channelLabel(c.channel), csvNumber(c.revenue)]),
      [],
      ['Producto', 'Unidades', 'Ingresos', 'Ganancia'],
      ...summary.topProducts.map((p) => [p.name, p.units, csvNumber(p.revenue), csvNumber(p.grossProfit)]),
    ],
    'reporte-creaciones-baby'
  )
}

export default function Reports() {
  usePageTitle('Reportes')
  const period = usePeriod()
  const { summary, loading, error } = useReportSummary(period)

  const range = { from: period.from, to: period.to }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reportes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Calculado a partir de tus ventas reales, tus gastos y tu inventario.
          </p>
        </div>
        <button
          onClick={() => exportSummary(summary, range)}
          disabled={loading || !summary}
          className="border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-300 font-bold py-2.5 px-5 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Exportar CSV
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
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="payments"
              label="Ingresos por ventas"
              value={formatCurrency(summary.sales.revenue)}
              hint={`${summary.sales.count} ventas · ${summary.sales.units} unidades`}
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
              hint={
                summary.finance.otherIncome > 0
                  ? `Otros ingresos ${formatCurrency(summary.finance.otherIncome)}`
                  : 'Gastos registrados en Finanzas'
              }
              tone="amber"
              size="sm"
            />
            <StatCard
              icon="account_balance"
              label="Resultado neto"
              value={formatCurrency(summary.netResult)}
              hint="Ganancia bruta + otros ingresos − egresos"
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
                registrado. Sus ventas cuentan con costo 0, así que la ganancia y el margen de arriba salen más
                altos de lo real.{' '}
                <Link to="/inventario" className="font-bold underline">
                  Ver cuáles
                </Link>
              </span>
            </p>
          )}

          <Section
            title="Ingresos y egresos en el tiempo"
            subtitle={describeRange(range)}
          >
            <IncomeExpenseChart daily={summary.daily} from={period.from} to={period.to} />
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Ventas por canal" subtitle="Ingresos según dónde vendiste">
              {summary.byChannel.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Sin ventas en este período.</p>
              ) : (
                <MagnitudeBars
                  rows={summary.byChannel.map((c) => ({
                    id: c.channel,
                    label: channelLabel(c.channel),
                    value: c.revenue,
                    hint: `${c.count} ${c.count === 1 ? 'venta' : 'ventas'}`,
                  }))}
                />
              )}
            </Section>

            <Section title="Egresos por categoría" subtitle="En qué se está yendo el dinero">
              {summary.finance.byCategory.filter((c) => c.direction === 'EGRESO').length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Sin egresos registrados.{' '}
                  <Link to="/finanzas" className="font-bold text-primary hover:underline">
                    Registrar un gasto
                  </Link>
                </p>
              ) : (
                <MagnitudeBars
                  fill="var(--viz-expense)"
                  rows={summary.finance.byCategory
                    .filter((c) => c.direction === 'EGRESO')
                    .map((c) => ({
                      id: c.category,
                      label: categoryLabel(c.category),
                      value: c.amount,
                      hint: `${c.count} mov.`,
                    }))}
                />
              )}
            </Section>
          </div>

          <Section
            title="Productos más vendidos"
            subtitle="Por ingresos generados en el período"
            action={
              <Link to="/ventas" className="text-[11px] font-bold text-primary hover:underline">
                Ver todas las ventas
              </Link>
            }
          >
            {summary.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Sin ventas en este período.</p>
            ) : (
              <MagnitudeBars
                rows={summary.topProducts.map((p) => ({
                  id: p.productId,
                  label: p.name,
                  value: p.revenue,
                  hint: `${p.units} u.`,
                }))}
              />
            )}
          </Section>

          <Section title="Inventario actual" subtitle="No depende del período seleccionado">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm">
              <Figure label="Productos" value={summary.inventory.productCount} />
              <Figure label="Unidades" value={summary.inventory.units} />
              <Figure label="Valor a precio de venta" value={formatCurrency(summary.inventory.retailValue)} />
              <Figure label="Valor al costo" value={formatCurrency(summary.inventory.costValue)} />
            </div>
            {summary.inventory.outOfStock > 0 && (
              <p className="text-[11px] text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {summary.inventory.outOfStock}{' '}
                {summary.inventory.outOfStock === 1 ? 'producto está' : 'productos están'} agotado(s).{' '}
                <Link to="/inventario" className="font-bold text-primary hover:underline">
                  Reponer inventario
                </Link>
              </p>
            )}
          </Section>

          {summary.sales.cancelledCount > 0 && (
            <p className="text-[11px] text-slate-400">
              {summary.sales.cancelledCount}{' '}
              {summary.sales.cancelledCount === 1 ? 'venta cancelada' : 'ventas canceladas'} en este período,
              excluida(s) de todos los totales de arriba.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function Figure({ label, value }) {
  return (
    <div>
      <p className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-400 font-semibold">{label}</p>
    </div>
  )
}
