import { getViewerCount } from '../utils/socialProof'

export default function ViewerBadge({ productId }) {
  const count = getViewerCount(productId)
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
      <span className="material-symbols-outlined text-sm">visibility</span>
      {count} personas vieron esto hoy
    </span>
  )
}
