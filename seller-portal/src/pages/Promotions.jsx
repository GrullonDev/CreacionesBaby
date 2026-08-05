import { usePageTitle } from '../hooks/usePageTitle'
import ComingSoon from '../components/ComingSoon'

export default function Promotions() {
  usePageTitle('Promociones')
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Promociones</h1>
        <p className="text-xs text-slate-400 mt-1">Crea descuentos y ofertas para tus productos</p>
      </div>
      <ComingSoon
        icon="sell"
        title="Crea tus primeras promociones"
        description="Esta sección todavía no está conectada al backend — falta el modelo de promociones y las rutas de la API. Cuando esté lista, podrás crear descuentos y campañas desde aquí."
        plannedFeatures={[
          'Descuentos por porcentaje o monto fijo, por producto o categoría',
          'Códigos de cupón con fecha de inicio/fin',
          'Promociones automáticas (ej. envío gratis desde cierto monto)',
        ]}
      />
    </div>
  )
}
