import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const ProductForm = lazy(() => import('./pages/ProductForm'))
const Promotions = lazy(() => import('./pages/Promotions'))
const Sales = lazy(() => import('./pages/Sales'))
const SaleForm = lazy(() => import('./pages/SaleForm'))
const Finance = lazy(() => import('./pages/Finance'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Reports = lazy(() => import('./pages/Reports'))
const Payments = lazy(() => import('./pages/Payments'))
const Configuracion = lazy(() => import('./pages/Configuracion'))

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
    </div>
  )
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<RouteFallback />}>{children}</Suspense>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/productos" element={<Protected><Products /></Protected>} />
              <Route path="/productos/nuevo" element={<Protected><ProductForm /></Protected>} />
              <Route path="/productos/:id/editar" element={<Protected><ProductForm /></Protected>} />
              <Route path="/ventas" element={<Protected><Sales /></Protected>} />
              <Route path="/ventas/nueva" element={<Protected><SaleForm /></Protected>} />
              <Route path="/ventas/:id/editar" element={<Protected><SaleForm /></Protected>} />
              <Route path="/finanzas" element={<Protected><Finance /></Protected>} />
              <Route path="/promociones" element={<Protected><Promotions /></Protected>} />
              <Route path="/inventario" element={<Protected><Inventory /></Protected>} />
              <Route path="/reportes" element={<Protected><Reports /></Protected>} />
              <Route path="/pagos" element={<Protected><Payments /></Protected>} />
              <Route path="/configuracion" element={<Protected><Configuracion /></Protected>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
