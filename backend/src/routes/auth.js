import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['USER', 'SELLER']).default('USER'),
})

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export default async function authRoutes(app) {
  const { prisma } = app

  app.post('/auth/register', async (request, reply) => {
    const parsed = registerInput.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { name, email, password, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return reply.code(409).send({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, passwordHash, role } })
    const token = app.jwt.sign({ sub: user.id, role: user.role })
    return reply.code(201).send({ token, user: toPublicUser(user) })
  })

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginInput.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }
    const token = app.jwt.sign({ sub: user.id, role: user.role })
    return { token, user: toPublicUser(user) }
  })

  app.get('/auth/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.sub } })
    if (!user) return reply.code(404).send({ error: 'User not found' })
    return toPublicUser(user)
  })
}
