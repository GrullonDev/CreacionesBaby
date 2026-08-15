import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useSales } from '../hooks/useSales'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import DateRangeFilter from '../components/DateRangeFilter'
import { formatCurrency } from '../utils/currency'
import { formatDate, describeRange } from '../utils/dates'
import { downloadCsv, csvNumber } from '../utils/csv'
import {
  SALE_CHANNELS,
  SALE_STATUSES,
  channelLabel,
  channelIcon,
  paymentLabel,
  statusLabel,
  statusTone,
} from '../utils/salesConstants'

const selectClass =
  'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer'

function exportSales(sales) {
  downloadCsv(
    [
      'Fecha',
      'Canal',
      'Estado',
      'Pago',
      'Cliente',
      'Teléfono',
      'Productos',
      'Unidades',
      'Subtotal',
      'Descuento',
      'Envío',
      'Total',
      'Costo',
      'Ganancia',
      'Notas',
    ],
    sales.map((s) => [
      String(s.soldAt).slice(0, 10),
      channelLabel(s.channel),
      statusLabel(s.status),
      s.paymentMethod ? paymentLabel(s.paymentMethod) : '',
      s.customer?.name || '',
      s.customer?.phone || '',
      s.items.map((i) => `${i.quantity}× ${i.name}`).join(' | '),
      s.itemCount,
      csvNumber(s.subtotal),
      csvNumber(s.discount),
      csvNumber(s.shipping),
      csvNumber(s.total),
      csvNumber(s.cogs),
      csvNumber(s.grossProfit),
      s.notes || '',
    ]),
    'ventas-creaciones-baby'
  )
}

