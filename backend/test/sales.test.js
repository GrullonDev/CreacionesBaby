import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildTestApp } from './helpers/buildTestApp.js'

// Two ids, only to prove there is no per-user scoping any more: whoever is
// signed in sees the same books.
const SELLER = 'user-1'
const OTHER = 'user-2'

function seed() {
  return {
    products: [
      { id: 'p1', name: 'Mantita', category: 'baby_gear', price: 100, cost: 40, stock: 10, sellerId: SELLER },
      { id: 'p2', name: 'Gorrito', category: 'baby_gear', price: 50, cost: 20, stock: 3, sellerId: SELLER },
      { id: 'p3', name: 'Calcetines', category: 'baby_gear', price: 80, cost: 30, stock: 5, sellerId: OTHER },
    ],
  }
}

test('POST /sales records a manual sale, decrements stock and writes a movement', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const res = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      channel: 'WHATSAPP',
      paymentMethod: 'EFECTIVO',
      items: [{ productId: 'p1', quantity: 2 }],
      customer: { name: 'Ana', phone: '5555-1234' },
      shipping: 25,
    },
  })

  assert.equal(res.statusCode, 201)
  const sale = res.json()
  assert.equal(sale.channel, 'WHATSAPP')
  assert.equal(sale.subtotal, 200)
  assert.equal(sale.total, 225, 'subtotal 200 + envío 25')
  assert.equal(sale.cogs, 80, '2 × costo 40')
  assert.equal(sale.grossProfit, 120, 'total menos envío menos COGS')
  assert.equal(sale.customer.phone, '5555-1234')

  assert.equal(db.products.find((p) => p.id === 'p1').stock, 8)
  const movements = db.stockMovements.filter((m) => m.productId === 'p1')
  assert.equal(movements.length, 1)
  assert.equal(movements[0].type, 'VENTA')
  assert.equal(movements[0].quantity, -2)
  assert.equal(movements[0].stockAfter, 8)
  assert.equal(movements[0].orderId, sale.id)

  await app.close()
})

test('POST /sales honours a negotiated unit price instead of the catalog price', async () => {
  const { app, auth } = await buildTestApp(seed())

  const res = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 3, unitPrice: 85 }], discount: 5 },
  })

  assert.equal(res.statusCode, 201)
  const sale = res.json()
  assert.equal(sale.subtotal, 255, '3 × 85, not 3 × 100')
  assert.equal(sale.total, 250, 'menos descuento 5')
  assert.equal(sale.items[0].price, 85)

  await app.close()
})

test('POST /sales rejects an oversell, including across two lines of the same product', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const single = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p2', quantity: 4 }] },
  })
  assert.equal(single.statusCode, 409)

  // 2 + 2 = 4 > stock 3. Each line alone would pass, so this catches the
  // per-line check bug.
  const split = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      items: [
        { productId: 'p2', quantity: 2, selectedColor: 'rosa' },
        { productId: 'p2', quantity: 2, selectedColor: 'azul' },
      ],
    },
  })
  assert.equal(split.statusCode, 409)
  assert.equal(db.products.find((p) => p.id === 'p2').stock, 3, 'nada se descontó')

  await app.close()
})

test('POST /sales decrements once for two lines of the same product', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const res = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      items: [
        { productId: 'p1', quantity: 2, selectedSize: 'S' },
        { productId: 'p1', quantity: 3, selectedSize: 'M' },
      ],
    },
  })

  assert.equal(res.statusCode, 201)
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 5, '10 − 5')
  const movements = db.stockMovements.filter((m) => m.productId === 'p1')
  assert.equal(movements.length, 1, 'un solo movimiento por producto')
  assert.equal(movements[0].quantity, -5)

  await app.close()
})

test('POST /sales rejects a future sale date and requires auth', async () => {
  const { app, auth } = await buildTestApp(seed())

  const future = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: {
      items: [{ productId: 'p1', quantity: 1 }],
      soldAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    },
  })
  assert.equal(future.statusCode, 400)

  const anonymous = await app.inject({
    method: 'POST',
    url: '/sales',
    payload: { items: [{ productId: 'p1', quantity: 1 }] },
  })
  assert.equal(anonymous.statusCode, 401)

  await app.close()
})

test('PATCH /sales/:id cancelling restores stock and records a DEVOLUCION', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const created = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 4 }] },
  })
  const saleId = created.json().id
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 6)

  const cancelled = await app.inject({
    method: 'PATCH',
    url: `/sales/${saleId}`,
    headers: auth(SELLER),
    payload: { status: 'CANCELLED' },
  })

  assert.equal(cancelled.statusCode, 200)
  assert.equal(cancelled.json().status, 'CANCELLED')
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 10, 'stock devuelto')

  const devolucion = db.stockMovements.find((m) => m.type === 'DEVOLUCION')
  assert.ok(devolucion, 'se registró la devolución')
  assert.equal(devolucion.quantity, 4)
  assert.equal(devolucion.stockAfter, 10)

  // Cancelling twice must not credit the stock twice.
  await app.inject({
    method: 'PATCH',
    url: `/sales/${saleId}`,
    headers: auth(SELLER),
    payload: { status: 'CANCELLED' },
  })
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 10, 'sigue en 10')

  await app.close()
})

