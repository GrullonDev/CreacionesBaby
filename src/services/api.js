import axios from 'axios'

/**
 * Token used by the role-gated `/admin` area only.
 *
 * The storefront itself has no customer accounts — browsing and guest checkout
 * are unauthenticated. This exists so the back-office screens under `/admin` can
 * reach the protected endpoints (`/sales`, `/finance-entries`,
 * `/reports/summary`) from the same app.
 */
const ADMIN_TOKEN_KEY = 'creaciones_admin_token'

export function getStoredAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setStoredAdminToken(token) {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
    else localStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {
    /* ignore storage failures (private browsing, etc.) */
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the admin token when one is stored. Harmless for the public product and
// category endpoints — they ignore it — and `POST /orders` already treats a token
// as optional, so guest checkout is unaffected either way.
api.interceptors.request.use((config) => {
  const token = getStoredAdminToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!import.meta.env.VITE_API_URL) {
      return Promise.reject(new Error('No API URL configured. Set VITE_API_URL or use fallback data.'))
    }
    // An expired session shouldn't leave a dead token attached to every later
    // request, including the public ones.
    if (error.response?.status === 401 && getStoredAdminToken()) {
      setStoredAdminToken(null)
    }
    return Promise.reject(error)
  }
)

export default api
