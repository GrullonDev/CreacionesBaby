import { useRef } from 'react'

export default function ImageDropzone({ existingImages, newImages, onAddFiles, onRemoveExisting, onRemoveNew }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    if (e.target.files?.length) onAddFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) onAddFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-3xl text-slate-300">add_photo_alternate</span>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
          Arrastra fotos aquí o haz clic para elegir
        </span>
        <span className="text-[10px] text-slate-400">JPG, PNG o WEBP</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </button>

      {(existingImages.length > 0 || newImages.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {existingImages.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveExisting(img.id)}
                className="absolute top-1 right-1 size-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Quitar foto"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
          {newImages.map((img) => (
            <div key={img.key} className="relative aspect-square rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group">
              <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveNew(img.key)}
                className="absolute top-1 right-1 size-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Quitar foto"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
