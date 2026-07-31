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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
