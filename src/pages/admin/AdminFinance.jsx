import { useState } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useFinanceEntries, EMPTY_ENTRY_FORM } from '../../hooks/useFinanceEntries'
import StatCard from '../../components/admin/StatCard'
import Badge from '../../components/admin/Badge'
import DateRangeFilter from '../../components/admin/DateRangeFilter'
import { formatCurrency } from '../../utils/currency'
import { formatDate, today } from '../../utils/dates'
import { PAYMENT_METHODS, categoriesFor, categoryLabel, paymentLabel } from '../../utils/salesConstants'

const inputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none'
const labelClass = 'text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2'

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
      <span className="material-symbols-outlined text-sm">error</span>
      {message}
    </p>
  )
}

/**
 * Quick expense entry for the phone.
 *
 * Unlike the portal's modal-based ledger, the form here is always open at the top
 * of the page: recording a gasto is the reason you'd land on this screen, and
 * making that a tap-then-type instead of tap-tap-then-type matters when you're
 * standing at a fabric shop. Editing and deleting stay in the portal.
 */
export default function AdminFinance() {
  usePageTitle('Gastos')
  const { entries, totals, loading, error, saving, save, filters } = useFinanceEntries()

  const [form, setForm] = useState(EMPTY_ENTRY_FORM)
  const [formErrors, setFormErrors] = useState({})

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const isIngreso = form.direction === 'INGRESO'

  function switchDirection(direction) {
    setForm((f) => ({ ...f, direction, category: categoriesFor(direction)[0].id }))
    setFormErrors({})
  }

  async function onSubmit(e) {
    e.preventDefault()
    const { ok, errors: errs } = await save(form, null)
    setFormErrors(errs)
    // Keep the direction and date so a run of receipts from the same day is fast.
    if (ok) {
      setForm((f) => ({
        ...EMPTY_ENTRY_FORM,
        direction: f.direction,
        category: f.category,
        paymentMethod: f.paymentMethod,
        occurredAt: f.occurredAt,
      }))
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Gastos e ingresos</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Lo que vendes se registra en Ventas. Aquí va todo lo demás.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4"
      >
        <div className="flex gap-2" role="group" aria-label="Tipo de movimiento">
          <button
            type="button"
            onClick={() => switchDirection('EGRESO')}
            aria-pressed={!isIngreso}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors ${
              !isIngreso
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => switchDirection('INGRESO')}
            aria-pressed={isIngreso}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors ${
              isIngreso
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            Otro ingreso
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="fin-amount">Monto (GTQ)</label>
            <input
              id="fin-amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
            <FieldError message={formErrors.amount} />
          </div>
          <div>
            <label className={labelClass} htmlFor="fin-date">Fecha</label>
            <input
              id="fin-date"
              type="date"
              value={form.occurredAt}
              max={today()}
              onChange={(e) => setField('occurredAt', e.target.value)}
              className={inputClass}
            />
            <FieldError message={formErrors.occurredAt} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="fin-description">Descripción</label>
          <input
            id="fin-description"
            type="text"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder={isIngreso ? 'Ej. aporte para tela' : 'Ej. 20 yardas de algodón'}
            className={inputClass}
          />
          <FieldError message={formErrors.description} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="fin-category">Categoría</label>
            <select
              id="fin-category"
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              className={inputClass}
            >
              {categoriesFor(form.direction).map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <FieldError message={formErrors.category} />
          </div>
          <div>
            <label className={labelClass} htmlFor="fin-payment">Pago</label>
            <select
              id="fin-payment"
              value={form.paymentMethod}
              onChange={(e) => setField('paymentMethod', e.target.value)}
              className={inputClass}
            >
              <option value="">Sin especificar</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <details className="group">
          <summary className="text-xs font-bold text-primary cursor-pointer list-none flex items-center gap-1">
            <span className="material-symbols-outlined text-base group-open:rotate-90 transition-transform">
              chevron_right
            </span>
            Proveedor y factura (opcional)
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <input
              type="text"
              value={form.counterparty}
              onChange={(e) => setField('counterparty', e.target.value)}
              placeholder={isIngreso ? 'De quién' : 'Proveedor'}
              aria-label={isIngreso ? 'De quién' : 'Proveedor'}
              className={inputClass}
            />
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setField('reference', e.target.value)}
              placeholder="No. de factura"
              aria-label="Número de factura"
              className={inputClass}
            />
          </div>
        </details>

        <button
          type="submit"
          disabled={saving}
          className={`w-full text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 ${
            isIngreso ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-opacity-95'
          }`}
        >
          {saving && <span className="material-symbols-outlined text-base animate-spin">sync</span>}
          Registrar {isIngreso ? 'ingreso' : 'gasto'}
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="arrow_upward"
          label="Egresos del período"
          value={loading ? '—' : formatCurrency(totals.egresos)}
          tone="red"
          size="sm"
        />
        <StatCard
          icon="arrow_downward"
          label="Otros ingresos"
          value={loading ? '—' : formatCurrency(totals.ingresos)}
          tone="emerald"
          size="sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
        <DateRangeFilter
          preset={filters.preset}
          from={filters.from}
          to={filters.to}
          onPreset={filters.applyPreset}
          onFrom={filters.setFrom}
          onTo={filters.setTo}
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10">
          Sin movimientos en este período.
        </p>
      ) : (
        <ul className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-50 dark:divide-slate-800/50">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-grow">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {entry.description}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge tone={entry.direction === 'INGRESO' ? 'emerald' : 'slate'}>
                    {categoryLabel(entry.category)}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{formatDate(entry.occurredAt)}</span>
                  {entry.paymentMethod && (
                    <span className="text-[10px] text-slate-400">{paymentLabel(entry.paymentMethod)}</span>
                  )}
                </div>
              </div>
              <p
                className={`text-sm font-extrabold flex-shrink-0 ${
                  entry.direction === 'INGRESO'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-800 dark:text-white'
                }`}
              >
                {entry.direction === 'INGRESO' ? '+' : '−'} {formatCurrency(entry.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-slate-400 text-center">
        Para editar o borrar un movimiento, usa el panel de vendedor.
      </p>
    </div>
  )
}
