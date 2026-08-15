import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useFinanceEntries, EMPTY_ENTRY_FORM } from '../hooks/useFinanceEntries'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import DateRangeFilter from '../components/DateRangeFilter'
import { formatCurrency } from '../utils/currency'
import { formatDate, describeRange, today } from '../utils/dates'
import { downloadCsv, csvNumber } from '../utils/csv'
import {
  PAYMENT_METHODS,
  categoriesFor,
  categoryLabel,
  paymentLabel,
} from '../utils/salesConstants'

const inputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none'
const labelClass = 'text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2'
const selectClass =
  'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer'

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
      <span className="material-symbols-outlined text-sm">error</span>
      {message}
    </p>
  )
}

function exportEntries(entries) {
  downloadCsv(
    ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Pago', 'Proveedor/Cliente', 'Referencia', 'Notas'],
    entries.map((e) => [
      String(e.occurredAt).slice(0, 10),
      e.direction === 'INGRESO' ? 'Ingreso' : 'Egreso',
      categoryLabel(e.category),
      e.description,
      csvNumber(e.amount),
      e.paymentMethod ? paymentLabel(e.paymentMethod) : '',
      e.counterparty || '',
      e.reference || '',
      e.notes || '',
    ]),
    'movimientos-caja-creaciones-baby'
  )
}

