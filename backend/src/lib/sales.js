/**
 * Shared helpers for the sales / inventory / finance side of the API.
 *
 * These live outside the route files because `routes/sales.js`,
 * `routes/stock.js` and `routes/reports.js` all need the same money
 * serialisation and the same date-range handling.
 *
 * There is deliberately no visibility/scoping helper here any more. This is a
 * single-operator system: everything authenticated sees everything.
 */

/** Prisma `Decimal` (or null) -> plain JS number (or null). */
export function money(value) {
  return value === null || value === undefined ? null : Number(value)
}

/** Same, but for fields that should never be null in the response. */
export function moneyOr0(value) {
  return value === null || value === undefined ? 0 : Number(value)
}

export const SALE_INCLUDE = {
  items: { include: { product: { include: { images: true } } } },
}

/**
 * Inclusive-day date range from `from`/`to` query params (YYYY-MM-DD or any
 * Date-parseable string). Returns undefined when neither is set so callers can
 * spread it into a `where` without emitting an empty object.
 *
 * `to` is pushed to the end of that day, so `?from=2026-08-01&to=2026-08-01`
 * matches a sale made at 14:30 on the 1st rather than silently returning
 * nothing.
 */
export function dateRangeFilter(from, to) {
  const range = {}
  if (from) {
    const d = new Date(from)
    if (!Number.isNaN(d.valueOf())) range.gte = d
  }
  if (to) {
    const d = new Date(to)
    if (!Number.isNaN(d.valueOf())) {
      // Bare YYYY-MM-DD parses as midnight UTC; treat it as the whole day.
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(to))) d.setUTCHours(23, 59, 59, 999)
      range.lte = d
    }
  }
  return Object.keys(range).length > 0 ? range : undefined
}

/** Line subtotal for one sale item. */
export function lineSubtotal(item) {
  return moneyOr0(item.price) * item.quantity
}

/** Cost of goods for one sale item (0 when the product had no cost recorded). */
export function lineCost(item) {
  return moneyOr0(item.cost) * item.quantity
}

/**
 * Serialise a sale for the back office. Includes sale details (channel, cost,
 * margin, who recorded it).
 */
export function toSale(order) {
  const items = (order.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product?.name || '',
    image: item.product?.images?.[0]?.url || '',
    quantity: item.quantity,
    price: moneyOr0(item.price),
    cost: money(item.cost),
    selectedColor: item.selectedColor || undefined,
    selectedSize: item.selectedSize || undefined,
    subtotal: lineSubtotal(item),
  }))

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0)
  const cogs = (order.items || []).reduce((sum, i) => sum + lineCost(i), 0)
  const total = moneyOr0(order.total)

  return {
    id: order.id,
    date: order.soldAt || order.createdAt,
    soldAt: order.soldAt || order.createdAt,
    createdAt: order.createdAt,
    status: order.status,
    channel: order.channel,
    paymentMethod: order.paymentMethod,
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    discount: moneyOr0(order.discount),
    promoCode: order.promoCode,
    shipping: moneyOr0(order.shipping),
    total,
    cogs,
    // Gross margin excludes shipping charged to the customer, which is a
    // pass-through, not margin on the goods.
    grossProfit: total - moneyOr0(order.shipping) - cogs,
    notes: order.notes || null,
    customer: {
      name: order.addressName || null,
      email: order.addressEmail || null,
      phone: order.customerPhone || null,
      address: order.addressLine || null,
      city: order.addressCity || null,
      zip: order.addressZip || null,
    },
    // Kept for the storefront's existing Orders.jsx / useCheckoutLogic.js,
    // which read `order.address.*`.
    address: {
      name: order.addressName || '',
      email: order.addressEmail || '',
      address: order.addressLine || '',
      city: order.addressCity || '',
      zip: order.addressZip || '',
    },
    recordedById: order.recordedById || null,
  }
}

/**
 * Statuses that mean "this sale did not happen" and so must be excluded from
 * revenue and must not hold stock.
 */
export const VOID_STATUSES = ['CANCELLED']

export function isVoid(status) {
  return VOID_STATUSES.includes(status)
}
