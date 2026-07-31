export default function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col h-full animate-pulse">
      <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-3.5 w-4/5 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
          <div className="h-4 w-14 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
