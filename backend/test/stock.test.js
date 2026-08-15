import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildTestApp } from './helpers/buildTestApp.js'

const SELLER = 'user-1'
const OTHER = 'user-2'

function seed() {
  return {
    products: [
      { id: 'p1', name: 'Mantita', category: 'baby_gear', price: 100, cost: 40, stock: 10, sellerId: SELLER },
      { id: 'p3', name: 'Calcetines', category: 'baby_gear', price: 80, stock: 5, sellerId: OTHER },
    ],
  }
}

test('POST /stock-movements ENTRADA adds stock, MERMA removes it', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const entrada = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'ENTRADA', quantity: 5, reason: 'Producción semanal', unitCost: 38 },
  })
  assert.equal(entrada.statusCode, 201)
  assert.equal(entrada.json().quantity, 5, 'ENTRADA es positiva')
  assert.equal(entrada.json().stockAfter, 15)
  assert.equal(entrada.json().unitCost, 38)
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 15)

  const merma = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'MERMA', quantity: 2, reason: 'Manchada' },
  })
  assert.equal(merma.statusCode, 201)
  assert.equal(merma.json().quantity, -2, 'MERMA es negativa')
  assert.equal(merma.json().stockAfter, 13)
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 13)

  await app.close()
})

test('POST /stock-movements AJUSTE stores the delta needed to reach the counted total', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const down = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'AJUSTE', newStock: 7, reason: 'Conteo físico' },
  })
  assert.equal(down.statusCode, 201)
  assert.equal(down.json().quantity, -3, '10 -> 7')
  assert.equal(down.json().stockAfter, 7)

  const up = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'AJUSTE', newStock: 9 },
  })
  assert.equal(up.json().quantity, 2, '7 -> 9')
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 9)

  // An AJUSTE without a target count is a client bug, not a no-op.
  const missing = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'AJUSTE' },
  })
  assert.equal(missing.statusCode, 400)

  // Adjusting to the same number changes nothing and shouldn't litter history.
  const noop = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'AJUSTE', newStock: 9 },
  })
  assert.equal(noop.statusCode, 400)

  await app.close()
})

test('POST /stock-movements never lets stock go negative', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const res = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'SALIDA', quantity: 99 },
  })

  assert.equal(res.statusCode, 409)
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 10)
  assert.equal(db.stockMovements.length, 0)

  await app.close()
})

test('POST /stock-movements rejects VENTA — only a sale may write one', async () => {
  const { app, auth } = await buildTestApp(seed())

  const venta = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'VENTA', quantity: 1 },
  })
  assert.equal(venta.statusCode, 400, 'VENTA no se registra a mano')

  const unknown = await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'no-existe', type: 'ENTRADA', quantity: 1 },
  })
  assert.equal(unknown.statusCode, 404)

  await app.close()
})

test('GET /stock-movements returns the whole history and needs a token', async () => {
  const { app, auth } = await buildTestApp(seed())

  await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(SELLER),
    payload: { productId: 'p1', type: 'ENTRADA', quantity: 3 },
  })
  await app.inject({
    method: 'POST',
    url: '/stock-movements',
    headers: auth(OTHER),
    payload: { productId: 'p3', type: 'ENTRADA', quantity: 4 },
  })

  assert.equal((await app.inject({ method: 'GET', url: '/stock-movements' })).statusCode, 401)

  const all = (await app.inject({ method: 'GET', url: '/stock-movements', headers: auth(SELLER) })).json()
  assert.equal(all.movements.length, 2)

  const filtered = (
    await app.inject({ method: 'GET', url: '/stock-movements?productId=p1', headers: auth(SELLER) })
  ).json()
  assert.equal(filtered.movements.length, 1)
  assert.equal(filtered.movements[0].productName, 'Mantita')

  await app.close()
})

test('editing a product’s stock records an AJUSTE so history has no holes', async () => {
  const { app, db, auth } = await buildTestApp(seed())

  const res = await app.inject({
    method: 'PUT',
    url: '/products/p1',
    headers: auth(SELLER),
    payload: { stock: 4 },
  })

  assert.equal(res.statusCode, 200)
  assert.equal(db.products.find((p) => p.id === 'p1').stock, 4)
  const ajuste = db.stockMovements.find((m) => m.type === 'AJUSTE')
  assert.ok(ajuste, 'el cambio quedó registrado')
  assert.equal(ajuste.quantity, -6)
  assert.equal(ajuste.stockAfter, 4)

  await app.close()
})

test('creating a product with stock records the opening balance', async () => {
  const { app, db, auth } = await buildTestApp({ products: [] })

  const res = await app.inject({
    method: 'POST',
    url: '/products',
    headers: auth(SELLER),
    payload: {
      name: 'Body manga larga',
      category: 'baby_gear',
      description: 'Algodón peinado',
      price: 75,
      cost: 30,
      stock: 12,
      images: ['https://example.com/body.jpg'],
    },
  })

  assert.equal(res.statusCode, 201)
  assert.equal(res.json().cost, 30, 'el dueño sí ve el costo')
  const entrada = db.stockMovements.find((m) => m.type === 'ENTRADA')
  assert.ok(entrada)
  assert.equal(entrada.quantity, 12)
  assert.equal(entrada.reason, 'Stock inicial')

  await app.close()
})

test('the catalog is internal — no route is reachable without a token', async () => {
  const { app, auth } = await buildTestApp(seed())

  // There is no public storefront any more, so nothing about the catalog —
  // least of all cost — is readable anonymously.
  for (const url of ['/products', '/products/p1']) {
    assert.equal((await app.inject({ method: 'GET', url })).statusCode, 401, `${url} sin token`)
  }
  assert.equal(
    (await app.inject({ method: 'POST', url: '/products', payload: { name: 'x' } })).statusCode,
    401
  )

  const list = await app.inject({ method: 'GET', url: '/products', headers: auth(SELLER) })
  assert.equal(list.statusCode, 200)
  assert.equal(list.json().find((p) => p.id === 'p1').cost, 40, 'con token sí trae el costo')

  await app.close()
})
