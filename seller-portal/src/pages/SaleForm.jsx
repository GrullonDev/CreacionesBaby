import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useSaleForm } from '../hooks/useSaleForm'
import LineItemsEditor from '../components/LineItemsEditor'
import { formatCurrency } from '../utils/currency'
import { today } from '../utils/dates'
import { SALE_CHANNELS, PAYMENT_METHODS, SALE_STATUSES } from '../utils/salesConstants'

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
      <span className="material-symbols-outlined text-sm">error</span>
      {message}
    </p>
  )
}

const inputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none'
const labelClass = 'text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2'

const TABS = [
  { id: 'venta', label: '1. Venta', fields: ['soldAt', 'channel'] },
  { id: 'productos', label: '2. Productos', fields: ['items'] },
  { id: 'cliente', label: '3. Cliente y totales', fields: ['discount', 'shipping'] },
]

export default function SaleForm() {
  const { id } = useParams()
  const {
    isEditMode,
    loading,
    submitting,
    form,
    setField,
    lines,
    setLines,
    products,
    errors,
    totals,
    handleSubmit,
    submitAndAnother,
  } = useSaleForm(id)

  usePageTitle(isEditMode ? 'Editar venta' : 'Registrar venta')

  const [activeTab, setActiveTab] = useState('venta')

  // Same behaviour as ProductForm: if a submit left errors on a hidden tab, jump
  // to it, otherwise the button just seems not to work.
  useEffect(() => {
    const errorFields = Object.keys(errors)
    if (errorFields.length === 0) return
    const lineError = errorFields.some((f) => f.startsWith('line-'))
    const tabWithError = lineError
      ? TABS.find((t) => t.id === 'productos')
      : TABS.find((tab) => tab.fields.some((f) => errorFields.includes(f)))
    if (tabWithError && tabWithError.id !== activeTab) setActiveTab(tabWithError.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Link to="/ventas" className="hover:text-primary transition-colors">Ventas</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-200">
            {isEditMode ? 'Editar venta' : 'Registrar venta'}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isEditMode && (
            <button
              type="button"
              onClick={submitAndAnother}
              disabled={submitting}
              className="flex-1 sm:flex-none justify-center border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-300 py-2.5 px-4 rounded-full font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            >
              Guardar y otra
            </button>
          )}
          <button
            type="submit"
            form="sale-form"
            disabled={submitting}
            className="flex-1 sm:flex-none justify-center bg-primary hover:bg-opacity-95 text-white py-2.5 px-6 rounded-full font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2"
          >
            {submitting && <span className="material-symbols-outlined text-base animate-spin">sync</span>}
            {isEditMode ? 'Guardar cambios' : 'Registrar venta'}
          </button>
        </div>
      </div>

      {isEditMode && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl px-4 py-3 mb-6">
          Los productos de una venta ya registrada no se pueden cambiar aquí, porque el stock ya se descontó. Si
          te equivocaste en los productos, cancela esta venta (el inventario se devuelve solo) y regístrala de
          nuevo. Sí puedes corregir la fecha, el canal, el estado, el pago y las notas.
        </p>
      )}

      {products.length === 0 && !isEditMode && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-4 py-3 mb-6">
          Todavía no tienes productos en tu catálogo, así que no hay nada que vender.{' '}
          <Link to="/productos/nuevo" className="font-bold text-primary hover:underline">
            Crea tu primer producto
          </Link>{' '}
          y vuelve aquí.
        </p>
      )}

      <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs font-bold pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form id="sale-form" onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
          {/* 1. Venta */}
          <div className={activeTab === 'venta' ? 'space-y-6' : 'hidden'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="soldAt">Fecha de la venta</label>
                <input
                  id="soldAt"
                  type="date"
                  value={form.soldAt}
                  max={today()}
                  onChange={(e) => setField('soldAt', e.target.value)}
                  className={inputClass}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Puedes registrar ventas de días pasados; el reporte las cuenta en su fecha real.
                </p>
                <FieldError message={errors.soldAt} />
              </div>

              <div>
                <label className={labelClass} htmlFor="channel">Canal de venta</label>
                <select
                  id="channel"
                  value={form.channel}
                  onChange={(e) => setField('channel', e.target.value)}
                  className={inputClass}
                >
                  {SALE_CHANNELS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <FieldError message={errors.channel} />
              </div>

              <div>
                <label className={labelClass} htmlFor="paymentMethod">Método de pago</label>
                <select
                  id="paymentMethod"
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

              <div>
                <label className={labelClass} htmlFor="status">Estado</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  className={inputClass}
                >
                  {SALE_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Una venta cancelada no descuenta inventario ni cuenta en los reportes.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Productos */}
          <div className={activeTab === 'productos' ? '' : 'hidden'}>
            <label className={labelClass}>Productos vendidos</label>
            <p className="text-[11px] text-slate-400 mb-3 -mt-1">
              El precio se rellena con el de tu catálogo, pero puedes cambiarlo si diste otro precio.
            </p>
            <LineItemsEditor lines={lines} products={products} errors={errors} onChange={setLines} />
          </div>

          {/* 3. Cliente y totales */}
          <div className={activeTab === 'cliente' ? 'space-y-6' : 'hidden'}>
            <div>
              <p className={labelClass}>Cliente <span className="normal-case font-semibold text-slate-400">(todo opcional)</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setField('customerName', e.target.value)}
                  placeholder="Nombre"
                  aria-label="Nombre del cliente"
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setField('customerPhone', e.target.value)}
                  placeholder="Teléfono / WhatsApp"
                  aria-label="Teléfono del cliente"
                  className={inputClass}
                />
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setField('customerEmail', e.target.value)}
                  placeholder="Correo"
                  aria-label="Correo del cliente"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={form.customerCity}
                  onChange={(e) => setField('customerCity', e.target.value)}
                  placeholder="Municipio / ciudad"
                  aria-label="Ciudad del cliente"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={form.customerAddress}
                  onChange={(e) => setField('customerAddress', e.target.value)}
                  placeholder="Dirección de entrega"
                  aria-label="Dirección de entrega"
                  className={`${inputClass} sm:col-span-2`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="discount">Descuento (GTQ)</label>
                <input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={(e) => setField('discount', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
                <FieldError message={errors.discount} />
              </div>
              <div>
                <label className={labelClass} htmlFor="shipping">Envío cobrado (GTQ)</label>
                <input
                  id="shipping"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shipping}
                  onChange={(e) => setField('shipping', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
                <FieldError message={errors.shipping} />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Ej. entregar el viernes en la zona 10, pidió empaque de regalo..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Running totals, visible on every tab — the number being checked against
            what was actually charged. Sticks to the bottom of the viewport on a
            phone, where the product lines push it off-screen. */}
        <div className="mt-4 sticky bottom-0 sm:static bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-900/5 sm:shadow-none">
          <div className="space-y-1.5 text-sm">
            <Row label={`Subtotal (${totals.units} ${totals.units === 1 ? 'unidad' : 'unidades'})`} value={formatCurrency(totals.subtotal)} />
            {totals.discount > 0 && <Row label="Descuento" value={`− ${formatCurrency(totals.discount)}`} />}
            {totals.shipping > 0 && <Row label="Envío" value={formatCurrency(totals.shipping)} />}
            <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Total</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>

          {totals.units > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Costo de lo vendido</span>
                <span className="font-bold">{formatCurrency(totals.cogs)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ganancia estimada</span>
                <span
                  className={`font-bold ${
                    totals.grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}
                >
                  {formatCurrency(totals.grossProfit)}
                </span>
              </div>
              {totals.missingCost && (
                <p className="text-amber-600 dark:text-amber-400 flex items-start gap-1 pt-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Algún producto no tiene costo registrado, así que la ganancia sale más alta de lo real. Añade el
                  costo en la ficha del producto.
                </p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
      <span className="text-xs">{label}</span>
      <span className="font-bold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  )
}
