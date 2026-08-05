import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Resumen', icon: 'dashboard' },
  { to: '/productos', label: 'Productos', icon: 'inventory_2' },
  { to: '/promociones', label: 'Promociones', icon: 'sell' },
  { to: '/inventario', label: 'Inventario', icon: 'warehouse' },
  { to: '/reportes', label: 'Reportes', icon: 'monitoring' },
  { to: '/pagos', label: 'Cuenta de pago', icon: 'account_balance' },
]

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-100 dark:border-slate-800 py-6 flex-shrink-0">
        <div className="px-6 mb-8">
          <span className="font-extrabold text-lg text-slate-900 dark:text-white">Creaciones Baby</span>
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5">Panel de Vendedor</p>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-background-light dark:bg-background-dark py-6 shadow-xl animate-fade-in">
            <div className="px-6 mb-8 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">Creaciones Baby</span>
                <p className="text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5">Panel de Vendedor</p>
              </div>
              <button
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4 border-b border-slate-100 dark:border-slate-800">
          <button
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-slate-500 dark:text-slate-300"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-5xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
