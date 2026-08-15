import { z } from 'zod'
import { SALE_INCLUDE, dateRangeFilter, toSale, isVoid, moneyOr0 } from '../lib/sales.js'

const summaryQuery = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

/** YYYY-MM-DD bucket key, in UTC so the series is stable regardless of server TZ. */
function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10)
}

export default async function reportRoutes(app) {
  const { prisma } = app

  /**
   * Everything the reports page needs, in one round trip: sales revenue, cost of
   * goods, gross margin, other income, expenses by category, net result,
   * inventory value, top products, sales by channel and a daily series.
   *
   * Computed here rather than in the browser so the frontend never has to pull
   * the whole sales history down to add it up.
   *
   * Single-operator system: no scoping. Every figure covers the whole business.
   */
  app.get('/reports/summary', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = summaryQuery.safeParse(request.query)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { from, to } = parsed.data

    const soldAt = dateRangeFilter(from, to)
    const occurredAt = dateRangeFilter(from, to)

    const [orders, entries, products] = await Promise.all([
      prisma.order.findMany({
        where: soldAt ? { soldAt } : {},
        include: SALE_INCLUDE,
        orderBy: { soldAt: 'asc' },
      }),
      prisma.financeEntry.findMany({
        where: occurredAt ? { occurredAt } : {},
      }),
      prisma.product.findMany({
        select: { id: true, name: true, category: true, price: true, cost: true, stock: true },
      }),
    ])

    const sales = orders.map(toSale).filter((s) => !isVoid(s.status))
    const cancelled = orders.length - sales.length

    let revenue = 0
    let cogs = 0
    let units = 0
    const perProduct = new Map()
    const perChannel = new Map()
    const perDay = new Map()

    for (const sale of sales) {
      const lines = sale.items
      if (lines.length === 0) continue

      const saleRevenue = lines.reduce((sum, i) => sum + i.subtotal, 0)
      const saleCogs = lines.reduce((sum, i) => sum + (i.cost || 0) * i.quantity, 0)
      const saleUnits = lines.reduce((sum, i) => sum + i.quantity, 0)

      revenue += saleRevenue
      cogs += saleCogs
      units += saleUnits

      perChannel.set(sale.channel, {
        channel: sale.channel,
        count: (perChannel.get(sale.channel)?.count || 0) + 1,
        revenue: (perChannel.get(sale.channel)?.revenue || 0) + saleRevenue,
        units: (perChannel.get(sale.channel)?.units || 0) + saleUnits,
      })

      const key = dayKey(sale.soldAt)
      const day = perDay.get(key) || { date: key, revenue: 0, cogs: 0, units: 0, count: 0, expenses: 0 }
      day.revenue += saleRevenue
      day.cogs += saleCogs
      day.units += saleUnits
      day.count += 1
      perDay.set(key, day)

      for (const item of lines) {
        const row = perProduct.get(item.productId) || {
          productId: item.productId,
          name: item.name,
          image: item.image,
          units: 0,
          revenue: 0,
          cogs: 0,
        }
        row.units += item.quantity
        row.revenue += item.subtotal
        row.cogs += (item.cost || 0) * item.quantity
        perProduct.set(item.productId, row)
      }
    }

    let otherIncome = 0
    let expenses = 0
    const perCategory = new Map()
    for (const entry of entries) {
      const amount = moneyOr0(entry.amount)
      if (entry.direction === 'INGRESO') otherIncome += amount
      else expenses += amount

      const row = perCategory.get(entry.category) || {
        category: entry.category,
        direction: entry.direction,
        amount: 0,
        count: 0,
      }
      row.amount += amount
      row.count += 1
      perCategory.set(entry.category, row)

      // Only egresos join the daily series; other income is reported as its own
      // figure so the daily revenue line stays "money from selling things".
      if (entry.direction === 'EGRESO') {
        const key = dayKey(entry.occurredAt)
        const day = perDay.get(key) || { date: key, revenue: 0, cogs: 0, units: 0, count: 0, expenses: 0 }
        day.expenses += amount
        perDay.set(key, day)
      }
    }

    const grossProfit = revenue - cogs
    // Net result treats COGS and recorded expenses as the two cost sides. COGS
    // may overlap with an INVENTARIO/MATERIA_PRIMA expense if the same purchase
    // was also entered in the ledger — flagged for the UI rather than silently
    // deduped, since only Jorge knows which it was.
    const netResult = grossProfit + otherIncome - expenses

    const inventoryValue = products.reduce((sum, p) => sum + moneyOr0(p.price) * p.stock, 0)
    const inventoryCostValue = products.reduce((sum, p) => sum + moneyOr0(p.cost) * p.stock, 0)

    return {
      period: { from: from || null, to: to || null },
      sales: {
        count: sales.length,
        cancelledCount: cancelled,
        units,
        revenue,
        cogs,
        grossProfit,
        marginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        averageTicket: sales.length > 0 ? revenue / sales.length : 0,
      },
      finance: {
        otherIncome,
        expenses,
        balance: otherIncome - expenses,
        byCategory: [...perCategory.values()].sort((a, b) => b.amount - a.amount),
      },
      netResult,
      inventory: {
        productCount: products.length,
        units: products.reduce((sum, p) => sum + p.stock, 0),
        retailValue: inventoryValue,
        costValue: inventoryCostValue,
        outOfStock: products.filter((p) => p.stock === 0).length,
        withoutCost: products.filter((p) => p.cost === null || p.cost === undefined).length,
      },
      topProducts: [...perProduct.values()]
        .map((p) => ({ ...p, grossProfit: p.revenue - p.cogs }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      byChannel: [...perChannel.values()].sort((a, b) => b.revenue - a.revenue),
      daily: [...perDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
    }
  })
}
