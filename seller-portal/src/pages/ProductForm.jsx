import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProductForm } from '../hooks/useProductForm'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <Link
          to="/productos"
          className="text-xs text-slate-400 hover:text-primary transition-colors font-semibold flex items-center gap-1 mb-3"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver a productos
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isEditMode ? 'Editar producto' : 'Añadir producto'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
      >
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
            rows={4}
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

          <div>
            <label className={labelClass} htmlFor="price">Precio (GTQ)</label>
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
            <FieldError message={errors.stock} />
          </div>
        </div>

        <div>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-opacity-95 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
        >
          {submitting && <span className="material-symbols-outlined text-lg animate-spin">sync</span>}
          {isEditMode ? 'Guardar cambios' : 'Publicar producto'}
        </button>
      </form>
    </div>
  )
}
