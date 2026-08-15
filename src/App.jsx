import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import ReferralWelcome from './components/ReferralWelcome'
import AdminRoute from './components/AdminRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import NewsletterPopup from './components/NewsletterPopup'
import Home from './pages/Home'

const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Account = lazy(() => import('./pages/Account'))
const Orders = lazy(() => import('./pages/Orders'))
const Streaming = lazy(() => import('./pages/Streaming'))
const CustomerService = lazy(() => import('./pages/CustomerService'))
const Legal = lazy(() => import('./pages/Legal'))

// Back office. Lazy-loaded like everything else, which also means a customer who
// never visits /admin never downloads any of it.
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminSales = lazy(() => import('./pages/admin/AdminSales'))
const AdminSaleForm = lazy(() => import('./pages/admin/AdminSaleForm'))
const AdminFinance = lazy(() => import('./pages/admin/AdminFinance'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))

function RouteFallback() {
  return (
    <div className="flex-grow flex items-center justify-center py-20">
      <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
    </div>
  )
}

/**
 * The customer-facing shell: header, footer, WhatsApp button, newsletter popup.
 *
 * It's a layout route rather than markup around <Routes> so the `/admin` screens
 * can render without any of it — a back office with a shop header and a "suscríbete
 * al newsletter" popup over it would be absurd.
 */
function StorefrontChrome() {
  return (
    <>
      <ReferralWelcome />
      <Header />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <WhatsAppButton />
      <NewsletterPopup />
    </>
  )
}

function AdminShell() {
  return (
    <AdminAuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </AdminAuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Back office — role-gated, no storefront chrome */}
              <Route element={<AdminShell />}>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminSales />} />
                  <Route path="ventas/nueva" element={<AdminSaleForm />} />
                  <Route path="ventas/:id/editar" element={<AdminSaleForm />} />
                  <Route path="finanzas" element={<AdminFinance />} />
                  <Route path="reportes" element={<AdminReports />} />
                </Route>
              </Route>

              {/* The old client-only seller module (localStorage + IndexedDB) is
                  superseded by seller-portal/ and by /admin, both backed by the
                  real API. Redirect rather than 404 so old bookmarks still land
                  somewhere useful. */}
              <Route path="/vendedor" element={<Navigate to="/admin" replace />} />
              <Route path="/vendedor/nuevo" element={<Navigate to="/admin" replace />} />
              <Route path="/vendedor/:id/editar" element={<Navigate to="/admin" replace />} />

              {/* Storefront */}
              <Route element={<StorefrontChrome />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/streaming" element={<Streaming />} />
                <Route path="/atencion-al-cliente" element={<CustomerService />} />
                <Route path="/atencion-al-cliente/:slug" element={<CustomerService />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/legal/:slug" element={<Legal />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
