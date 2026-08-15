/**
 * A tiny in-memory stand-in for the Prisma client, enough to exercise the
 * sales/stock/finance/reports routes through Fastify `inject` without a running
 * Postgres.
 *
 * It is deliberately not a general Prisma emulator — it supports exactly the
 * query shapes those routes use. If a route starts using a new filter shape, the
 * test will fail loudly here rather than silently pass, which is the point.
 */

let seq = 0
function nextId(prefix) {
  seq += 1
  return `${prefix}_${seq}`
}

/** Decimal-ish: routes only ever pass these through Number(), so numbers are fine. */
function dec(value) {
  return value === null || value === undefined ? null : Number(value)
}

function matchesDateRange(value, range) {
  if (!range) return true
  const t = new Date(value).valueOf()
  if (range.gte && t < new Date(range.gte).valueOf()) return false
  if (range.lte && t > new Date(range.lte).valueOf()) return false
  return true
}

function matchesStringFilter(value, filter) {
  if (filter === undefined) return true
  if (filter === null) return value === null
  if (typeof filter === 'string') return value === filter
  if (filter.contains !== undefined) {
    if (value === null || value === undefined) return false
    return filter.mode === 'insensitive'
      ? String(value).toLowerCase().includes(String(filter.contains).toLowerCase())
      : String(value).includes(filter.contains)
  }
  if (filter.not !== undefined) return value !== filter.not
  if (filter.in !== undefined) return filter.in.includes(value)
  return true
}

