import Fastify from 'fastify'
import cors from '@fastify/cors'
import { registerPrisma } from './plugins/prisma.js'
import { registerAuth } from './plugins/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import authRoutes from './routes/auth.js'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  })
  await registerPrisma(app)
  await registerAuth(app)

  app.get('/health', async () => ({ status: 'ok' }))

  await app.register(productRoutes)
  await app.register(categoryRoutes)
  await app.register(authRoutes)

  return app
}
