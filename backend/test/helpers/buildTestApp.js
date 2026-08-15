import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { createFakePrisma } from './fakePrisma.js'
import productRoutes from '../../src/routes/products.js'
import salesRoutes from '../../src/routes/sales.js'
import financeRoutes from '../../src/routes/finance.js'
import stockRoutes from '../../src/routes/stock.js'
import reportRoutes from '../../src/routes/reports.js'

const TEST_SECRET = 'test-secret-not-used-anywhere-real'

/**
 * Build the real route handlers on top of a fake Prisma and a real JWT plugin,
 * so requests exercise the actual auth/ownership/validation code paths — the
 * only thing swapped out is the database.
 */
export async function buildTestApp(seed = {}) {
  const { client, db } = createFakePrisma(seed)

  const app = Fastify({ logger: false })
  app.decorate('prisma', client)

  await app.register(fastifyJwt, { secret: TEST_SECRET })
  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })
  app.decorate('requireRole', (...roles) => async (request, reply) => {
    if (!roles.includes(request.user?.role)) reply.code(403).send({ error: 'Forbidden' })
  })

  await app.register(productRoutes)
  await app.register(salesRoutes)
  await app.register(financeRoutes)
  await app.register(stockRoutes)
  await app.register(reportRoutes)
  await app.ready()

  const tokenFor = (sub, role = 'ADMIN') => app.jwt.sign({ sub, role })
  const auth = (sub, role) => ({ authorization: `Bearer ${tokenFor(sub, role)}` })

  return { app, db, tokenFor, auth }
}
