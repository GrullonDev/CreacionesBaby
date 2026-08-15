import { createContext, useState, useEffect, useCallback } from 'react'
import api, { getStoredToken, setStoredToken } from '../services/api'
import { extractApiError } from '../utils/apiError'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Starts true whenever a token is already stored, so ProtectedRoute waits
  // for the /auth/me check instead of bouncing straight to /login on refresh.
  const [loading, setLoading] = useState(Boolean(getStoredToken()))
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        setStoredToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.user.role !== 'SELLER' && res.data.user.role !== 'ADMIN') {
        throw new Error('Esta cuenta no tiene permisos de vendedor.')
      }
      setStoredToken(res.data.token)
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'No se pudo iniciar sesión.'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    setError(null)
    try {
      const res = await api.post('/auth/register', { name, email, password, role: 'SELLER' })
      setStoredToken(res.data.token)
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      const message = extractApiError(err, 'No se pudo crear la cuenta.')
      setError(message)
      throw new Error(message)
    }
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, error, isAuthenticated: Boolean(user), login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
