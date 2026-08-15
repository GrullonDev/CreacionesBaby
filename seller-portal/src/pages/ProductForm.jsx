import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProductForm } from '../hooks/useProductForm'
import { formatCurrency } from '../utils/currency'

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
  { id: 'info', label: '1. Info Básica', fields: ['name', 'description', 'category'] },
  { id: 'inventario', label: '2. Inventario & Precio', fields: ['price', 'cost', 'stock'] },
  { id: 'multimedia', label: '3. Multimedia', fields: ['images'] },
]

export default function ProductForm() {
  const { id } = useParams()
  const {
    isEditMode,
    loading,
    submitting,
    form,
    setField,
    errors,
    images,
    setImageAt,
    addImageField,
    removeImageAt,
    handleSubmit,
    categories,
  } = useProductForm(id)

  usePageTitle(isEditMode ? 'Editar producto' : 'Añadir producto')

  const [activeTab, setActiveTab] = useState('info')

  /** Per-unit margin, shown live so the price/cost pair can be sanity-checked
   *  here instead of on the reports page a month later. */
  const margin = useMemo(() => {
    const price = Number(form.price)
    const cost = Number(form.cost)
    if (!(price > 0) || form.cost === '' || !(cost >= 0) || cost > price) return null
    return {
      profit: formatCurrency(price - cost),
      pct: (((price - cost) / price) * 100).toFixed(1),
    }
  }, [form.price, form.cost])

  // If a submit attempt left errors on fields outside the active tab, jump to
  // the first tab that has one so the user actually sees what's wrong.
  useEffect(() => {
    const errorFields = Object.keys(errors)
    if (errorFields.length === 0) return
    const tabWithError = TABS.find((tab) => tab.fields.some((f) => errorFields.includes(f)))
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
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Link to="/productos" className="hover:text-primary transition-colors">Productos</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-200">
            {isEditMode ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </span>
        </div>
        <button
          type="submit"
          form="product-form"
          disabled={submitting}
          className="bg-primary hover:bg-opacity-95 text-white py-2.5 px-6 rounded-full font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2"
        >
          {submitting && <span className="material-symbols-outlined text-base animate-spin">sync</span>}
          {isEditMode ? 'Guardar' : 'Publicar'}
        </button>
      </div>

      {/* Tabs */}
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

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Tab 1 */}
          <div className={activeTab === 'info' ? 'space-y-6' : 'hidden'}>
            <div>
              <label className={labelClass} htmlFor="name">Título del producto</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ej. Mantita de algodón orgánico"
                className={inputClass}
              />
              <FieldError message={errors.name} />
            </div>

            <div>
              <label className={labelClass} htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={5}
                placeholder="Describe los materiales, tamaño y beneficios del producto..."
                className={`${inputClass} resize-none`}
              />
              <FieldError message={errors.description} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="category">Categoría</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <FieldError message={errors.category} />
              </div>

              <div>
                <label className={labelClass} htmlFor="brand">Marca (opcional)</label>
                <input
                  id="brand"
                  type="text"
                  value={form.brand}
                  onChange={(e) => setField('brand', e.target.value)}
                  placeholder="Ej. Creaciones Baby"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Tab 2 */}
          <div className={activeTab === 'inventario' ? 'space-y-6' : 'hidden'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="price">Precio de venta (GTQ)</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
                <FieldError message={errors.price} />
              </div>

              <div>
                <label className={labelClass} htmlFor="cost">
                  Costo por unidad (GTQ){' '}
                  <span className="normal-case font-semibold text-slate-400">(opcional)</span>
                </label>
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) => setField('cost', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
                {/* Without this, reports can only show revenue — margin needs it. */}
                <p className="text-[11px] text-slate-400 mt-1">
                  Lo que te cuesta producir o comprar una unidad. Sin este dato, los reportes no pueden calcular
                  tu ganancia real. Nunca se muestra a los clientes.
                </p>
                <FieldError message={errors.cost} />
              </div>
            </div>

            {margin && (
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ganas <span className="font-extrabold text-slate-900 dark:text-white">{margin.profit}</span> por
                  unidad, un margen de{' '}
                  <span className="font-extrabold text-slate-900 dark:text-white">{margin.pct}%</span>.
                </p>
              </div>
            )}

            <div className="sm:w-1/2">
              <label className={labelClass} htmlFor="stock">Inventario disponible</label>
              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setField('stock', e.target.value)}
                placeholder="0"
                className={inputClass}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isEditMode
                  ? 'Cambiarlo aquí queda registrado como un ajuste en el historial de inventario.'
                  : 'Se registra como tu stock inicial en el historial de inventario.'}
              </p>
              <FieldError message={errors.stock} />
            </div>
          </div>

          {/* Tab 3 */}
          <div className={activeTab === 'multimedia' ? '' : 'hidden'}>
            <label className={labelClass}>Fotos del producto (URL)</label>
            <p className="text-[11px] text-slate-400 mb-3 -mt-1">
              La subida de archivos aún no está disponible — pega la URL de cada imagen (deben empezar con http:// o https://).
            </p>
            <div className="space-y-2">
              {images.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setImageAt(i, e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeImageAt(i)}
                    aria-label="Quitar imagen"
                    className="p-2.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImageField}
              className="text-xs font-bold text-primary hover:underline mt-2 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Añadir otra imagen
            </button>
            <FieldError message={errors.images} />
          </div>
        </div>
      </form>
    </div>
  )
}
