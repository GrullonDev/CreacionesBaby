import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useSellerProductForm } from '../hooks/useSellerProductForm'
import ImageDropzone from '../components/ImageDropzone'

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

export default function SellerProductForm() {
  const { id } = useParams()
  const {
    isEditMode,
    loading,
    submitting,
    form,
    setField,
    errors,
    existingImages,
    newImages,
    addFiles,
    removeExistingImage,
    removeNewImage,
    handleSubmit,
    categories,
  } = useSellerProductForm(id)

  usePageTitle(isEditMode ? 'Editar Producto' : 'Añadir Producto')

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
        <Link to="/vendedor" className="text-xs text-slate-400 hover:text-primary transition-colors font-semibold flex items-center gap-1 mb-3">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver al panel
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {isEditMode ? 'Editar Producto' : 'Añadir Producto'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Sube fotos reales y describe tu producto para que aparezca en la tienda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
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
          <label className={labelClass}>Fotos del producto</label>
          <ImageDropzone
            existingImages={existingImages}
            newImages={newImages}
            onAddFiles={addFiles}
            onRemoveExisting={removeExistingImage}
            onRemoveNew={removeNewImage}
          />
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
    </main>
  )
}