export function createFakePrisma(seed = {}) {
  const db = {
    users: [...(seed.users || [])],
    products: (seed.products || []).map((p) => ({
      subcategory: null,
      brand: null,
      originalPrice: null,
      description: '',
      rating: 0,
      reviews: 0,
      features: [],
      colors: [],
      sizes: [],
      images: [],
      sellerId: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      inStock: (p.stock ?? 0) > 0,
      ...p,
      price: dec(p.price),
      cost: dec(p.cost ?? null),
    })),
    orders: [...(seed.orders || [])],
    orderItems: [...(seed.orderItems || [])],
    stockMovements: [...(seed.stockMovements || [])],
    financeEntries: [...(seed.financeEntries || [])],
  }

  const productById = (id) => db.products.find((p) => p.id === id)

  function hydrateOrder(order, include) {
    const out = { ...order }
    if (include?.items) {
      out.items = db.orderItems
        .filter((i) => i.orderId === order.id)
        .map((item) => {
          const line = { ...item }
          if (include.items.include?.product) {
            const product = productById(item.productId)
            line.product = product
              ? { ...product, images: include.items.include.product.include?.images ? product.images : undefined }
              : null
          }
          return line
        })
    }
    return out
  }

  function orderMatches(order, where = {}) {
    if (where.id !== undefined && order.id !== where.id) return false
    if (where.channel !== undefined && order.channel !== where.channel) return false
    if (where.status !== undefined && order.status !== where.status) return false
    if (where.userId !== undefined && order.userId !== where.userId) return false
    if (where.soldAt !== undefined && !matchesDateRange(order.soldAt, where.soldAt)) return false

    // `{ items: { some: { product: { sellerId } } } }` — the seller-scoping rule.
    if (where.items?.some) {
      const some = where.items.some
      const items = db.orderItems.filter((i) => i.orderId === order.id)
      const ok = items.some((item) => {
        const product = productById(item.productId)
        if (!product) return false
        if (some.product?.sellerId !== undefined && product.sellerId !== some.product.sellerId) return false
        if (some.product?.name !== undefined && !matchesStringFilter(product.name, some.product.name)) {
          return false
        }
        return true
      })
      if (!ok) return false
    }

    if (where.OR) {
      const anyMatch = where.OR.some((clause) => {
        if (clause.items?.some) return orderMatches(order, { items: clause.items })
        const [field, filter] = Object.entries(clause)[0]
        return matchesStringFilter(order[field], filter)
      })
      if (!anyMatch) return false
    }
    return true
  }

  function financeMatches(entry, where = {}) {
    if (where.userId !== undefined && entry.userId !== where.userId) return false
    if (where.direction !== undefined && entry.direction !== where.direction) return false
    if (where.category !== undefined && entry.category !== where.category) return false
    if (where.occurredAt !== undefined && !matchesDateRange(entry.occurredAt, where.occurredAt)) return false
    if (where.OR) {
      const anyMatch = where.OR.some((clause) => {
        const [field, filter] = Object.entries(clause)[0]
        return matchesStringFilter(entry[field], filter)
      })
      if (!anyMatch) return false
    }
    return true
  }

  function movementMatches(movement, where = {}) {
    if (where.productId !== undefined && movement.productId !== where.productId) return false
    if (where.type !== undefined && movement.type !== where.type) return false
    if (where.orderId !== undefined && movement.orderId !== where.orderId) return false
    if (where.createdAt !== undefined && !matchesDateRange(movement.createdAt, where.createdAt)) return false
    if (where.product?.sellerId !== undefined) {
      const product = productById(movement.productId)
      if (!product || product.sellerId !== where.product.sellerId) return false
    }
    return true
  }

  function sortBy(rows, orderBy) {
    if (!orderBy) return rows
    const [[field, dir]] = Object.entries(orderBy)
    return [...rows].sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      const cmp = av === bv ? 0 : new Date(av).valueOf() - new Date(bv).valueOf() || String(av).localeCompare(String(bv))
      return dir === 'desc' ? -cmp : cmp
    })
  }

  function paginate(rows, { skip, take }) {
    const start = skip || 0
    return take === undefined ? rows.slice(start) : rows.slice(start, start + take)
  }

  const client = {
    /** The routes only need transactional *grouping*, not rollback, to be tested. */
    $transaction: async (fn) => fn(client),

    product: {
      findMany: async ({ where = {}, select } = {}) => {
        let rows = db.products.filter((p) => {
          if (where.id?.in && !where.id.in.includes(p.id)) return false
          if (where.sellerId !== undefined && p.sellerId !== where.sellerId) return false
          if (where.category !== undefined && p.category !== where.category) return false
          return true
        })
        if (select) {
          rows = rows.map((p) =>
            Object.fromEntries(Object.keys(select).filter((k) => select[k]).map((k) => [k, p[k]]))
          )
        }
        return rows.map((p) => ({ ...p }))
      },
      findUnique: async ({ where }) => {
        const found = productById(where.id)
        return found ? { ...found } : null
      },
      update: async ({ where, data }) => {
        const product = productById(where.id)
        if (!product) throw new Error(`No product ${where.id}`)
        Object.assign(product, data)
        return { ...product }
      },
      create: async ({ data }) => {
        const { images, ...rest } = data
        const product = {
          id: nextId('prod'),
          ...rest,
          // Prisma's nested `{ images: { create: [...] } }` writes rows; the fake
          // flattens them to the array the serialisers expect.
          images: (images?.create || []).map((img) => ({ id: nextId('img'), ...img })),
          price: dec(rest.price),
          cost: dec(rest.cost ?? null),
        }
        db.products.push(product)
        return { ...product }
      },
    },

    order: {
      findMany: async ({ where = {}, include, orderBy, skip, take } = {}) => {
        const rows = sortBy(db.orders.filter((o) => orderMatches(o, where)), orderBy)
        return paginate(rows, { skip, take }).map((o) => hydrateOrder(o, include))
      },
      findFirst: async ({ where = {}, include } = {}) => {
        const found = db.orders.find((o) => orderMatches(o, where))
        return found ? hydrateOrder(found, include) : null
      },
      findUnique: async ({ where, include }) => {
        const found = db.orders.find((o) => o.id === where.id)
        return found ? hydrateOrder(found, include) : null
      },
      count: async ({ where = {} } = {}) => db.orders.filter((o) => orderMatches(o, where)).length,
      create: async ({ data, include }) => {
        const { items, ...rest } = data
        const order = {
          id: nextId('order'),
          status: 'PENDING',
          channel: 'WEB',
          discount: 0,
          shipping: 0,
          promoCode: null,
          paymentMethod: null,
          notes: null,
          recordedById: null,
          userId: null,
          soldAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...rest,
          total: dec(rest.total),
        }
        db.orders.push(order)
        for (const item of items?.create || []) {
          db.orderItems.push({
            id: nextId('item'),
            orderId: order.id,
            selectedColor: null,
            selectedSize: null,
            ...item,
            price: dec(item.price),
            cost: dec(item.cost ?? null),
          })
        }
        return hydrateOrder(order, include)
      },
      update: async ({ where, data, include }) => {
        const order = db.orders.find((o) => o.id === where.id)
        if (!order) throw new Error(`No order ${where.id}`)
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) order[key] = value
        }
        return hydrateOrder(order, include)
      },
    },

    stockMovement: {
      create: async ({ data, include }) => {
        const movement = {
          id: nextId('mov'),
          reason: null,
          orderId: null,
          createdById: null,
          createdAt: new Date(),
          ...data,
          unitCost: dec(data.unitCost ?? null),
        }
        db.stockMovements.push(movement)
        const out = { ...movement }
        if (include?.product) out.product = productById(movement.productId) || null
        return out
      },
      findMany: async ({ where = {}, include, orderBy, skip, take } = {}) => {
        const rows = sortBy(db.stockMovements.filter((m) => movementMatches(m, where)), orderBy)
        return paginate(rows, { skip, take }).map((m) => ({
          ...m,
          ...(include?.product ? { product: productById(m.productId) || null } : {}),
        }))
      },
      count: async ({ where = {} } = {}) => db.stockMovements.filter((m) => movementMatches(m, where)).length,
    },

    financeEntry: {
      create: async ({ data }) => {
        const entry = {
          id: nextId('fin'),
          paymentMethod: null,
          counterparty: null,
          reference: null,
          receiptUrl: null,
          notes: null,
          occurredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
          amount: dec(data.amount),
        }
        db.financeEntries.push(entry)
        return { ...entry }
      },
      findMany: async ({ where = {}, orderBy, skip, take } = {}) => {
        const rows = sortBy(db.financeEntries.filter((e) => financeMatches(e, where)), orderBy)
        return paginate(rows, { skip, take }).map((e) => ({ ...e }))
      },
      findUnique: async ({ where }) => {
        const found = db.financeEntries.find((e) => e.id === where.id)
        return found ? { ...found } : null
      },
      count: async ({ where = {} } = {}) => db.financeEntries.filter((e) => financeMatches(e, where)).length,
      groupBy: async ({ by, where = {}, _sum }) => {
        const rows = db.financeEntries.filter((e) => financeMatches(e, where))
        const groups = new Map()
        for (const row of rows) {
          const key = by.map((f) => row[f]).join('|')
          const group = groups.get(key) || {
            ...Object.fromEntries(by.map((f) => [f, row[f]])),
            _sum: { amount: 0 },
          }
          if (_sum?.amount) group._sum.amount += Number(row.amount)
          groups.set(key, group)
        }
        return [...groups.values()]
      },
      update: async ({ where, data }) => {
        const entry = db.financeEntries.find((e) => e.id === where.id)
        if (!entry) throw new Error(`No entry ${where.id}`)
        Object.assign(entry, data, { amount: dec(data.amount ?? entry.amount) })
        return { ...entry }
      },
      delete: async ({ where }) => {
        const index = db.financeEntries.findIndex((e) => e.id === where.id)
        const [removed] = db.financeEntries.splice(index, 1)
        return removed
      },
    },
  }

  return { client, db }
}
