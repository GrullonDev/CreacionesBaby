import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/useAuth'
import ComingSoon from '../components/ComingSoon'

const ROLE_LABEL = { SELLER: 'Vendedor', ADMIN: 'Administrador', USER: 'Usuario' }

export default function Configuracion() {
  usePageTitle('Configuración')
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-xs text-slate-400 mt-1">Datos de tu cuenta</p>
      </div>

      {/* Real account data — read-only for now, see ComingSoon below */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center font-extrabold text-xl flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mt-1">
              {ROLE_LABEL[user?.role] || user?.role}
            </span>
          </div>
        </div>

        <dl className="space-y-4 text-sm border-t border-slate-100 dark:border-slate-800 pt-5">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400 font-semibold">Correo electrónico</dt>
            <dd className="text-slate-800 dark:text-slate-200 font-bold truncate">{user?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400 font-semibold">ID de cuenta</dt>
            <dd className="text-slate-800 dark:text-slate-200 font-mono text-xs truncate">{user?.id}</dd>
          </div>
        </dl>
      </div>

      <ComingSoon
        icon="settings"
        title="Editar tu cuenta"
        description="Cambiar tu nombre, correo o contraseña desde aquí todavía no es posible — el backend no tiene una ruta para actualizar el perfil (solo login/registro/lectura)."
        plannedFeatures={[
          'Cambiar contraseña',
          'Actualizar nombre o correo',
          'Preferencias de notificaciones',
        ]}
      />
    </div>
  )
}
