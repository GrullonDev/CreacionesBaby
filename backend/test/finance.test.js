import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildTestApp } from './helpers/buildTestApp.js'

const SELLER = 'seller-1'
const OTHER = 'seller-2'

test('POST /finance-entries records an egreso and totals it', async () => {
  const { app, auth } = await buildTestApp()

  const res = await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: {
      direction: 'EGRESO',
      category: 'MATERIA_PRIMA',
      description: 'Tela algodón 20 yardas',
      amount: 480.5,
      paymentMethod: 'EFECTIVO',
      counterparty: 'Textiles del Centro',
      reference: 'FAC-1029',
      occurredAt: '2026-08-01',
    },
  })

  assert.equal(res.statusCode, 201)
  assert.equal(res.json().amount, 480.5)
  assert.equal(res.json().counterparty, 'Textiles del Centro')

  const list = (await app.inject({ method: 'GET', url: '/finance-entries', headers: auth(SELLER) })).json()
  assert.equal(list.entries.length, 1)
  assert.equal(list.totals.egresos, 480.5)
  assert.equal(list.totals.ingresos, 0)
  assert.equal(list.totals.balance, -480.5)

  await app.close()
})

test('a category from the wrong direction is rejected', async () => {
  const { app, auth } = await buildTestApp()

  const wrong = await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: {
      direction: 'EGRESO',
      category: 'APORTE_CAPITAL',
      description: 'Mal clasificado',
      amount: 100,
    },
  })
  assert.equal(wrong.statusCode, 400, 'APORTE_CAPITAL no es un egreso')

  const right = await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: {
      direction: 'INGRESO',
      category: 'APORTE_CAPITAL',
      description: 'Aporte inicial',
      amount: 2000,
    },
  })
  assert.equal(right.statusCode, 201)

  await app.close()
})

test('amounts must be positive — direction carries the sign', async () => {
  const { app, auth } = await buildTestApp()

  for (const amount of [0, -50]) {
    const res = await app.inject({
      method: 'POST',
      url: '/finance-entries',
      headers: auth(SELLER),
      payload: { direction: 'EGRESO', category: 'ENVIO', description: 'Guía', amount },
    })
    assert.equal(res.statusCode, 400, `monto ${amount} rechazado`)
  }

  await app.close()
})

test('the ledger is shared — one operator, one set of books', async () => {
  const { app, auth } = await buildTestApp()

  await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: { direction: 'EGRESO', category: 'RENTA', description: 'Local agosto', amount: 1500 },
  })
  const second = await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(OTHER),
    payload: { direction: 'EGRESO', category: 'PUBLICIDAD', description: 'Anuncios', amount: 200 },
  })

  // No per-user scoping: whoever is signed in sees the whole ledger.
  for (const who of [SELLER, OTHER]) {
    const list = (await app.inject({ method: 'GET', url: '/finance-entries', headers: auth(who) })).json()
    assert.equal(list.entries.length, 2)
    assert.equal(list.totals.egresos, 1700)
  }

  // ...and can correct any of it.
  const id = second.json().id
  const edit = await app.inject({
    method: 'PUT',
    url: `/finance-entries/${id}`,
    headers: auth(SELLER),
    payload: { amount: 250 },
  })
  assert.equal(edit.statusCode, 200)
  assert.equal(edit.json().amount, 250)

  const remove = await app.inject({
    method: 'DELETE',
    url: `/finance-entries/${id}`,
    headers: auth(SELLER),
  })
  assert.equal(remove.statusCode, 204)

  await app.close()
})

test('the ledger still requires a token', async () => {
  const { app } = await buildTestApp()
  assert.equal((await app.inject({ method: 'GET', url: '/finance-entries' })).statusCode, 401)
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/finance-entries',
        payload: { direction: 'EGRESO', category: 'ENVIO', description: 'x', amount: 1 },
      })
    ).statusCode,
    401
  )
  await app.close()
})

test('PUT validates the merged entry, not just the patch', async () => {
  const { app, auth } = await buildTestApp()

  const created = await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: { direction: 'EGRESO', category: 'ENVIO', description: 'Guías', amount: 75 },
  })
  const id = created.json().id

  // Sending only a category that belongs to the other direction must fail,
  // because the stored direction is still EGRESO.
  const bad = await app.inject({
    method: 'PUT',
    url: `/finance-entries/${id}`,
    headers: auth(SELLER),
    payload: { category: 'PRESTAMO' },
  })
  assert.equal(bad.statusCode, 400)

  const good = await app.inject({
    method: 'PUT',
    url: `/finance-entries/${id}`,
    headers: auth(SELLER),
    payload: { amount: 90, category: 'EMPAQUE' },
  })
  assert.equal(good.statusCode, 200)
  assert.equal(good.json().amount, 90)
  assert.equal(good.json().category, 'EMPAQUE')
  assert.equal(good.json().description, 'Guías', 'lo no enviado se conserva')

  await app.close()
})

test('the ledger filters by direction and date range', async () => {
  const { app, auth } = await buildTestApp()

  await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: {
      direction: 'EGRESO',
      category: 'MATERIA_PRIMA',
      description: 'Julio',
      amount: 100,
      occurredAt: '2026-07-10',
    },
  })
  await app.inject({
    method: 'POST',
    url: '/finance-entries',
    headers: auth(SELLER),
    payload: {
      direction: 'INGRESO',
      category: 'OTRO_INGRESO',
      description: 'Agosto',
      amount: 300,
      occurredAt: '2026-08-05',
    },
  })

  const egresos = (
    await app.inject({ method: 'GET', url: '/finance-entries?direction=EGRESO', headers: auth(SELLER) })
  ).json()
  assert.equal(egresos.entries.length, 1)
  assert.equal(egresos.totals.egresos, 100)

  const august = (
    await app.inject({
      method: 'GET',
      url: '/finance-entries?from=2026-08-01&to=2026-08-31',
      headers: auth(SELLER),
    })
  ).json()
  assert.equal(august.entries.length, 1)
  assert.equal(august.totals.ingresos, 300)

  await app.close()
})
