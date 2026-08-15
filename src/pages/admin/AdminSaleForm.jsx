import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useSaleForm } from '../../hooks/useSaleForm'
import LineItemsEditor from '../../components/admin/LineItemsEditor'
import { formatCurrency } from '../../utils/currency'
import { today } from '../../utils/dates'
import { SALE_CHANNELS, PAYMENT_METHODS, SALE_STATUSES } from '../../utils/salesConstants'

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

/**
 * Single-column sale entry, for a phone.
 *
 * Same hook (and therefore the same validation and the same server call) as the
 * seller portal's tabbed version — the difference is the layout: one scroll, no
 * tabs, customer details collapsed behind a <details> because most in-person
 * sales don't need them, and a sticky total so the amount stays visible while you
 * add products.
 */
export default function AdminSaleForm() {
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
  } = useSaleForm(id, { listPath: '/admin' })

  usePageTitle(isEditMode ? 'Editar venta' : 'Registrar venta')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-5">
        <Link to="/admin" className="hover:text-primary transition-colors">Ventas</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-700 dark:text-slate-200">
          {isEditMode ? 'Editar venta' : 'Nueva venta'}
        </span>
      </div>

      {isEditMode && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl px-4 py-3 mb-5">
          Los productos ya no se pueden cambiar: el inventario se descontó al registrarla. Cancela la venta (el
          stock se devuelve solo) y regístrala de nuevo si hace falta corregirlos.
        </p>
      )}

      {products.length === 0 && !isEditMode && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-4 py-3 mb-5">
          No tienes productos en el catálogo todavía. Créalos en el panel de vendedor y vuelve aquí para
          registrar ventas.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="soldAt">Fecha</label>
              <input
                id="soldAt"
                type="date"
                value={form.soldAt}
                max={today()}
                onChange={(e) => setField('soldAt', e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.soldAt} />
            </div>
            <div>
              <label className={labelClass} htmlFor="channel">Canal</label>
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
              <label className={labelClass} htmlFor="paymentMethod">Pago</label>
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
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
          <p className={labelClass}>Productos</p>
          <LineItemsEditor lines={lines} products={products} errors={errors} onChange={setLines} />
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="discount">Descuento</label>
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
              <label className={labelClass} htmlFor="shipping">Envío cobrado</label>
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

          {/* Most cash sales never fill these in, so they start collapsed. */}
          <details className="group">
            <summary className="text-xs font-bold text-primary cursor-pointer list-none flex items-center gap-1">
              <span className="material-symbols-outlined text-base group-open:rotate-90 transition-transform">
                chevron_right
              </span>
              Datos del cliente (opcional)
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
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
          </details>

          <div>
            <label className={labelClass} htmlFor="notes">
              Notas <span className="normal-case font-semibold text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Ej. entregar el viernes, empaque de regalo..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </section>

        {/* Sticky so the total is visible while scrolling through the products,
            sitting above the mobile tab bar. */}
        <div className="sticky bottom-16 sm:bottom-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-lg shadow-slate-900/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold">
                {totals.units} {totals.units === 1 ? 'unidad' : 'unidades'}
                {totals.units > 0 && ` · ganancia ${formatCurrency(totals.grossProfit)}`}
              </p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totals.total)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditMode && (
                <button
                  type="button"
                  onClick={submitAndAnother}
                  disabled={submitting}
                  className="border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-full font-bold text-[11px] uppercase tracking-wider disabled:opacity-50"
                >
                  Y otra
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-opacity-95 text-white py-2.5 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <span className="material-symbols-outlined text-base animate-spin">sync</span>}
                {isEditMode ? 'Guardar' : 'Registrar'}
              </button>
            </div>
          </div>
          {totals.missingCost && totals.units > 0 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              Algún producto no tiene costo registrado, así que la ganancia mostrada es más alta que la real.
            </p>
          )}
          {errors.items && (
            <p className="text-[11px] font-semibold text-red-500 mt-2 flex items-start gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {errors.items}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
