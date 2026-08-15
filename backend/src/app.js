import Fastify from 'fastify'
import cors from '@fastify/cors'
import { registerPrisma } from './plugins/prisma.js'
import { registerAuth } from './plugins/auth.js'
import productRoutes from './routes/products.js'
import authRoutes from './routes/auth.js'
import salesRoutes from './routes/sales.js'
import financeRoutes from './routes/finance.js'
import stockRoutes from './routes/stock.js'
import reportRoutes from './routes/reports.js'

/**
 * Internal back-office API: inventory, sales, cash ledger and reports.
 *
 * Every route except /health and /auth/* requires a token — there is no public
 * surface. The storefront this once served was retired; selling happens on an
 * external platform and its sales are recorded here like any other channel.
 */
export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  })
  await registerPrisma(app)
  await registerAuth(app)

  app.get('/health', async () => ({ status: 'ok' }))

  await app.register(productRoutes)
  await app.register(authRoutes)
  await app.register(salesRoutes)
  await app.register(financeRoutes)
  await app.register(stockRoutes)
  await app.register(reportRoutes)

  return app
}
