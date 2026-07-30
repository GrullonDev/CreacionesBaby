import { useState } from 'react'

export default function ImageCarousel({ images, alt }) {
  const [selected, setSelected] = useState(0)

  if (!images || images.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative aspect-[4/5] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <img
          src={images[selected]}
          alt={`${alt} — vista ${selected + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
          draggable={false}
        />
        {images.length > 1 && (
          <>
            {/* Prev Arrow */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-md hover:bg-primary hover:text-white transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
              onClick={() => setSelected((s) => (s === 0 ? images.length - 1 : s - 1))}
              aria-label="Imagen anterior"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {/* Next Arrow */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-md hover:bg-primary hover:text-white transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
              onClick={() => setSelected((s) => (s === images.length - 1 ? 0 : s + 1))}
              aria-label="Imagen siguiente"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-1">
          {images.map((src, i) => (
            <button
              key={i}
              className={`aspect-square w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                i === selected 
                  ? 'border-primary shadow-sm scale-95' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-primary/50'
              }`}
              onClick={() => setSelected(i)}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <img 
                src={src} 
                alt={`${alt} miniatura ${i + 1}`} 
                loading="lazy" 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
