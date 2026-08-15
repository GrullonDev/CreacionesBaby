import { z } from 'zod'
import { SALE_INCLUDE, dateRangeFilter, toSale, isVoid } from '../lib/sales.js'

const CHANNELS = ['WEB', 'WHATSAPP', 'PRESENCIAL', 'FERIA', 'REDES', 'OTRO']
const PAYMENT_METHODS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CONTRA_ENTREGA', 'OTRO']
const STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const saleInput = z.object({
  // Defaults to an in-person sale, the common case. WEB now means the external
  // selling platform — this system no longer has a storefront of its own.
  channel: z.enum(CHANNELS).default('PRESENCIAL'),
  status: z.enum(STATUSES).default('PAID'),
  paymentMethod: z.enum(PAYMENT_METHODS).nullable().optional(),
  // Business date of the sale. Backdatable so last week's fair can be entered
  // today; rejected if it's in the future, which is always a typo.
  soldAt: z.coerce.date().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        // Optional override for a negotiated price. Absent -> the product's
        // current catalog price is used (looked up server-side).
        unitPrice: z.number().min(0).optional(),
        selectedColor: z.string().optional(),
        selectedSize: z.string().optional(),
      })
    )
    .min(1, 'Añade al menos un producto'),
  customer: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
  discount: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  notes: z.string().optional(),
})

const saleUpdate = z.object({
  status: z.enum(STATUSES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).nullable().optional(),
  channel: z.enum(CHANNELS).optional(),
  soldAt: z.coerce.date().optional(),
  notes: z.string().nullable().optional(),
})

const listQuery = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  channel: z.enum(CHANNELS).optional(),
  status: z.enum(STATUSES).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
})

function emptyString(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed === '' ? null : trimmed
}

