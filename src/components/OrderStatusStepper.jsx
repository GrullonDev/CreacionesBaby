const STEPS = [
  { key: 'confirmed', label: 'Confirmado', icon: 'check_circle', afterDays: 0 },
  { key: 'preparing', label: 'Preparando', icon: 'inventory_2', afterDays: 1 },
  { key: 'shipped', label: 'Enviado', icon: 'local_shipping', afterDays: 2 },
  { key: 'delivered', label: 'Entregado', icon: 'home', afterDays: 4 },
]

export default function OrderStatusStepper({ orderDate }) {
  const elapsedDays = (Date.now() - new Date(orderDate).getTime()) / (1000 * 60 * 60 * 24)
  const currentIndex = STEPS.reduce((acc, step, i) => (elapsedDays >= step.afterDays ? i : acc), 0)

  return (
    <div className="flex items-start w-full max-w-sm">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
            <div
              className={`size-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                i <= currentIndex
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{step.icon}</span>
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${
                i <= currentIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 -mt-4 ${i < currentIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
