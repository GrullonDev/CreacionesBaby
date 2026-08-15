import { z } from 'zod'
import { moneyOr0, dateRangeFilter } from '../lib/sales.js'

const PAYMENT_METHODS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CONTRA_ENTREGA', 'OTRO']

const EGRESO_CATEGORIES = [
  'MATERIA_PRIMA',
  'INVENTARIO',
  'ENVIO',
  'EMPAQUE',
  'PUBLICIDAD',
  'SERVICIOS',
  'RENTA',
  'SALARIOS',
  'COMISIONES',
  'IMPUESTOS',
  'EQUIPO',
  'OTRO_EGRESO',
]
const INGRESO_CATEGORIES = ['APORTE_CAPITAL', 'PRESTAMO', 'REEMBOLSO_PROVEEDOR', 'OTRO_INGRESO']
const ALL_CATEGORIES = [...EGRESO_CATEGORIES, ...INGRESO_CATEGORIES]

const entryInput = z
  .object({
    direction: z.enum(['INGRESO', 'EGRESO']),
    category: z.enum(ALL_CATEGORIES),
    description: z.string().min(1, 'La descripción es obligatoria'),
    amount: z.number().positive('El monto debe ser mayor a 0'),
    paymentMethod: z.enum(PAYMENT_METHODS).nullable().optional(),
    // Nullable as well as optional: PUT re-validates the *merged* entry, and the
    // stored value for an unset field is null, not undefined.
    counterparty: z.string().nullable().optional(),
    reference: z.string().nullable().optional(),
    receiptUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
    notes: z.string().nullable().optional(),
    occurredAt: z.coerce.date().optional(),
  })
  // A category belongs to exactly one direction — an EGRESO tagged
  // APORTE_CAPITAL would quietly corrupt every report that groups by category.
  .refine(
    (data) =>
      data.direction === 'EGRESO'
        ? EGRESO_CATEGORIES.includes(data.category)
        : INGRESO_CATEGORIES.includes(data.category),
    { message: 'La categoría no corresponde al tipo de movimiento', path: ['category'] }
  )

const listQuery = z.object({
  direction: z.enum(['INGRESO', 'EGRESO']).optional(),
  category: z.enum(ALL_CATEGORIES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
})

function emptyString(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed === '' ? null : trimmed
}

function toEntry(entry) {
  return {
    id: entry.id,
    direction: entry.direction,
    category: entry.category,
    description: entry.description,
    amount: moneyOr0(entry.amount),
    paymentMethod: entry.paymentMethod,
    counterparty: entry.counterparty,
    reference: entry.reference,
    receiptUrl: entry.receiptUrl,
    notes: entry.notes,
    occurredAt: entry.occurredAt,
    userId: entry.userId,
    createdAt: entry.createdAt,
  }
}

export default async function financeRoutes(app) {
  const { prisma } = app

  app.get('/finance-entries', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = listQuery.safeParse(request.query)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { direction, category, from, to, q, page, pageSize } = parsed.data

    const occurredAt = dateRangeFilter(from, to)
    const where = {
      ...(direction ? { direction } : {}),
      ...(category ? { category } : {}),
      ...(occurredAt ? { occurredAt } : {}),
      ...(q
        ? {
            OR: [
              { description: { contains: q, mode: 'insensitive' } },
              { counterparty: { contains: q, mode: 'insensitive' } },
              { reference: { contains: q, mode: 'insensitive' } },
              { notes: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [rows, count, sums] = await Promise.all([
      prisma.financeEntry.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.financeEntry.count({ where }),
      prisma.financeEntry.groupBy({
        by: ['direction'],
        where,
        _sum: { amount: true },
      }),
    ])

    const byDirection = (dir) =>
      moneyOr0(sums.find((s) => s.direction === dir)?._sum?.amount)

    const ingresos = byDirection('INGRESO')
    const egresos = byDirection('EGRESO')

    return {
      entries: rows.map(toEntry),
      page,
      pageSize,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
      totals: { ingresos, egresos, balance: ingresos - egresos },
    }
  })

  app.post(
    '/finance-entries',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = entryInput.safeParse(request.body)
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
      const data = parsed.data

      const entry = await prisma.financeEntry.create({
        data: {
          direction: data.direction,
          category: data.category,
          description: data.description.trim(),
          amount: data.amount,
          paymentMethod: data.paymentMethod || null,
          counterparty: emptyString(data.counterparty),
          reference: emptyString(data.reference),
          receiptUrl: emptyString(data.receiptUrl),
          notes: emptyString(data.notes),
          occurredAt: data.occurredAt || new Date(),
          // Recorded for audit; nothing filters on it in a single-operator system.
          userId: request.user.sub,
        },
      })
      return reply.code(201).send(toEntry(entry))
    }
  )

  app.put('/finance-entries/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const existing = await prisma.financeEntry.findUnique({ where: { id: request.params.id } })
    if (!existing) return reply.code(404).send({ error: 'Movimiento no encontrado' })

    // Validate the merged result, not just the patch: changing only `category`
    // still has to be consistent with the stored `direction`.
    const merged = { ...toEntry(existing), ...request.body }
    const parsed = entryInput.safeParse(merged)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const data = parsed.data

    const entry = await prisma.financeEntry.update({
      where: { id: existing.id },
      data: {
        direction: data.direction,
        category: data.category,
        description: data.description.trim(),
        amount: data.amount,
        paymentMethod: data.paymentMethod || null,
        counterparty: emptyString(data.counterparty),
        reference: emptyString(data.reference),
        receiptUrl: emptyString(data.receiptUrl),
        notes: emptyString(data.notes),
        occurredAt: data.occurredAt || existing.occurredAt,
      },
    })
    return toEntry(entry)
  })

  app.delete('/finance-entries/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const existing = await prisma.financeEntry.findUnique({ where: { id: request.params.id } })
    if (!existing) return reply.code(404).send({ error: 'Movimiento no encontrado' })
    await prisma.financeEntry.delete({ where: { id: existing.id } })
    return reply.code(204).send()
  })
}

export { EGRESO_CATEGORIES, INGRESO_CATEGORIES }