export default async function salesRoutes(app) {
  const { prisma } = app

  /**
   * Every sale, in one list — hand-entered, and any historical rows from when the
   * shop had its own checkout. Single-operator system, so there is no visibility
   * filter: if you're authenticated, you see all of it.
   */
  app.get('/sales', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = listQuery.safeParse(request.query)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { from, to, channel, status, q, page, pageSize } = parsed.data

    const soldAt = dateRangeFilter(from, to)
    const where = {
      ...(soldAt ? { soldAt } : {}),
      ...(channel ? { channel } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { addressName: { contains: q, mode: 'insensitive' } },
              { addressEmail: { contains: q, mode: 'insensitive' } },
              { customerPhone: { contains: q, mode: 'insensitive' } },
              { notes: { contains: q, mode: 'insensitive' } },
              { items: { some: { product: { name: { contains: q, mode: 'insensitive' } } } } },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: SALE_INCLUDE,
        orderBy: { soldAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ])

    const sales = rows.map(toSale)

    // Totals are computed over the *filtered* set, not just the current page,
    // so the stat cards don't change when you turn the page. Cancelled sales
    // are excluded from money totals but still listed.
    const allMatching = await prisma.order.findMany({ where, include: SALE_INCLUDE })
    const live = allMatching.map(toSale).filter((s) => !isVoid(s.status))
    const revenue = live.reduce((sum, s) => sum + s.total, 0)
    const cogs = live.reduce((sum, s) => sum + s.cogs, 0)
    const grossProfit = live.reduce((sum, s) => sum + s.grossProfit, 0)

    return {
      sales,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      totals: {
        count: live.length,
        cancelledCount: allMatching.length - live.length,
        units: live.reduce((sum, s) => sum + s.itemCount, 0),
        revenue,
        cogs,
        grossProfit,
        marginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        averageTicket: live.length > 0 ? revenue / live.length : 0,
      },
    }
  })

  app.get('/sales/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const sale = await prisma.order.findUnique({
      where: { id: request.params.id },
      include: SALE_INCLUDE,
    })
    if (!sale) return reply.code(404).send({ error: 'Venta no encontrada' })
    return toSale(sale)
  })

  /**
   * Record a sale.
   *
   * Prices come from the database, stock is validated then decremented, and the
   * whole thing is one transaction. An explicit `unitPrice` override is allowed
   * — real sales get negotiated — and every stock change also writes a
   * StockMovement so the inventory has an audit trail.
   */
  app.post(
    '/sales',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = saleInput.safeParse(request.body)
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
      const { channel, status, paymentMethod, soldAt, items, customer, discount, shipping, notes } =
        parsed.data

      if (soldAt && soldAt.valueOf() > Date.now() + 60_000) {
        return reply.code(400).send({ error: 'La fecha de la venta no puede estar en el futuro' })
      }

      const productIds = [...new Set(items.map((i) => i.productId))]
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
      const productMap = new Map(products.map((p) => [p.id, p]))

      const missing = productIds.filter((id) => !productMap.has(id))
      if (missing.length > 0) {
        return reply.code(400).send({ error: `Producto(s) desconocido(s): ${missing.join(', ')}` })
      }

      // Sum requested quantity per product before checking stock, so two lines
      // of the same product can't each pass the check and jointly oversell.
      const requested = new Map()
      for (const item of items) {
        requested.set(item.productId, (requested.get(item.productId) || 0) + item.quantity)
      }
      // A cancelled sale never holds stock, so don't reserve any for one.
      const consumesStock = !isVoid(status)
      if (consumesStock) {
        for (const [productId, quantity] of requested) {
          const product = productMap.get(productId)
          if (product.stock < quantity) {
            return reply.code(409).send({
              error: `Stock insuficiente de "${product.name}": disponible ${product.stock}, solicitado ${quantity}`,
            })
          }
        }
      }

      const priceFor = (item) =>
        item.unitPrice !== undefined ? item.unitPrice : Number(productMap.get(item.productId).price)

      const subtotal = items.reduce((sum, item) => sum + priceFor(item) * item.quantity, 0)
      const total = Math.max(0, subtotal - discount + shipping)
      const saleDate = soldAt || new Date()

      const sale = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            channel,
            status,
            paymentMethod: paymentMethod || null,
            soldAt: saleDate,
            total,
            discount,
            shipping,
            notes: emptyString(notes),
            recordedById: request.user.sub,
            addressName: emptyString(customer?.name),
            addressEmail: emptyString(customer?.email),
            addressLine: emptyString(customer?.address),
            addressCity: emptyString(customer?.city),
            addressZip: emptyString(customer?.zip),
            customerPhone: emptyString(customer?.phone),
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: priceFor(item),
                cost: productMap.get(item.productId).cost ?? null,
                selectedColor: item.selectedColor || null,
                selectedSize: item.selectedSize || null,
              })),
            },
          },
          include: SALE_INCLUDE,
        })

        if (consumesStock) {
          for (const [productId, quantity] of requested) {
            const product = productMap.get(productId)
            const stockAfter = product.stock - quantity
            await tx.product.update({
              where: { id: productId },
              data: { stock: stockAfter, inStock: stockAfter > 0 },
            })
            await tx.stockMovement.create({
              data: {
                productId,
                type: 'VENTA',
                quantity: -quantity,
                stockAfter,
                reason: `Venta ${channel.toLowerCase()}`,
                unitCost: product.cost ?? null,
                orderId: created.id,
                createdById: request.user.sub,
              },
            })
          }
        }

        return created
      })

      return reply.code(201).send(toSale(sale))
    }
  )

  /**
   * Update a sale: status transitions (PENDING -> PAID -> SHIPPED -> DELIVERED
   * / CANCELLED) plus the editable metadata.
   *
   * Cancelling puts the stock back and records DEVOLUCION movements;
   * un-cancelling takes it out again (and refuses if there isn't enough). There
   * is deliberately no DELETE — a sale is cancelled, never erased, so the
   * ledger stays auditable.
   */
  app.patch('/sales/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = saleUpdate.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const patch = parsed.data

    const existing = await prisma.order.findUnique({
      where: { id: request.params.id },
      include: SALE_INCLUDE,
    })
    if (!existing) return reply.code(404).send({ error: 'Venta no encontrada' })

    if (patch.soldAt && patch.soldAt.valueOf() > Date.now() + 60_000) {
      return reply.code(400).send({ error: 'La fecha de la venta no puede estar en el futuro' })
    }

    const wasVoid = isVoid(existing.status)
    const willBeVoid = patch.status ? isVoid(patch.status) : wasVoid

    // Net quantity per product, so a sale listing the same product twice is
    // restored/re-reserved once with the combined amount.
    const perProduct = new Map()
    for (const item of existing.items) {
      perProduct.set(item.productId, (perProduct.get(item.productId) || 0) + item.quantity)
    }

    if (!wasVoid && willBeVoid) {
      // Cancelling: give the stock back.
      const sale = await prisma.$transaction(async (tx) => {
        for (const [productId, quantity] of perProduct) {
          const product = await tx.product.findUnique({ where: { id: productId } })
          if (!product) continue
          const stockAfter = product.stock + quantity
          await tx.product.update({
            where: { id: productId },
            data: { stock: stockAfter, inStock: stockAfter > 0 },
          })
          await tx.stockMovement.create({
            data: {
              productId,
              type: 'DEVOLUCION',
              quantity,
              stockAfter,
              reason: 'Venta cancelada',
              orderId: existing.id,
              createdById: request.user.sub,
            },
          })
        }
        return tx.order.update({
          where: { id: existing.id },
          data: { ...patch, notes: patch.notes === undefined ? undefined : emptyString(patch.notes) },
          include: SALE_INCLUDE,
        })
      })
      return toSale(sale)
    }

    if (wasVoid && !willBeVoid) {
      // Reopening a cancelled sale: take the stock back out, if it's there.
      for (const [productId, quantity] of perProduct) {
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) continue
        if (product.stock < quantity) {
          return reply.code(409).send({
            error: `No se puede reactivar: stock insuficiente de "${product.name}" (disponible ${product.stock}, requiere ${quantity})`,
          })
        }
      }
      const sale = await prisma.$transaction(async (tx) => {
        for (const [productId, quantity] of perProduct) {
          const product = await tx.product.findUnique({ where: { id: productId } })
          if (!product) continue
          const stockAfter = product.stock - quantity
          await tx.product.update({
            where: { id: productId },
            data: { stock: stockAfter, inStock: stockAfter > 0 },
          })
          await tx.stockMovement.create({
            data: {
              productId,
              type: 'VENTA',
              quantity: -quantity,
              stockAfter,
              reason: 'Venta reactivada',
              orderId: existing.id,
              createdById: request.user.sub,
            },
          })
        }
        return tx.order.update({
          where: { id: existing.id },
          data: { ...patch, notes: patch.notes === undefined ? undefined : emptyString(patch.notes) },
          include: SALE_INCLUDE,
        })
      })
      return toSale(sale)
    }

    const sale = await prisma.order.update({
      where: { id: existing.id },
      data: { ...patch, notes: patch.notes === undefined ? undefined : emptyString(patch.notes) },
      include: SALE_INCLUDE,
    })
    return toSale(sale)
  })
}
