import { useEffect, useRef } from 'react'

/**
 * Centred dialog used for the "nuevo movimiento" / "ajustar stock" forms —
 * short forms that don't deserve a whole route.
 *
 * Handles the things that are easy to forget and annoying to hit: Escape to
 * close, focus moved into the dialog on open (and returned to whatever opened
 * it), background scroll locked, and a labelled backdrop button so closing by
 * clicking outside is reachable without a mouse.
 */
export default function Modal({ open, onClose, title, description, children, maxWidth = 'max-w-lg' }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const focusable = panelRef.current?.querySelector(
      'input, select, textarea, button:not([data-autofocus-skip])'
    )
    focusable?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        aria-label="Cerrar"
        data-autofocus-skip
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-default"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto animate-fade-in`}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-0">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="text-[11px] text-slate-400 mt-1">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            data-autofocus-skip
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white flex-shrink-0 -mt-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
