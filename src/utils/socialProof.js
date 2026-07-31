// Deterministic pseudo-random viewer count: stable for a given product on a
// given day (no backend view-tracking exists), but varies by product and date.
export function getViewerCount(productId) {
  const day = new Date().toISOString().slice(0, 10)
  const str = `${productId}-${day}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return 8 + (hash % 45)
}
