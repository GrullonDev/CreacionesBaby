import { z } from 'zod'

const productInput = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().nullable().optional(),
  // Unit cost of goods, used for margin reporting. Optional — plenty of catalog
  // items predate it.
  cost: z.number().min(0).nullable().optional(),
  description: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  features: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
})

function toProduct(product) {
  const images = product.images
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url)
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory || '',
    brand: product.brand || '',
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    description: product.description,
    image: images[0] || '',
    images,
    rating: product.rating,
    reviews: product.reviews,
    features: product.features,
    inStock: product.inStock,
    stock: product.stock,
    createdAt: product.createdAt,
    colors: product.colors,
    sizes: product.sizes,
    cost: product.cost === null || product.cost === undefined ? null : Number(product.cost),
  }
}

export default async function productRoutes(app) {
  const { prisma } = app

  app.get('/products', { preHandler: [app.authenticate] }, async (request) => {
    const { category } = request.query

    const products = await prisma.product.findMany({
      where: category ? { category } : {},
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    })
    return products.map(toProduct)
  })

  app.get('/products/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id },
      include: { images: true },
    })
    if (!product) return reply.code(404).send({ error: 'Product not found' })
    return toProduct(product)
  })

  app.post(
    '/products',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = productInput.safeParse(request.body)
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
      const { images, ...data } = parsed.data

      const product = await prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            ...data,
            inStock: data.stock > 0,
            // Kept populated even though nothing filters on it: single-operator
            // system today, but recording who created a product costs nothing and
            // means adding a second person later is a code change, not a migration.
            sellerId: request.user.sub,
            images: { create: images.map((url, position) => ({ url, position })) },
          },
          include: { images: true },
        })

        // Opening balance, so the movement history explains where the initial
        // units came from instead of starting mid-story.
        if (created.stock > 0) {
          await tx.stockMovement.create({
            data: {
              productId: created.id,
              type: 'ENTRADA',
              quantity: created.stock,
              stockAfter: created.stock,
              reason: 'Stock inicial',
              unitCost: created.cost ?? null,
              createdById: request.user.sub,
            },
          })
        }

        return created
      })
      return reply.code(201).send(toProduct(product))
    }
  )

  app.put(
    '/products/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const existing = await prisma.product.findUnique({ where: { id: request.params.id } })
      if (!existing) return reply.code(404).send({ error: 'Product not found' })

      const parsed = productInput.partial().safeParse(request.body)
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
      const { images, ...data } = parsed.data

      const product = await prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
          where: { id: request.params.id },
          data: {
            ...data,
            ...(data.stock !== undefined ? { inStock: data.stock > 0 } : {}),
            ...(images
              ? { images: { deleteMany: {}, create: images.map((url, position) => ({ url, position })) } }
              : {}),
          },
          include: { images: true },
        })

        // Editing the stock field on the product form is still a stock change,
        // so it gets a movement too — otherwise the inventory history has holes
        // exactly where someone corrected a number by hand.
        if (data.stock !== undefined && data.stock !== existing.stock) {
          await tx.stockMovement.create({
            data: {
              productId: updated.id,
              type: 'AJUSTE',
              quantity: data.stock - existing.stock,
              stockAfter: data.stock,
              reason: 'Editado desde la ficha del producto',
              createdById: request.user.sub,
            },
          })
        }

        return updated
      })
      return toProduct(product)
    }
  )

  app.delete(
    '/products/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const existing = await prisma.product.findUnique({ where: { id: request.params.id } })
      if (!existing) return reply.code(404).send({ error: 'Product not found' })
      await prisma.product.delete({ where: { id: request.params.id } })
      return reply.code(204).send()
    }
  )
}
