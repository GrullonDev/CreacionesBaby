const STORAGE_KEY = 'creaciones_analytics_events'
const MAX_EVENTS = 300

export function track(eventName, payload = {}) {
  try {
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    events.push({ event: eventName, payload, at: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {}

  // Forward to Google Analytics if the store owner has added their own gtag.js
  // script (see .env.example / VITE_GA_ID). No script is injected automatically.
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload)
  }
}

export function getAnalyticsSummary() {
  try {
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return events.reduce((counts, { event }) => {
      counts[event] = (counts[event] || 0) + 1
      return counts
    }, {})
  } catch {
    return {}
  }
}
