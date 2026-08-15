import { z } from 'zod'
import { money, dateRangeFilter } from '../lib/sales.js'

const MANUAL_TYPES = ['ENTRADA', 'SALIDA', 'AJUSTE', 'MERMA', 'DEVOLUCION']
const ALL_TYPES = [...MANUAL_TYPES, 'VENTA']

const movementInput = z.object({
  productId: z.string().min(1),
  // VENTA is deliberately not accepted here: a sale's stock movement is written
  // by POST /sales, so the movement and the sale row can never disagree.
  type: z.enum(MANUAL_TYPES),
  /**
   * For ENTRADA / SALIDA / MERMA / DEVOLUCION: a positive amount of units, whose
   * sign is derived from `type`.
   * For AJUSTE: ignored — send `newStock` instead.
   */
  quantity: z.number().int().positive().optional(),
  /** AJUSTE only: the counted total. The stored delta is newStock - stock. */
  newStock: z.number().int().min(0).optional(),
  reason: z.string().optional(),
  unitCost: z.number().min(0).nullable().optional(),
})

const listQuery = z.object({
  productId: z.string().optional(),
  type: z.enum(ALL_TYPES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
})

/** Positive types add stock, negative ones remove it. */
function signedDelta(type, quantity) {
  return type === 'ENTRADA' || type === 'DEVOLUCION' ? quantity : -quantity
}

function toMovement(movement) {
  return {
    id: movement.id,
    productId: movement.productId,
    productName: movement.product?.name || '',
    productImage: movement.product?.images?.[0]?.url || '',
    type: movement.type,
    quantity: movement.quantity,
    stockAfter: movement.stockAfter,
    reason: movement.reason,
    unitCost: money(movement.unitCost),
    orderId: movement.orderId,
    createdById: movement.createdById,
    createdAt: movement.createdAt,
  }
}

export default async function stockRoutes(app) {
  const { prisma } = app

  app.get('/stock-movements', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = listQuery.safeParse(request.query)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { productId, type, from, to, page, pageSize } = parsed.data

    const createdAt = dateRangeFilter(from, to)
    const where = {
      ...(productId ? { productId } : {}),
      ...(type ? { type } : {}),
      ...(createdAt ? { createdAt } : {}),
    }

    const [rows, count] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: { product: { include: { images: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.stockMovement.count({ where }),
    ])

    return {
      movements: rows.map(toMovement),
      page,
      pageSize,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    }
  })

  /**
   * Record a manual stock change. Applies the delta to Product.stock, keeps
   * `inStock` consistent, and stores the resulting level on the movement — all
   * in one transaction, so stock and its audit trail can't drift apart.
   */
  app.post(
    '/stock-movements',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = movementInput.safeParse(request.body)
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
      const { productId, type, quantity, newStock, reason, unitCost } = parsed.data

      if (type === 'AJUSTE' && newStock === undefined) {
        return reply.code(400).send({ error: 'Un AJUSTE necesita el nuevo conteo (newStock)' })
      }
      if (type !== 'AJUSTE' && quantity === undefined) {
        return reply.code(400).send({ error: 'Indica la cantidad de unidades' })
      }

      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return reply.code(404).send({ error: 'Producto no encontrado' })

      const delta = type === 'AJUSTE' ? newStock - product.stock : signedDelta(type, quantity)
      const stockAfter = product.stock + delta

      if (stockAfter < 0) {
        return reply.code(409).send({
          error: `El movimiento dejaría el stock en ${stockAfter}. Disponible: ${product.stock}`,
        })
      }
      if (delta === 0) {
        return reply.code(400).send({ error: 'El movimiento no cambia el stock' })
      }

      const movement = await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: productId },
          data: { stock: stockAfter, inStock: stockAfter > 0 },
        })
        return tx.stockMovement.create({
          data: {
            productId,
            type,
            quantity: delta,
            stockAfter,
            reason: reason?.trim() || null,
            // An ENTRADA is a restock, so remember what it cost per unit even
            // when the product's own `cost` isn't set.
            unitCost: unitCost ?? (type === 'ENTRADA' ? product.cost ?? null : null),
            createdById: request.user.sub,
          },
          include: { product: { include: { images: true } } },
        })
      })

      return reply.code(201).send(toMovement(movement))
    }
  )
}
