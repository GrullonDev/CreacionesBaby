export default function Rating({ value, reviews }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`material-symbols-outlined text-sm ${
              star <= Math.round(value) 
                ? 'text-amber-400 fill-current' 
                : 'text-slate-200 dark:text-slate-700'
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        ))}
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">{value}</span>
      {reviews && (
        <span className="text-[10px] text-slate-400">({reviews} opiniones)</span>
      )}
    </div>
  )
}
