import { prisma } from '../lib/prisma.js'

export async function registerPrisma(app) {
  app.decorate('prisma', prisma)
  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}
