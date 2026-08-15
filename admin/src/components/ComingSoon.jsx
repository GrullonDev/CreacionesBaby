export default function ComingSoon({ icon, title, description, plannedFeatures = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
        Próximamente
      </span>
      <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">{title}</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{description}</p>

      {plannedFeatures.length > 0 && (
        <ul className="text-left text-xs text-slate-500 dark:text-slate-400 mt-6 space-y-2 max-w-sm mx-auto">
          {plannedFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-primary/60 mt-0.5">check</span>
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
