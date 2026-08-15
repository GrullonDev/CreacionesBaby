import { createContext, useState, useEffect, useCallback } from 'react'
import api, { getStoredAdminToken, setStoredAdminToken } from '../services/api'
import { extractApiError } from '../utils/apiError'

const AdminAuthContext = createContext()

/**
 * Auth for the `/admin` back office inside the storefront app.
 *
 * Same shape as the seller portal's AuthContext, with two deliberate
 * differences: it has no `register` (an admin account is created with
 * `npm run seed:admin` or through the portal, never from the shop's front door),
 * and it only ever wraps the `/admin` routes — the public storefront renders
 * without it and stays fully anonymous.
 */
export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Starts true when a token is already stored so AdminRoute waits for the
  // /auth/me check instead of bouncing to the login screen on a refresh.
  const [loading, setLoading] = useState(Boolean(getStoredAdminToken()))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!getStoredAdminToken()) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => {
        // A token for a plain customer account must not open the back office.
        if (res.data.role === 'SELLER' || res.data.role === 'ADMIN') setUser(res.data)
        else setStoredAdminToken(null)
      })
      .catch(() => {
        setStoredAdminToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.user.role !== 'SELLER' && res.data.user.role !== 'ADMIN') {
        throw new Error('Esta cuenta no tiene permisos para el panel de administración.')
      }
      setStoredAdminToken(res.data.token)
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      const message = extractApiError(err, 'No se pudo iniciar sesión.')
      setError(message)
      throw new Error(message)
    }
  }, [])

  const logout = useCallback(() => {
    setStoredAdminToken(null)
    setUser(null)
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, error, isAuthenticated: Boolean(user), login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export { AdminAuthContext }
