import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildTestApp } from './helpers/buildTestApp.js'

// Two ids, only to show the report is identical for either session.
const SELLER = 'user-1'
const OTHER = 'user-2'

function seed() {
  return {
    products: [
      { id: 'p1', name: 'Mantita', category: 'baby_gear', price: 100, cost: 40, stock: 10, sellerId: SELLER },
      { id: 'p2', name: 'Gorrito', category: 'baby_gear', price: 50, cost: 20, stock: 4, sellerId: SELLER },
      // No cost recorded — must count as 0 COGS, not break the math.
      { id: 'p4', name: 'Sin costo', category: 'baby_gear', price: 60, stock: 5, sellerId: SELLER },
      { id: 'p3', name: 'Calcetines', category: 'baby_gear', price: 80, cost: 30, stock: 5, sellerId: OTHER },
    ],
  }
}

test('GET /reports/summary computes revenue, COGS, margin and net result', async () => {
  const { app, auth } = await buildTestApp(seed())

  // 2 × 100 (cost 40) = 200 revenue, 80 COGS
  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 2 }], soldAt: '2026-08-01T10:00:00Z' },
  })
  // 3 × 50 (cost 20) = 150 revenue, 60 COGS
  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p2', quantity: 3 }], soldAt: '2026-08-02T10:00:00Z' },
  })
  // Egreso 100, otro ingreso 40
  await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: {
      direction: 'EGRESO',
      category: 'MATERIA_PRIMA',
      description: 'Tela',
      amount: 100,
      occurredAt: '2026-08-01',
    },
  })
  await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: {
      direction: 'INGRESO',
      category: 'OTRO_INGRESO',
      description: 'Reembolso',
      amount: 40,
      occurredAt: '2026-08-02',
    },
  })

  const res = await app.inject({
    method: 'GET',
    url: '/reports/summary?from=2026-08-01&to=2026-08-31',
    headers: auth(SELLER),
  })

  assert.equal(res.statusCode, 200)
  const body = res.json()

  assert.equal(body.sales.count, 2)
  assert.equal(body.sales.units, 5)
  assert.equal(body.sales.revenue, 350)
  assert.equal(body.sales.cogs, 140)
  assert.equal(body.sales.grossProfit, 210)
  assert.equal(Math.round(body.sales.marginPct), 60)
  assert.equal(body.sales.averageTicket, 175)

  assert.equal(body.finance.expenses, 100)
  assert.equal(body.finance.otherIncome, 40)
  assert.equal(body.finance.balance, -60)

  assert.equal(body.netResult, 150, 'margen bruto 210 + otros ingresos 40 − egresos 100')

  await app.close()
})

test('products without a recorded cost contribute 0 COGS instead of breaking the report', async () => {
  const { app, auth } = await buildTestApp(seed())

  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p4', quantity: 2 }] },
  })

  const body = (await app.inject({ method: 'GET', url: '/reports/summary', headers: auth(SELLER) })).json()

  assert.equal(body.sales.revenue, 120)
  assert.equal(body.sales.cogs, 0)
  assert.equal(body.sales.grossProfit, 120)
  // And the UI is told how many products are missing a cost, so a 100% margin
  // can be shown with a caveat instead of as fact.
  assert.equal(body.inventory.withoutCost, 1)

  await app.close()
})

test('cancelled sales are excluded from the report', async () => {
  const { app, auth } = await buildTestApp(seed())

  const created = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 2 }] },
  })
  await app.inject({
    method: 'PATCH',
    url: `/sales/${created.json().id}`,
    headers: auth(SELLER),
    payload: { status: 'CANCELLED' },
  })

  const body = (await app.inject({ method: 'GET', url: '/reports/summary', headers: auth(SELLER) })).json()
  assert.equal(body.sales.count, 0)
  assert.equal(body.sales.cancelledCount, 1)
  assert.equal(body.sales.revenue, 0)

  await app.close()
})

test('the report covers the whole business, whoever is signed in', async () => {
  const { app, auth } = await buildTestApp(seed())

  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 1 }] },
  })
  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(OTHER),
    payload: { items: [{ productId: 'p3', quantity: 1 }] },
  })

  for (const who of [SELLER, OTHER]) {
    const body = (await app.inject({ method: 'GET', url: '/reports/summary', headers: auth(who) })).json()
    assert.equal(body.sales.revenue, 180, '100 + 80')
    assert.equal(body.topProducts.length, 2)
  }

  await app.close()
})

test('every line of a multi-product sale counts', async () => {
  const { app, auth } = await buildTestApp(seed())

  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      items: [
        { productId: 'p1', quantity: 1 },
        { productId: 'p3', quantity: 1 },
      ],
    },
  })

  const body = (await app.inject({ method: 'GET', url: '/reports/summary', headers: auth(SELLER) })).json()
  assert.equal(body.sales.count, 1)
  assert.equal(body.sales.revenue, 180, 'la venta completa')
  assert.equal(body.sales.cogs, 70, '40 + 30')
  assert.equal(body.sales.units, 2)

  await app.close()
})

test('the report breaks sales down by channel, product and day', async () => {
  const { app, auth } = await buildTestApp(seed())

  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      channel: 'WHATSAPP',
      items: [{ productId: 'p1', quantity: 1 }],
      soldAt: '2026-08-01T10:00:00Z',
    },
  })
  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      channel: 'FERIA',
      items: [{ productId: 'p2', quantity: 2 }],
      soldAt: '2026-08-01T15:00:00Z',
    },
  })
  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      channel: 'WHATSAPP',
      items: [{ productId: 'p1', quantity: 1 }],
      soldAt: '2026-08-03T10:00:00Z',
    },
  })

  const body = (await app.inject({ method: 'GET', url: '/reports/summary', headers: auth(SELLER) })).json()

  const whatsapp = body.byChannel.find((c) => c.channel === 'WHATSAPP')
  assert.equal(whatsapp.count, 2)
  assert.equal(whatsapp.revenue, 200)
  assert.equal(body.byChannel.find((c) => c.channel === 'FERIA').revenue, 100)

  const top = body.topProducts
  assert.equal(top[0].name, 'Mantita')
  assert.equal(top[0].units, 2)
  assert.equal(top[0].grossProfit, 120)

  // Two sales on the same day collapse into one bucket, sorted ascending.
  assert.deepEqual(
    body.daily.map((d) => d.date),
    ['2026-08-01', '2026-08-03']
  )
  assert.equal(body.daily[0].count, 2)
  assert.equal(body.daily[0].revenue, 200)

  await app.close()
})

test('inventory value is reported at both retail and cost', async () => {
  const { app, auth } = await buildTestApp(seed())

  const body = (await app.inject({ method: 'GET', url: '/reports/summary', headers: auth(SELLER) })).json()

  // p1 10×100 + p2 4×50 + p4 5×60 + p3 5×80 = 1900 retail;
  // 10×40 + 4×20 + 5×0 + 5×30 = 630 cost.
  assert.equal(body.inventory.retailValue, 1900)
  assert.equal(body.inventory.costValue, 630)
  assert.equal(body.inventory.productCount, 4, 'todo el catálogo')
  assert.equal(body.inventory.units, 24)

  await app.close()
})

test('GET /reports/summary requires auth', async () => {
  const { app } = await buildTestApp(seed())
  const res = await app.inject({ method: 'GET', url: '/reports/summary' })
  assert.equal(res.statusCode, 401)
  await app.close()
})
