import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/useAdminAuth'

/**
 * Gate for everything under `/admin`. Requires a signed-in SELLER or ADMIN — the
 * role check itself lives in AdminAuthContext, which refuses to hydrate a plain
 * customer token, and the API re-checks on every request regardless.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}
