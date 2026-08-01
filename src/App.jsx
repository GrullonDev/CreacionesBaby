import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import ReferralWelcome from './components/ReferralWelcome'
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

function RouteFallback() {
  return (
    <div className="flex-grow flex items-center justify-center py-20">
      <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <ReferralWelcome />
            <Header />
            <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/streaming" element={<Streaming />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Footer />
            <WhatsAppButton />
            <NewsletterPopup />
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
