// Dev-only convenience: lists registered users from the console so you can
// check what's already there (e.g. "do I already have an ADMIN account?")
// before creating a new one with seed:admin.
//
// Deliberately never prints `passwordHash` — bcrypt hashes are one-way, so
// showing it wouldn't let anyone recover the real password anyway, and
// printing hashes around casually is just a bad habit even in dev.
//
// Usage:
//   npm run users:list                 # everyone
//   ROLE=ADMIN npm run users:list       # only ADMIN accounts
//   ROLE=SELLER npm run users:list
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const role = process.env.ROLE?.toUpperCase()

async function main() {
  if (role && !['USER', 'SELLER', 'ADMIN'].includes(role)) {
    console.error(`ROLE debe ser USER, SELLER o ADMIN (recibido: "${role}")`)
    process.exit(1)
  }

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  if (users.length === 0) {
    console.log(role ? `No hay usuarios con rol ${role}.` : 'No hay usuarios registrados todavía.')
    return
  }

  console.log(`${users.length} usuario(s)${role ? ` con rol ${role}` : ''}:\n`)
  for (const u of users) {
    console.log(`  ${u.email}`)
    console.log(`    nombre:  ${u.name}`)
    console.log(`    rol:     ${u.role}`)
    console.log(`    id:      ${u.id}`)
    console.log(`    creado:  ${u.createdAt.toISOString()}`)
    console.log('')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