test('PATCH /sales/:id reopening a cancelled sale takes the stock back out', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const created = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p2', quantity: 3 }], status: 'PAID' },
  })
  const saleId = created.json().id
  assert.equal(db.products.find((p) => p.id === 'p2').stock, 0)

  await app.inject({
    method: 'PATCH',
    url: `/sales/${saleId}`,
    headers: auth(SELLER),
    payload: { status: 'CANCELLED' },
  })
  assert.equal(db.products.find((p) => p.id === 'p2').stock, 3)

  // Someone else sold the units in the meantime -> reopening must fail, not go
  // negative.
  db.products.find((p) => p.id === 'p2').stock = 1
  const blocked = await app.inject({
    method: 'PATCH',
    url: `/sales/${saleId}`,
    headers: auth(SELLER),
    payload: { status: 'PAID' },
  })
  assert.equal(blocked.statusCode, 409)
  assert.equal(db.products.find((p) => p.id === 'p2').stock, 1, 'sin cambios')

  db.products.find((p) => p.id === 'p2').stock = 3
  const reopened = await app.inject({
    method: 'PATCH',
    url: `/sales/${saleId}`,
    headers: auth(SELLER),
    payload: { status: 'PAID' },
  })
  assert.equal(reopened.statusCode, 200)
  assert.equal(db.products.find((p) => p.id === 'p2').stock, 0)

  await app.close()
})

test('a CANCELLED sale never reserves stock in the first place', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const res = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 2 }], status: 'CANCELLED' },
  })

  assert.equal(res.statusCode, 201)
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 10)
  assert.equal(db.stockMovements.length, 0)

  await app.close()
})

test('GET /sales returns every sale and excludes cancelled ones from totals', async () => {
  const { app, auth } = await buildTestApp(seed())

  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 1 }] },
  })
  const second = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p2', quantity: 1 }] },
  })
  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(OTHER),
    payload: { items: [{ productId: 'p3', quantity: 1 }] },
  })

  const listed = await app.inject({ method: 'GET', url: '/sales', headers: auth(SELLER) })
  assert.equal(listed.statusCode, 200)
  const body = listed.json()
  assert.equal(body.sales.length, 3, 'todas las ventas del negocio')
  assert.equal(body.totals.revenue, 230, '100 + 50 + 80')
  assert.equal(body.totals.cogs, 90, '40 + 20 + 30')
  assert.equal(body.totals.grossProfit, 140)

  // Another signed-in session sees exactly the same books.
  const other = await app.inject({ method: 'GET', url: '/sales', headers: auth(OTHER) })
  assert.equal(other.json().sales.length, 3)

  // Cancelling drops it from the money totals but keeps it in the list.
  await app.inject({
    method: 'PATCH',
    url: `/sales/${second.json().id}`,
    headers: auth(SELLER),
    payload: { status: 'CANCELLED' },
  })
  const after = (await app.inject({ method: 'GET', url: '/sales', headers: auth(SELLER) })).json()
  assert.equal(after.sales.length, 3, 'sigue listada')
  assert.equal(after.totals.count, 2)
  assert.equal(after.totals.cancelledCount, 1)
  assert.equal(after.totals.revenue, 180, 'sin los 50 cancelados')

  await app.close()
})

test('GET /sales/:id needs a token, and then shows any sale', async () => {
  const { app, auth } = await buildTestApp(seed())

  const created = await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(OTHER),
    payload: { items: [{ productId: 'p3', quantity: 1 }] },
  })
  const id = created.json().id

  assert.equal((await app.inject({ method: 'GET', url: `/sales/${id}` })).statusCode, 401)
  assert.equal((await app.inject({ method: 'GET', url: `/sales/${id}`, headers: auth(SELLER) })).statusCode, 200)
  assert.equal(
    (await app.inject({ method: 'GET', url: '/sales/no-existe', headers: auth(SELLER) })).statusCode,
    404
  )

  await app.close()
})

test('GET /sales filters by date range inclusively', async () => {
  const { app, auth } = await buildTestApp(seed())

  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 1 }], soldAt: '2026-07-15T14:30:00Z' },
  })
  await app.inject({
    method: 'POST',
    url: '/sales',
    headers: auth(SELLER),
    payload: { items: [{ productId: 'p1', quantity: 1 }], soldAt: '2026-08-02T09:00:00Z' },
  })

  // A same-day from/to must include an afternoon sale, not return nothing.
  const oneDay = await app.inject({
    method: 'GET',
    url: '/sales?from=2026-07-15&to=2026-07-15',
    headers: auth(SELLER),
  })
  assert.equal(oneDay.json().sales.length, 1)

  const july = await app.inject({
    method: 'GET',
    url: '/sales?from=2026-07-01&to=2026-07-31',
    headers: auth(SELLER),
  })
  assert.equal(july.json().sales.length, 1)
  assert.equal(july.json().totals.revenue, 100)

  await app.close()
})
