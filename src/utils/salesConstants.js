/**
 * Spanish labels + presentation metadata for the backend's sales/finance enums.
 *
 * Kept in one module so a channel or category is spelled and coloured the same
 * on the sales list, the entry form, the ledger and the reports page. The `id`
 * values must match the Prisma enums in backend/prisma/schema.prisma exactly.
 */

export const SALE_CHANNELS = [
  { id: 'PRESENCIAL', label: 'Presencial', icon: 'storefront' },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: 'chat' },
  { id: 'REDES', label: 'Redes sociales', icon: 'thumb_up' },
  { id: 'FERIA', label: 'Feria / bazar', icon: 'celebration' },
  { id: 'WEB', label: 'Tienda en línea', icon: 'language' },
  { id: 'OTRO', label: 'Otro', icon: 'more_horiz' },
]

export const PAYMENT_METHODS = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: 'payments' },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: 'account_balance' },
  { id: 'TARJETA', label: 'Tarjeta', icon: 'credit_card' },
  { id: 'CONTRA_ENTREGA', label: 'Contra entrega', icon: 'local_shipping' },
  { id: 'OTRO', label: 'Otro', icon: 'more_horiz' },
]

export const SALE_STATUSES = [
  { id: 'PENDING', label: 'Pendiente', tone: 'amber' },
  { id: 'PAID', label: 'Pagada', tone: 'emerald' },
  { id: 'SHIPPED', label: 'Enviada', tone: 'sky' },
  { id: 'DELIVERED', label: 'Entregada', tone: 'emerald' },
  { id: 'CANCELLED', label: 'Cancelada', tone: 'red' },
]

export const MOVEMENT_TYPES = [
  { id: 'ENTRADA', label: 'Entrada', tone: 'emerald', icon: 'add_box', sign: '+' },
  { id: 'VENTA', label: 'Venta', tone: 'sky', icon: 'point_of_sale', sign: '−' },
  { id: 'SALIDA', label: 'Salida', tone: 'amber', icon: 'indeterminate_check_box', sign: '−' },
  { id: 'DEVOLUCION', label: 'Devolución', tone: 'emerald', icon: 'undo', sign: '+' },
  { id: 'AJUSTE', label: 'Ajuste', tone: 'slate', icon: 'tune', sign: '±' },
  { id: 'MERMA', label: 'Merma', tone: 'red', icon: 'delete_sweep', sign: '−' },
]

/** Types a person can record by hand — VENTA is written only by a sale. */
export const MANUAL_MOVEMENT_TYPES = MOVEMENT_TYPES.filter((t) => t.id !== 'VENTA')

export const EXPENSE_CATEGORIES = [
  { id: 'MATERIA_PRIMA', label: 'Materia prima' },
  { id: 'INVENTARIO', label: 'Compra de inventario' },
  { id: 'ENVIO', label: 'Envíos y fletes' },
  { id: 'EMPAQUE', label: 'Empaque' },
  { id: 'PUBLICIDAD', label: 'Publicidad' },
  { id: 'SERVICIOS', label: 'Servicios (luz, agua, internet)' },
  { id: 'RENTA', label: 'Renta' },
  { id: 'SALARIOS', label: 'Salarios' },
  { id: 'COMISIONES', label: 'Comisiones' },
  { id: 'IMPUESTOS', label: 'Impuestos' },
  { id: 'EQUIPO', label: 'Equipo y herramientas' },
  { id: 'OTRO_EGRESO', label: 'Otro egreso' },
]

export const INCOME_CATEGORIES = [
  { id: 'APORTE_CAPITAL', label: 'Aporte de capital' },
  { id: 'PRESTAMO', label: 'Préstamo recibido' },
  { id: 'REEMBOLSO_PROVEEDOR', label: 'Reembolso de proveedor' },
  { id: 'OTRO_INGRESO', label: 'Otro ingreso' },
]

/** The category list that belongs to a direction — the backend enforces this too. */
export function categoriesFor(direction) {
  return direction === 'INGRESO' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

function labelFrom(list, id, fallback = '—') {
  return list.find((item) => item.id === id)?.label || id || fallback
}

export const channelLabel = (id) => labelFrom(SALE_CHANNELS, id)
export const paymentLabel = (id) => labelFrom(PAYMENT_METHODS, id)
export const statusLabel = (id) => labelFrom(SALE_STATUSES, id)
export const movementLabel = (id) => labelFrom(MOVEMENT_TYPES, id)
export const categoryLabel = (id) => labelFrom(ALL_CATEGORIES, id)

export const statusTone = (id) => SALE_STATUSES.find((s) => s.id === id)?.tone || 'slate'
export const movementTone = (id) => MOVEMENT_TYPES.find((t) => t.id === id)?.tone || 'slate'
export const channelIcon = (id) => SALE_CHANNELS.find((c) => c.id === id)?.icon || 'sell'

/** Statuses a sale can be moved to from the list view. */
export const STATUS_OPTIONS = SALE_STATUSES.map(({ id, label }) => ({ id, label }))

export const LOW_STOCK_THRESHOLD = 5
