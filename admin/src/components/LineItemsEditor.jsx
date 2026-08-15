import { useState, useMemo, useRef, useEffect } from 'react'
import { formatCurrency } from '../utils/currency'

const inputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none'

/**
 * Type-to-search product picker.
 *
 * A plain <select> is unusable once the catalog passes a couple of dozen items,
 * and a <datalist> can't map a typed label back to an id reliably (two products
 * can share a name). So: filtered listbox, keyboard-navigable, selection is
 * always by id.
 */
function ProductPicker({ products, value, onChange, error, autoFocus }) {
  const selected = products.find((p) => p.id === value)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef(null)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products
    return pool.slice(0, 8)
  }, [products, query])

  useEffect(() => {
    if (!open) return undefined
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function pick(product) {
    onChange(product)
    setQuery('')
    setOpen(false)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && open && matches[highlight]) {
      // Don't let Enter submit the whole sale while the user is picking.
      e.preventDefault()
      pick(matches[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          {selected.image && <img src={selected.image} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="min-w-0 flex-grow">
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{selected.name}</p>
          <p className="text-[10px] text-slate-400">
            {formatCurrency(selected.price)} · {selected.stock} en stock
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[11px] font-bold text-primary hover:underline flex-shrink-0"
        >
          Cambiar
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={wrapRef}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="product-picker-list"
        aria-label="Buscar producto"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setHighlight(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={products.length === 0 ? 'No tienes productos todavía' : 'Buscar producto...'}
        disabled={products.length === 0}
        className={`${inputClass} ${error ? 'border-red-400' : ''}`}
      />
      {open && matches.length > 0 && (
        <ul
          id="product-picker-list"
          role="listbox"
          className="absolute z-20 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
        >
          {matches.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(p)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                  i === highlight ? 'bg-primary/10' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="min-w-0 flex-grow">
                  <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">{p.name}</span>
                  <span className="block text-[10px] text-slate-400">
                    {formatCurrency(p.price)} · {p.stock} disp.
                  </span>
                </span>
                {p.stock === 0 && (
                  <span className="text-[10px] font-bold text-red-500 flex-shrink-0">Agotado</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && matches.length === 0 && (
        <p className="absolute z-20 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-400">
          Ningún producto coincide con “{query.trim()}”.
        </p>
      )}
    </div>
  )
}

/**
 * The repeatable product lines of a sale.
 *
 * Each row shows the unit price prefilled from the catalog but editable (real
 * sales get negotiated), the running line subtotal, and an inline warning when
 * the requested quantity exceeds what's actually in stock — counting *all* lines
 * of that product, since the same item can legitimately appear twice with
 * different colours.
 */
export default function LineItemsEditor({ lines, products, errors = {}, onChange }) {
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const requestedPerProduct = useMemo(() => {
    const map = new Map()
    for (const line of lines) {
      if (!line.productId) continue
      map.set(line.productId, (map.get(line.productId) || 0) + (Number(line.quantity) || 0))
    }
    return map
  }, [lines])

  const setLine = (index, patch) =>
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)))

  const addLine = () =>
    onChange([...lines, { key: `l${Date.now()}`, productId: '', quantity: '1', unitPrice: '', selectedColor: '', selectedSize: '' }])

  const removeLine = (index) =>
    onChange(lines.length > 1 ? lines.filter((_, i) => i !== index) : lines)

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const product = byId.get(line.productId)
        const quantity = Number(line.quantity) || 0
        const unitPrice = line.unitPrice === '' ? product?.price ?? 0 : Number(line.unitPrice) || 0
        const subtotal = quantity * unitPrice
        const requested = requestedPerProduct.get(line.productId) || 0
        const oversold = product && requested > product.stock
        const negotiated = product && line.unitPrice !== '' && Number(line.unitPrice) !== product.price

        return (
          <div
            key={line.key}
            className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-grow min-w-0">
                <ProductPicker
                  products={products}
                  value={line.productId}
                  error={errors[`line-${index}-product`]}
                  autoFocus={index > 0 && !line.productId}
                  onChange={(product) =>
                    setLine(index, {
                      productId: product?.id || '',
                      // Prefill the catalog price on pick so the common case is
                      // zero typing, but leave it editable.
                      unitPrice: product ? String(product.price) : '',
                    })
                  }
                />
              </div>
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  aria-label={`Quitar línea ${index + 1}`}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cantidad
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={line.quantity}
                  onChange={(e) => setLine(index, { quantity: e.target.value })}
                  className={`${inputClass} mt-1 ${oversold ? 'border-red-400' : ''}`}
                />
              </label>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Precio unitario
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) => setLine(index, { unitPrice: e.target.value })}
                  placeholder={product ? String(product.price) : '0.00'}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Color <span className="normal-case font-semibold text-slate-400">(opcional)</span>
                <input
                  type="text"
                  value={line.selectedColor}
                  onChange={(e) => setLine(index, { selectedColor: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Talla <span className="normal-case font-semibold text-slate-400">(opcional)</span>
                <input
                  type="text"
                  value={line.selectedSize}
                  onChange={(e) => setLine(index, { selectedSize: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[11px] space-y-0.5">
                {oversold && (
                  <p className="font-bold text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    Solo hay {product.stock} en stock
                    {requested !== quantity && ` (esta venta pide ${requested} en total)`}
                  </p>
                )}
                {negotiated && !oversold && (
                  <p className="text-slate-400">
                    Precio de catálogo {formatCurrency(product.price)} — estás usando otro precio.
                  </p>
                )}
                {errors[`line-${index}-product`] && (
                  <p className="font-bold text-red-500">{errors[`line-${index}-product`]}</p>
                )}
                {errors[`line-${index}-quantity`] && (
                  <p className="font-bold text-red-500">{errors[`line-${index}-quantity`]}</p>
                )}
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white ml-auto">
                {formatCurrency(subtotal)}
              </p>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={addLine}
        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Añadir otro producto
      </button>

      {errors.items && (
        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {errors.items}
        </p>
      )}
    </div>
  )
}
