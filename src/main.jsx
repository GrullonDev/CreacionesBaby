import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getAnalyticsSummary } from './utils/analytics'

// Quick local visibility into tracked events: run __creacionesAnalytics() in
// the browser console. No dashboard yet since there's no backend to serve one.
if (typeof window !== 'undefined') {
  window.__creacionesAnalytics = getAnalyticsSummary
}

// Registered only in production builds to avoid caching issues with Vite's dev server/HMR.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