export default function Finance() {
  usePageTitle('Finanzas')
  const { entries, totals, pageInfo, loading, error, saving, save, remove, filters } = useFinanceEntries()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_ENTRY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [confirmingDelete, setConfirmingDelete] = useState(null)

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  function openNew(direction) {
    setEditingId(null)
    setForm({
      ...EMPTY_ENTRY_FORM,
      direction,
      // Reset the category too, since each direction has its own list.
      category: categoriesFor(direction)[0].id,
      occurredAt: today(),
    })
    setFormErrors({})
    setModalOpen(true)
  }

  function openEdit(entry) {
    setEditingId(entry.id)
    setForm({
      direction: entry.direction,
      category: entry.category,
      description: entry.description,
      amount: String(entry.amount),
      paymentMethod: entry.paymentMethod || '',
      counterparty: entry.counterparty || '',
      reference: entry.reference || '',
      notes: entry.notes || '',
      occurredAt: String(entry.occurredAt).slice(0, 10),
    })
    setFormErrors({})
    setModalOpen(true)
  }

  async function onSubmit(e) {
    e.preventDefault()
    const { ok, errors: errs } = await save(form, editingId)
    setFormErrors(errs)
    if (ok) setModalOpen(false)
  }

  const isIngreso = form.direction === 'INGRESO'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Finanzas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gastos y otros ingresos. Lo que vendes se registra en Ventas y se suma en Reportes.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportEntries(entries)}
            disabled={loading || entries.length === 0}
            className="border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">download</span>
            CSV
          </button>
          <button
            onClick={() => openNew('INGRESO')}
            className="border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">arrow_downward</span>
            Ingreso
          </button>
          <button
            onClick={() => openNew('EGRESO')}
            className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-5 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">arrow_upward</span>
            Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon="arrow_downward"
          label="Otros ingresos"
          value={loading ? '—' : formatCurrency(totals.ingresos)}
          hint={describeRange({ from: filters.from, to: filters.to })}
          tone="emerald"
        />
        <StatCard
          icon="arrow_upward"
          label="Egresos"
          value={loading ? '—' : formatCurrency(totals.egresos)}
          tone="red"
        />
        <StatCard
          icon="account_balance_wallet"
          label="Balance de caja"
          value={loading ? '—' : formatCurrency(totals.balance)}
          hint="Sin contar los ingresos por ventas"
          tone={totals.balance < 0 ? 'red' : 'emerald'}
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
              placeholder="Buscar por descripción, proveedor o factura..."
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-sm pl-10 pr-3 py-2.5 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </div>
          <select
            value={filters.direction}
            onChange={(e) => filters.setDirection(e.target.value)}
            aria-label="Filtrar por tipo"
            className={selectClass}
          >
            <option value="">Tipo: todos</option>
            <option value="INGRESO">Solo ingresos</option>
            <option value="EGRESO">Solo egresos</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => filters.setCategory(e.target.value)}
            aria-label="Filtrar por categoría"
            className={selectClass}
          >
            <option value="">Categoría: todas</option>
            {categoriesFor(filters.direction || 'EGRESO').map((c) => (
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
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">
            account_balance_wallet
          </span>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-3">
            Sin movimientos en este período
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Registra lo que gastas — tela, envíos, empaque, publicidad — para que los reportes muestren tu
            ganancia real y no solo lo que vendiste.
          </p>
          <button
            onClick={() => openNew('EGRESO')}
            className="inline-flex items-center gap-2 mt-5 bg-primary text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Registrar gasto
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3 font-bold">Fecha</th>
                  <th className="px-5 py-3 font-bold">Descripción</th>
                  <th className="px-5 py-3 font-bold hidden sm:table-cell">Categoría</th>
                  <th className="px-5 py-3 font-bold hidden lg:table-cell">Proveedor</th>
                  <th className="px-5 py-3 font-bold text-right">Monto</th>
                  <th className="px-5 py-3 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(entry.occurredAt)}
                    </td>
                    <td className="px-5 py-3 max-w-[16rem]">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {entry.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {entry.reference && (
                          <span className="text-[10px] text-slate-400">Ref. {entry.reference}</span>
                        )}
                        {entry.paymentMethod && (
                          <span className="text-[10px] text-slate-400">{paymentLabel(entry.paymentMethod)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <Badge tone={entry.direction === 'INGRESO' ? 'emerald' : 'slate'}>
                        {categoryLabel(entry.category)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-xs text-slate-500 dark:text-slate-400 truncate max-w-[10rem]">
                      {entry.counterparty || '—'}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <span
                        className={`text-sm font-extrabold ${
                          entry.direction === 'INGRESO'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-800 dark:text-white'
                        }`}
                      >
                        {entry.direction === 'INGRESO' ? '+' : '−'} {formatCurrency(entry.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(entry)}
                        aria-label={`Editar ${entry.description}`}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setConfirmingDelete(entry)}
                        aria-label={`Eliminar ${entry.description}`}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-50 dark:border-slate-800/50">
            <p className="text-[11px] text-slate-400">
              Mostrando {entries.length} de {pageInfo.total} movimientos
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId
            ? 'Editar movimiento'
            : isIngreso
              ? 'Registrar un ingreso'
              : 'Registrar un gasto'
        }
        description={
          isIngreso
            ? 'Para dinero que entra y no viene de una venta: aportes, préstamos, reembolsos.'
            : 'Materia prima, envíos, empaque, publicidad, renta... todo lo que sale de la caja.'
        }
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="entry-amount">Monto (GTQ)</label>
              <input
                id="entry-amount"
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
              <label className={labelClass} htmlFor="entry-date">Fecha</label>
              <input
                id="entry-date"
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
            <label className={labelClass} htmlFor="entry-description">Descripción</label>
            <input
              id="entry-description"
              type="text"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder={isIngreso ? 'Ej. aporte para comprar tela' : 'Ej. 20 yardas de algodón'}
              className={inputClass}
            />
            <FieldError message={formErrors.description} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="entry-category">Categoría</label>
              <select
                id="entry-category"
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
              <label className={labelClass} htmlFor="entry-payment">Método de pago</label>
              <select
                id="entry-payment"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="entry-counterparty">
                {isIngreso ? 'De quién' : 'Proveedor'}{' '}
                <span className="normal-case font-semibold text-slate-400">(opcional)</span>
              </label>
              <input
                id="entry-counterparty"
                type="text"
                value={form.counterparty}
                onChange={(e) => setField('counterparty', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="entry-reference">
                No. de factura <span className="normal-case font-semibold text-slate-400">(opcional)</span>
              </label>
              <input
                id="entry-reference"
                type="text"
                value={form.reference}
                onChange={(e) => setField('reference', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="entry-notes">
              Notas <span className="normal-case font-semibold text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="entry-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white px-4 py-2.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-opacity-95 text-white py-2.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <span className="material-symbols-outlined text-base animate-spin">sync</span>}
              {editingId ? 'Guardar' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(confirmingDelete)}
        onClose={() => setConfirmingDelete(null)}
        title="¿Eliminar este movimiento?"
        description={confirmingDelete?.description}
        maxWidth="max-w-sm"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Se borrará de forma permanente y dejará de contar en tus reportes.
        </p>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={() => setConfirmingDelete(null)}
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white px-4 py-2.5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              remove(confirmingDelete)
              setConfirmingDelete(null)
            }}
            className="bg-red-500 hover:bg-red-600 text-white py-2.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}
