import { NavLink, Link, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../context/useAdminAuth'

/**
 * Chrome for the storefront's back office.
 *
 * Deliberately different from the seller portal's sidebar shell: this surface
 * exists to be used on a phone at a fair or right after a WhatsApp sale, so
 * navigation is a bottom tab bar on small screens and the primary action —
 * registering a sale — is always one tap away. Deeper catalog work stays in the
 * portal, which this links out to.
 */
const TABS = [
  { to: '/admin', label: 'Ventas', icon: 'point_of_sale', end: true },
  { to: '/admin/finanzas', label: 'Gastos', icon: 'account_balance_wallet' },
  { to: '/admin/reportes', label: 'Reportes', icon: 'monitoring' },
]

export default function AdminLayout() {
  const { user, logout } = useAdminAuth()

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-lg">child_care</span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                Creaciones Baby
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold">Administración</span>
            </span>
          </Link>

          {/* Desktop tabs; on mobile these live in the bottom bar instead. */}
          <nav className="hidden sm:flex items-center gap-1 ml-6">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-slate-900 dark:text-white dark:bg-primary/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="hidden md:block text-[11px] text-slate-400 truncate max-w-[10rem]">
              {user?.name}
            </span>
            <Link
              to="/"
              title="Ver la tienda"
              aria-label="Ver la tienda"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">storefront</span>
            </Link>
            <button
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-10">
        <Outlet />
      </main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800">
        <div className="flex">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
