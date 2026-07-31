const KEY = 'creaciones_recently_viewed'
const MAX_ITEMS = 8

export function recordProductView(productId) {
  try {
    const existing = getRecentlyViewedIds().filter((id) => id !== productId)
    existing.unshift(productId)
    localStorage.setItem(KEY, JSON.stringify(existing.slice(0, MAX_ITEMS)))
  } catch {}
}

export function getRecentlyViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}
