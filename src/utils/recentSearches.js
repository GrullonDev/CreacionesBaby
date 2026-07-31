const KEY = 'creaciones_recent_searches'
const MAX_ITEMS = 5

export function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function addRecentSearch(term) {
  try {
    const value = term.trim()
    if (!value) return
    const existing = getRecentSearches().filter((t) => t.toLowerCase() !== value.toLowerCase())
    existing.unshift(value)
    localStorage.setItem(KEY, JSON.stringify(existing.slice(0, MAX_ITEMS)))
  } catch {}
}
