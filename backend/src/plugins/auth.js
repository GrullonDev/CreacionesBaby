import fastifyJwt from '@fastify/jwt'

export async function registerAuth(app) {
  app.register(fastifyJwt, { secret: process.env.JWT_SECRET })

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  app.decorate('requireRole', (...roles) => async (request, reply) => {
    if (!roles.includes(request.user?.role)) {
      reply.code(403).send({ error: 'Forbidden' })
    }
  })
}
