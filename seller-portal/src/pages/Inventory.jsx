import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts, SELLER_CATEGORIES } from '../hooks/useProducts'
import { useStockMovements, EMPTY_MOVEMENT_FORM } from '../hooks/useStockMovements'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/currency'
import { formatDateTime } from '../utils/dates'
import { downloadCsv, csvNumber } from '../utils/csv'
import {
  LOW_STOCK_THRESHOLD,
  MANUAL_MOVEMENT_TYPES,
  MOVEMENT_TYPES,
  movementLabel,
  movementTone,
} from '../utils/salesConstants'

function categoryLabel(id) {
  return SELLER_CATEGORIES.find((c) => c.id === id)?.label || id
}

function stockStatus(stock) {
  if (stock === 0) return { label: 'Agotado', tone: 'red' }
  if (stock < LOW_STOCK_THRESHOLD) return { label: 'Bajo', tone: 'amber' }
  return { label: 'Óptimo', tone: 'emerald' }
}

const selectClass =
  'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer'
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

const TABS = [
  { id: 'existencias', label: 'Existencias' },
  { id: 'movimientos', label: 'Movimientos' },
]

export default function Inventory() {
  usePageTitle('Inventario')
  const { products, loading, error, refresh: refreshProducts } = useProducts()
  const movements = useStockMovements()

  const [tab, setTab] = useState('existencias')
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')

  const [adjusting, setAdjusting] = useState(null)
  const [form, setForm] = useState(EMPTY_MOVEMENT_FORM)
  const [formErrors, setFormErrors] = useState({})

  const totalProducts = products.length
  const criticalStock = products.filter((p) => p.stock < LOW_STOCK_THRESHOLD).length
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const costValue = products.reduce((sum, p) => sum + (p.cost || 0) * p.stock, 0)

  const filtered = useMemo(() => {
    let result = products
    const q = search.trim().toLowerCase()
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q))
    if (estado === 'bajo') result = result.filter((p) => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD)
    if (estado === 'agotado') result = result.filter((p) => p.stock === 0)
    if (estado === 'optimo') result = result.filter((p) => p.stock >= LOW_STOCK_THRESHOLD)
    if (estado === 'sinCosto') result = result.filter((p) => p.cost === null || p.cost === undefined)
    return result
  }, [products, search, estado])

  function openAdjust(product) {
    setAdjusting(product)
    setForm({ ...EMPTY_MOVEMENT_FORM, newStock: String(product.stock) })
    setFormErrors({})
  }

  async function onSubmitAdjust(e) {
    e.preventDefault()
    const { ok, errors: errs } = await movements.create(form, adjusting)
    setFormErrors(errs)
    if (ok) {
      // The product list holds the stock number the table renders, so it has to
      // be refetched too — not just the movement history.
      await refreshProducts()
      setAdjusting(null)
    }
  }

  function exportStock() {
    downloadCsv(
      ['Producto', 'Categoría', 'Stock', 'Estado', 'Precio', 'Costo', 'Valor a precio', 'Valor al costo'],
      filtered.map((p) => [
        p.name,
        categoryLabel(p.category),
        p.stock,
        stockStatus(p.stock).label,
        csvNumber(p.price),
        p.cost === null || p.cost === undefined ? '' : csvNumber(p.cost),
        csvNumber(p.price * p.stock),
        p.cost ? csvNumber(p.cost * p.stock) : '',
      ]),
      'inventario-creaciones-baby'
    )
  }

  function exportMovements() {
    downloadCsv(
      ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Stock resultante', 'Costo unitario', 'Motivo'],
      movements.movements.map((m) => [
        formatDateTime(m.createdAt),
        m.productName,
        movementLabel(m.type),
        m.quantity,
        m.stockAfter,
        m.unitCost === null || m.unitCost === undefined ? '' : csvNumber(m.unitCost),
        m.reason || '',
      ]),
      'movimientos-inventario-creaciones-baby'
    )
  }

  const isAjuste = form.type === 'AJUSTE'

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Gestión de Inventario</h1>
          <p className="text-xs text-slate-400 mt-1">
            Existencias actuales y el historial completo de entradas, salidas y ventas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={tab === 'existencias' ? exportStock : exportMovements}
            disabled={tab === 'existencias' ? filtered.length === 0 : movements.movements.length === 0}
            className="border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">download</span>
            CSV
          </button>
          <Link
            to="/productos/nuevo"
            className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="warehouse" label="Total productos" value={loading ? '—' : totalProducts} size="sm" />
        <StatCard
          icon="warning"
          label="Stock crítico"
          value={loading ? '—' : criticalStock}
          hint={`Menos de ${LOW_STOCK_THRESHOLD} unidades`}
          tone={!loading && criticalStock > 0 ? 'red' : 'primary'}
          size="sm"
        />
        <StatCard
          icon="sell"
          label="Valor a precio de venta"
          value={loading ? '—' : formatCurrency(inventoryValue)}
          size="sm"
        />
        <StatCard
          icon="payments"
          label="Valor al costo"
          value={loading ? '—' : formatCurrency(costValue)}
          hint="Lo que te costó producirlo"
          size="sm"
        />
      </div>

      <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`text-xs font-bold pb-3 border-b-2 transition-colors ${
              tab === t.id
                ? 'text-primary border-primary'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'existencias' ? (
        <>
          {/* No "Almacén" filter: this store only tracks one inventory, not multiple warehouses */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 mb-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">
                search
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-sm pl-10 pr-3 py-2.5 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 outline-none"
              />
            </div>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              aria-label="Filtrar por estado"
              className={selectClass}
            >
              <option value="">Estado: todos</option>
              <option value="optimo">Óptimo</option>
              <option value="bajo">Bajo</option>
              <option value="agotado">Agotado</option>
              <option value="sinCosto">Sin costo registrado</option>
            </select>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3 mb-6">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center">
              {products.length === 0 ? 'Aún no tienes productos con inventario.' : 'No hay productos que coincidan.'}
            </p>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-5 py-3 font-bold">Producto</th>
                    <th className="px-5 py-3 font-bold hidden md:table-cell">Categoría</th>
                    <th className="px-5 py-3 font-bold text-right">Stock</th>
                    <th className="px-5 py-3 font-bold text-right hidden sm:table-cell">Precio</th>
                    <th className="px-5 py-3 font-bold text-right hidden lg:table-cell">Costo</th>
                    <th className="px-5 py-3 font-bold text-right hidden lg:table-cell">Valor</th>
                    <th className="px-5 py-3 font-bold text-right">Estado</th>
                    <th className="px-5 py-3 font-bold text-right">Ajustar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const status = stockStatus(p.stock)
                    return (
                      <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                        <td className="px-5 py-3">
                          <Link to={`/productos/${p.id}/editar`} className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                              {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white group-hover:text-primary line-clamp-1">
                              {p.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell">
                          {categoryLabel(p.category)}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-slate-700 dark:text-slate-200">
                          {p.stock}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="px-5 py-3 text-right text-xs hidden lg:table-cell">
                          {p.cost === null || p.cost === undefined ? (
                            <Link
                              to={`/productos/${p.id}/editar`}
                              className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                            >
                              Añadir
                            </Link>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">{formatCurrency(p.cost)}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400 text-xs hidden lg:table-cell">
                          {formatCurrency(p.price * p.stock)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => openAdjust(p)}
                            aria-label={`Ajustar inventario de ${p.name}`}
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">tune</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="text-[11px] text-slate-400 px-5 py-3 border-t border-slate-50 dark:border-slate-800/50">
                Mostrando {filtered.length} de {products.length} productos
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 mb-6 flex flex-col sm:flex-row gap-2">
            <select
              value={movements.filters.productId}
              onChange={(e) => movements.setFilter('productId', e.target.value)}
              aria-label="Filtrar por producto"
              className={`${selectClass} flex-grow`}
            >
              <option value="">Producto: todos</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={movements.filters.type}
              onChange={(e) => movements.setFilter('type', e.target.value)}
              aria-label="Filtrar por tipo de movimiento"
              className={selectClass}
            >
              <option value="">Tipo: todos</option>
              {MOVEMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {movements.error && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3 mb-6">
              {movements.error}
            </p>
          )}

          {movements.loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
            </div>
          ) : movements.movements.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">history</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-3">Sin movimientos todavía</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Cada venta, entrada de producción, merma o ajuste queda registrado aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-5 py-3 font-bold">Fecha</th>
                      <th className="px-5 py-3 font-bold">Producto</th>
                      <th className="px-5 py-3 font-bold">Tipo</th>
                      <th className="px-5 py-3 font-bold text-right">Cambio</th>
                      <th className="px-5 py-3 font-bold text-right hidden sm:table-cell">Stock después</th>
                      <th className="px-5 py-3 font-bold hidden lg:table-cell">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.movements.map((m) => (
                      <tr key={m.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDateTime(m.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                            {m.productName}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={movementTone(m.type)}>{movementLabel(m.type)}</Badge>
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <span
                            className={`text-xs font-extrabold ${
                              m.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                            }`}
                          >
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:table-cell">
                          {m.stockAfter}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 hidden lg:table-cell truncate max-w-[12rem]">
                          {m.reason || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-50 dark:border-slate-800/50">
                <p className="text-[11px] text-slate-400">
                  Mostrando {movements.movements.length} de {movements.pageInfo.total} movimientos
                </p>
                {movements.pageInfo.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => movements.setPage(movements.page - 1)}
                      disabled={movements.page <= 1}
                      className="text-xs font-bold text-slate-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
                    >
                      Anterior
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {movements.page} / {movements.pageInfo.totalPages}
                    </span>
                    <button
                      onClick={() => movements.setPage(movements.page + 1)}
                      disabled={movements.page >= movements.pageInfo.totalPages}
                      className="text-xs font-bold text-slate-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        title="Ajustar inventario"
        description={adjusting ? `${adjusting.name} — ${adjusting.stock} unidades actualmente` : ''}
      >
        <form onSubmit={onSubmitAdjust} className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="mov-type">Tipo de movimiento</label>
            <select
              id="mov-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className={inputClass}
            >
              {MANUAL_MOVEMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {form.type === 'ENTRADA' && 'Produjiste o compraste más unidades.'}
              {form.type === 'SALIDA' && 'Unidades que salieron sin ser una venta (regalo, muestra, uso propio).'}
              {form.type === 'AJUSTE' && 'Contaste el inventario físico y no coincide con el sistema.'}
              {form.type === 'MERMA' && 'Unidades perdidas: dañadas, manchadas, robadas.'}
              {form.type === 'DEVOLUCION' && 'Un cliente devolvió producto y vuelve al inventario.'}
            </p>
            <FieldError message={formErrors.type} />
          </div>

          {isAjuste ? (
            <div>
              <label className={labelClass} htmlFor="mov-newstock">Conteo real</label>
              <input
                id="mov-newstock"
                type="number"
                min="0"
                step="1"
                value={form.newStock}
                onChange={(e) => setForm((f) => ({ ...f, newStock: e.target.value }))}
                className={inputClass}
              />
              {adjusting && form.newStock !== '' && Number(form.newStock) !== adjusting.stock && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Se registrará un ajuste de{' '}
                  <span className="font-bold">
                    {Number(form.newStock) - adjusting.stock > 0 ? '+' : ''}
                    {Number(form.newStock) - adjusting.stock}
                  </span>{' '}
                  unidades.
                </p>
              )}
              <FieldError message={formErrors.newStock} />
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="mov-quantity">Unidades</label>
              <input
                id="mov-quantity"
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className={inputClass}
              />
              <FieldError message={formErrors.quantity} />
            </div>
          )}

          {form.type === 'ENTRADA' && (
            <div>
              <label className={labelClass} htmlFor="mov-cost">
                Costo por unidad <span className="normal-case font-semibold text-slate-400">(opcional)</span>
              </label>
              <input
                id="mov-cost"
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                placeholder={adjusting?.cost ? String(adjusting.cost) : '0.00'}
                className={inputClass}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Queda guardado en el historial. No cambia el costo del producto.
              </p>
              <FieldError message={formErrors.unitCost} />
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="mov-reason">
              Motivo <span className="normal-case font-semibold text-slate-400">(opcional)</span>
            </label>
            <input
              id="mov-reason"
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Ej. producción del lunes, conteo físico de fin de mes..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAdjusting(null)}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white px-4 py-2.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={movements.saving}
              className="bg-primary hover:bg-opacity-95 text-white py-2.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
            >
              {movements.saving && <span className="material-symbols-outlined text-base animate-spin">sync</span>}
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