export default function Sales() {
  usePageTitle('Ventas')
  const { sales, totals, pageInfo, loading, error, changeStatus, filters } = useSales()

  // Cancelling isn't just a label change — it puts the stock back and drops the
  // sale out of every report — so it gets a confirmation. Every other transition
  // applies immediately.
  const [confirmingCancel, setConfirmingCancel] = useState(null)

  function onStatusChange(sale, nextStatus) {
    if (nextStatus === 'CANCELLED' && sale.status !== 'CANCELLED') {
      setConfirmingCancel(sale)
      return
    }
    changeStatus(sale, nextStatus)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Ventas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Todas tus ventas en un solo lugar: tienda en línea, WhatsApp, ferias y presenciales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSales(sales)}
            disabled={loading || sales.length === 0}
            className="border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">download</span>
            CSV
          </button>
          <Link
            to="/ventas/nueva"
            className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Registrar venta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="payments"
          label="Ingresos por ventas"
          value={loading ? '—' : formatCurrency(totals.revenue)}
          hint={describeRange({ from: filters.from, to: filters.to })}
          size="sm"
        />
        <StatCard
          icon="receipt_long"
          label="Ventas"
          value={loading ? '—' : totals.count}
          hint={totals.cancelledCount > 0 ? `${totals.cancelledCount} cancelada(s)` : `${totals.units} unidades`}
          size="sm"
        />
        <StatCard
          icon="shopping_bag"
          label="Ticket promedio"
          value={loading ? '—' : formatCurrency(totals.averageTicket)}
          size="sm"
        />
        <StatCard
          icon="trending_up"
          label="Ganancia bruta"
          value={loading ? '—' : formatCurrency(totals.grossProfit)}
          hint={loading ? '' : `Margen ${totals.marginPct.toFixed(1)}%`}
          tone={totals.grossProfit < 0 ? 'red' : 'emerald'}
          size="sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <DateRangeFilter
          preset={filters.preset}
          from={filters.from}
          to={filters.to}
          onPreset={filters.applyPreset}
          onFrom={filters.setFrom}
          onTo={filters.setTo}
        />
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">
              search
            </span>
            <input
              type="search"
              value={filters.search}
              onChange={(e) => filters.setSearch(e.target.value)}
              placeholder="Buscar por cliente, teléfono, producto o nota..."
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-sm pl-10 pr-3 py-2.5 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </div>
          <select
            value={filters.channel}
            onChange={(e) => filters.setChannel(e.target.value)}
            aria-label="Filtrar por canal"
            className={selectClass}
          >
            <option value="">Canal: todos</option>
            {SALE_CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => filters.setStatus(e.target.value)}
            aria-label="Filtrar por estado"
            className={selectClass}
          >
            <option value="">Estado: todos</option>
            {SALE_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">receipt_long</span>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-3">
            No hay ventas en este período
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Cambia el período o registra tu primera venta — también sirve para ventas que ya hiciste.
          </p>
          <Link
            to="/ventas/nueva"
            className="inline-flex items-center gap-2 mt-5 bg-primary text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Registrar venta
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {/* Phone: cards. A seven-column table on a 375px screen is a
              horizontal-scroll puzzle, and recording sales at a fair is a phone
              job. The table below takes over from md up. */}
          <ul className="md:hidden divide-y divide-slate-50 dark:divide-slate-800/50">
            {sales.map((sale) => (
              <li key={sale.id} className={`p-4 ${sale.status === 'CANCELLED' ? 'opacity-55' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/ventas/${sale.id}/editar`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary"
                    >
                      {formatCurrency(sale.total)}
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(sale.soldAt)}
                      {sale.paymentMethod && ` · ${paymentLabel(sale.paymentMethod)}`}
                    </p>
                  </div>
                  <Badge tone="slate" icon={channelIcon(sale.channel)}>{channelLabel(sale.channel)}</Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                  {sale.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') || '—'}
                </p>
                {(sale.customer?.name || sale.customer?.phone) && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {[sale.customer.name, sale.customer.phone].filter(Boolean).join(' · ')}
                  </p>
                )}
                {sale.notes && <p className="text-[11px] text-slate-400 mt-1 italic">{sale.notes}</p>}

                <div className="flex items-center justify-between gap-3 mt-3">
                  <span className="text-[11px] text-slate-400">
                    Ganancia{' '}
                    <span
                      className={`font-bold ${
                        sale.grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {formatCurrency(sale.grossProfit)}
                    </span>
                  </span>
                  <StatusSelect sale={sale} onChange={onStatusChange} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3 font-bold">Fecha</th>
                  <th className="px-5 py-3 font-bold">Productos</th>
                  <th className="px-5 py-3 font-bold hidden md:table-cell">Cliente</th>
                  <th className="px-5 py-3 font-bold">Canal</th>
                  <th className="px-5 py-3 font-bold text-right">Total</th>
                  <th className="px-5 py-3 font-bold text-right hidden lg:table-cell">Ganancia</th>
                  <th className="px-5 py-3 font-bold text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className={`border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${
                      sale.status === 'CANCELLED' ? 'opacity-55' : ''
                    }`}
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Link
                        to={`/ventas/${sale.id}/editar`}
                        className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary"
                      >
                        {formatDate(sale.soldAt)}
                      </Link>
                      {sale.paymentMethod && (
                        <p className="text-[10px] text-slate-400">{paymentLabel(sale.paymentMethod)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 max-w-[16rem]">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {sale.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') || '—'}
                      </p>
                      {sale.notes && <p className="text-[10px] text-slate-400 truncate">{sale.notes}</p>}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[10rem]">
                        {sale.customer?.name || <span className="text-slate-400">Sin nombre</span>}
                      </p>
                      {sale.customer?.phone && (
                        <p className="text-[10px] text-slate-400">{sale.customer.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="slate" icon={channelIcon(sale.channel)}>{channelLabel(sale.channel)}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800 dark:text-white whitespace-nowrap">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-5 py-3 text-right hidden lg:table-cell whitespace-nowrap">
                      <span
                        className={`text-xs font-bold ${
                          sale.grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}
                      >
                        {formatCurrency(sale.grossProfit)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <StatusSelect sale={sale} onChange={onStatusChange} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-50 dark:border-slate-800/50">
            <p className="text-[11px] text-slate-400">
              Mostrando {sales.length} de {pageInfo.total} ventas
            </p>
            {pageInfo.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => filters.setPage(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="text-xs font-bold text-slate-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
                >
                  Anterior
                </button>
                <span className="text-[11px] text-slate-400">
                  {filters.page} / {pageInfo.totalPages}
                </span>
                <button
                  onClick={() => filters.setPage(filters.page + 1)}
                  disabled={filters.page >= pageInfo.totalPages}
                  className="text-xs font-bold text-slate-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={Boolean(confirmingCancel)}
        onClose={() => setConfirmingCancel(null)}
        title="¿Cancelar esta venta?"
        description={
          confirmingCancel
            ? `${formatDate(confirmingCancel.soldAt)} · ${formatCurrency(confirmingCancel.total)}`
            : ''
        }
        maxWidth="max-w-sm"
      >
        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4">
          <li>
            Las{' '}
            {confirmingCancel?.itemCount === 1
              ? '1 unidad regresa'
              : `${confirmingCancel?.itemCount} unidades regresan`}{' '}
            al inventario.
          </li>
          <li>La venta deja de contar en los reportes.</li>
          <li>Sigue apareciendo en la lista, marcada como cancelada — no se borra.</li>
        </ul>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={() => setConfirmingCancel(null)}
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white px-4 py-2.5"
          >
            No, dejarla
          </button>
          <button
            type="button"
            onClick={() => {
              changeStatus(confirmingCancel, 'CANCELLED')
              setConfirmingCancel(null)
            }}
            className="bg-red-500 hover:bg-red-600 text-white py-2.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider"
          >
            Sí, cancelar
          </button>
        </div>
      </Modal>
    </div>
  )
}

/**
 * Inline status change — the most common follow-up on a sale is marking it paid,
 * shipped or cancelled. Shared by the phone cards and the desktop table so the
 * colour ladder lives in one place.
 */
function StatusSelect({ sale, onChange }) {
  const tone = statusTone(sale.status)
  const toneClass =
    tone === 'emerald'
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
      : tone === 'red'
        ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
        : tone === 'sky'
          ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10'
          : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'

  return (
    <select
      value={sale.status}
      onChange={(e) => onChange(sale, e.target.value)}
      aria-label={`Estado de la venta del ${formatDate(sale.soldAt)}`}
      className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1.5 border-none cursor-pointer focus:ring-2 focus:ring-primary/40 outline-none appearance-none text-center ${toneClass}`}
    >
      {SALE_STATUSES.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  )
}
