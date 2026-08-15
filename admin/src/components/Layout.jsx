import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/ventas', label: 'Ventas', icon: 'point_of_sale' },
  { to: '/finanzas', label: 'Finanzas', icon: 'account_balance_wallet' },
  { to: '/inventario', label: 'Inventario', icon: 'warehouse' },
  { to: '/productos', label: 'Productos', icon: 'inventory_2' },
  { to: '/reportes', label: 'Reportes', icon: 'monitoring' },
  { to: '/promociones', label: 'Promociones', icon: 'sell' },
  { to: '/configuracion', label: 'Configuración', icon: 'settings' },
  { to: '/pagos', label: 'Cuenta de pago', icon: 'account_balance' },
]

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-xl">child_care</span>
      </span>
      <div className="min-w-0">
        <span className="font-extrabold text-base text-slate-900 dark:text-white block leading-tight">Creaciones Baby</span>
        <span className="text-[10px] text-slate-400 font-semibold block">Panel de Control</span>
      </div>
    </div>
  )
}

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
                ? 'bg-primary/10 text-slate-900 dark:text-white dark:bg-primary/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined text-xl ${isActive ? 'text-primary' : ''}`}>
                {item.icon}
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function ProfileCard({ user }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">
        {user?.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">{user?.name}</p>
        <p className="text-[10px] text-slate-400 leading-tight truncate">{user?.email}</p>
      </div>
    </div>
  )
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificaciones"
        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
      >
        <span className="material-symbols-outlined">notifications</span>
      </button>
      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Cerrar notificaciones"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg p-4 z-50 animate-fade-in">
            <p className="text-xs font-bold text-slate-800 dark:text-white mb-1">Notificaciones</p>
            <p className="text-[11px] text-slate-400">No tienes notificaciones nuevas por ahora.</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-100 dark:border-slate-800 py-6 flex-shrink-0">
        <div className="px-6 mb-8">
          <Logo />
        </div>
        <div className="flex-1">
          <NavLinks />
        </div>
        <div className="px-3 pt-4 border-t border-slate-100 dark:border-slate-800 mx-3">
          <div className="pt-4">
            <ProfileCard user={user} />
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-background-light dark:bg-background-dark py-6 shadow-xl animate-fade-in flex flex-col">
            <div className="px-6 mb-8 flex items-center justify-between gap-3">
              <Logo />
              <button
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white flex-shrink-0"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="px-3 pt-4 border-t border-slate-100 dark:border-slate-800 mx-3">
              <ProfileCard user={user} />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-xs font-bold text-slate-400 hover:text-red-500"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 sm:px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm sticky top-0 z-30">
          <button
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-slate-500 dark:text-slate-300"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              aria-label="Búsqueda general (próximamente)"
              title="Búsqueda general — próximamente"
              className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm pl-10 pr-3 py-2.5 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </div>
          <div className="flex-1 sm:hidden" />

          <div className="flex items-center gap-4 flex-shrink-0">
            <NotificationBell />
            <Link
              to="/configuracion"
              aria-label="Configuración"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
            </Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0 ring-2 ring-white dark:ring-slate-900 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
