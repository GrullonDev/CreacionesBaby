import { usePageTitle } from '../hooks/usePageTitle'
import ComingSoon from '../components/ComingSoon'

export default function Payments() {
  usePageTitle('Cuenta de pago')
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Cuenta de pago</h1>
        <p className="text-xs text-slate-400 mt-1">Define a qué cuenta quieres que lleguen tus transacciones</p>
      </div>
      <ComingSoon
        icon="account_balance"
        title="Configura tu cuenta de cobro"
        description="Esta sección todavía no está conectada al backend — falta guardar los datos bancarios de forma segura en el modelo de vendedor. No la habilites hasta entonces: mostrar un formulario que no guarda nada sería confuso."
        plannedFeatures={[
          'Banco, tipo y número de cuenta donde recibir tus pagos',
          'Verificación del titular de la cuenta',
          'Historial de depósitos realizados por cada pedido pagado',
        ]}
      />
    </div>
  )
}
