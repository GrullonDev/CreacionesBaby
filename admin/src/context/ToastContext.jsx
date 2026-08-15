import { createContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext()

const TOAST_THEME = {
  success: { icon: 'check_circle', iconClass: 'text-emerald-500', barClass: 'bg-emerald-500' },
  info: { icon: 'info', iconClass: 'text-sky-500', barClass: 'bg-sky-500' },
  warning: { icon: 'warning', iconClass: 'text-amber-500', barClass: 'bg-amber-500' },
  error: { icon: 'error', iconClass: 'text-red-500', barClass: 'bg-red-500' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete timers.current[id]
    }, duration)
    return id
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}

      <div
        className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2.5 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const theme = TOAST_THEME[t.type] || TOAST_THEME.success
          return (
            <div
              key={t.id}
              role="status"
              onClick={() => dismissToast(t.id)}
              className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl pl-4 pr-3 py-3 shadow-xl shadow-slate-900/10 animate-slide-up max-w-sm cursor-pointer overflow-hidden relative"
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${theme.barClass}`}></span>
              <span className={`material-symbols-outlined text-lg flex-shrink-0 ${theme.iconClass}`}>
                {theme.icon}
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">{t.message}</p>
              <span className="material-symbols-outlined text-base text-slate-300 hover:text-slate-500 flex-shrink-0">
                close
              </span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastContext }
