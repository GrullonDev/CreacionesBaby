import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useSales } from '../../hooks/useSales'
import StatCard from '../../components/admin/StatCard'
import Badge from '../../components/admin/Badge'
import Modal from '../../components/admin/Modal'
import DateRangeFilter from '../../components/admin/DateRangeFilter'
import { formatCurrency } from '../../utils/currency'
import { formatDate, describeRange } from '../../utils/dates'
import {
  SALE_CHANNELS,
  SALE_STATUSES,
  channelLabel,
  channelIcon,
  paymentLabel,
  statusTone,
} from '../../utils/salesConstants'

const selectClass =
  'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer'

/**
 * Sales list for the phone-first back office: cards instead of a wide table, so
 * every sale is readable without horizontal scrolling, and one tap to change a
 * status. The seller portal has the full table view, the estado filter and the
 * per-sale CSV export for when you're at a desk.
 */
export default function AdminSales() {
  usePageTitle('Ventas')
  const { sales, totals, pageInfo, loading, error, changeStatus, filters } = useSales()

  // Cancelling puts the stock back and drops the sale out of the reports, so it
  // asks first — easy to hit by accident on a phone. Other transitions apply
  // straight away.
  const [confirmingCancel, setConfirmingCancel] = useState(null)

  function onStatusChange(sale, nextStatus) {
    if (nextStatus === 'CANCELLED' && sale.status !== 'CANCELLED') {
      setConfirmingCancel(sale)
      return
    }
    changeStatus(sale, nextStatus)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Ventas</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {describeRange({ from: filters.from, to: filters.to })}
          </p>
        </div>
        <Link
          to="/admin/ventas/nueva"
          className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-5 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Venta
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="payments"
          label="Ingresos"
          value={loading ? '—' : formatCurrency(totals.revenue)}
          hint={loading ? '' : `${totals.count} ventas`}
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
              placeholder="Buscar cliente o producto..."
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
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">receipt_long</span>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-3">Sin ventas en este período</p>
          <Link
            to="/admin/ventas/nueva"
            className="inline-flex items-center gap-2 mt-4 bg-primary text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Registrar venta
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {sales.map((sale) => (
              <li
                key={sale.id}
                className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 ${
                  sale.status === 'CANCELLED' ? 'opacity-55' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(sale.total)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(sale.soldAt)}
                      {sale.paymentMethod && ` · ${paymentLabel(sale.paymentMethod)}`}
                    </p>
                  </div>
                  <Badge tone="slate" icon={channelIcon(sale.channel)}>
                    {channelLabel(sale.channel)}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                  {sale.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                </p>
                {(sale.customer?.name || sale.customer?.phone) && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {[sale.customer.name, sale.customer.phone].filter(Boolean).join(' · ')}
                  </p>
                )}
                {sale.notes && <p className="text-[11px] text-slate-400 mt-1 italic">{sale.notes}</p>}

                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/60">
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
                  <select
                    value={sale.status}
                    onChange={(e) => onStatusChange(sale, e.target.value)}
                    aria-label={`Estado de la venta del ${formatDate(sale.soldAt)}`}
                    className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1.5 border-none cursor-pointer focus:ring-2 focus:ring-primary/40 outline-none appearance-none ${
                      statusTone(sale.status) === 'emerald'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                        : statusTone(sale.status) === 'red'
                          ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
                          : statusTone(sale.status) === 'sky'
                            ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                    }`}
                  >
                    {SALE_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>

          {pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => filters.setPage(filters.page - 1)}
                disabled={filters.page <= 1}
                className="text-xs font-bold text-slate-500 hover:text-primary disabled:opacity-40 px-3 py-2"
              >
                Anterior
              </button>
              <span className="text-[11px] text-slate-400">
                {filters.page} / {pageInfo.totalPages}
              </span>
              <button
                onClick={() => filters.setPage(filters.page + 1)}
                disabled={filters.page >= pageInfo.totalPages}
                className="text-xs font-bold text-slate-500 hover:text-primary disabled:opacity-40 px-3 py-2"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
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
            {confirmingCancel?.itemCount === 1
              ? 'La unidad regresa'
              : `Las ${confirmingCancel?.itemCount} unidades regresan`}{' '}
            al inventario.
          </li>
          <li>Deja de contar en los reportes.</li>
          <li>No se borra: queda en la lista marcada como cancelada.</li>
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
