// Dev-only convenience: there's no self-service way to become ADMIN (the
// public POST /auth/register route only accepts role USER/SELLER, on
// purpose). This script upserts one ADMIN account by email so you have
// something to log in with and test admin-gated behavior — it's the only
// way to get an ADMIN account today short of hand-editing the database.
//
// Usage:
//   npm run seed:admin
//   ADMIN_EMAIL=you@test.com ADMIN_PASSWORD=somethingsecure npm run seed:admin
//
// Safe to re-run: if the email already exists, it's promoted to ADMIN and
// its password is reset to ADMIN_PASSWORD (or left alone if not provided
// and the account already exists) rather than erroring out.
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const email = process.env.ADMIN_EMAIL || 'admin@creacionesbaby.test'
const password = process.env.ADMIN_PASSWORD || 'admin12345'
const name = process.env.ADMIN_NAME || 'Admin'

async function main() {
  const passwordHash = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', ...(process.env.ADMIN_PASSWORD ? { passwordHash } : {}) },
    create: { email, name, passwordHash, role: 'ADMIN' },
  })

  console.log(existing ? 'Promoted existing user to ADMIN:' : 'Created ADMIN user:')
  console.log(`  email:    ${user.email}`)
  console.log(`  password: ${existing && !process.env.ADMIN_PASSWORD ? '(unchanged — set ADMIN_PASSWORD to reset it)' : password}`)
  console.log(`  role:     ${user.role}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
