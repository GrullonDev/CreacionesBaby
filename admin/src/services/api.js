import axios from 'axios'

const TOKEN_STORAGE_KEY = 'creaciones_seller_token'

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null
  } catch {
    return null
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
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

// Attach the seller's JWT to every request, if we have one.
api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Centralize the "no backend configured" and "session expired" cases so pages
// don't each need their own boilerplate for them.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!import.meta.env.VITE_API_URL) {
      return Promise.reject(new Error('No hay VITE_API_URL configurado. Copia .env.example a .env.'))
    }
    if (error.response?.status === 401) {
      setStoredToken(null)
    }
    return Promise.reject(error)
  }
)

export default api
