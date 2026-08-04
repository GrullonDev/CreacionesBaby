import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import products from '../../src/data/products.js'

const prisma = new PrismaClient()

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: `mock-${p.id}` },
      update: {},
      create: {
        id: `mock-${p.id}`,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        brand: p.brand,
        price: p.price,
        originalPrice: p.originalPrice,
        description: p.description,
        rating: p.rating,
        reviews: p.reviews,
        features: p.features,
        inStock: p.inStock,
        stock: p.stock,
        colors: p.colors,
        sizes: p.sizes,
        images: { create: p.images.map((url, position) => ({ url, position })) },
      },
    })
  }
  console.log(`Seeded ${products.length} products.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
