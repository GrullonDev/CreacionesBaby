import { z } from 'zod'

const productInput = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().nullable().optional(),
  description: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  features: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
})

function toStorefrontProduct(product) {
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
    isSellerProduct: Boolean(product.sellerId),
  }
}

export default async function productRoutes(app) {
  const { prisma } = app

  app.get('/products', async (request) => {
    const { category, featured, exclude } = request.query
    const where = {
      ...(category ? { category } : {}),
      ...(exclude ? { id: { not: exclude } } : {}),
    }
    const products = await prisma.product.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
      ...(featured ? { take: 4 } : {}),
    })
    return products.map(toStorefrontProduct)
  })

  app.get('/products/:id', async (request, reply) => {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id },
      include: { images: true },
    })
    if (!product) return reply.code(404).send({ error: 'Product not found' })
    return toStorefrontProduct(product)
  })

  app.post(
    '/products',
    { preHandler: [app.authenticate, app.requireRole('SELLER', 'ADMIN')] },
    async (request, reply) => {
      const parsed = productInput.safeParse(request.body)
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
      const { images, ...data } = parsed.data

      const product = await prisma.product.create({
        data: {
          ...data,
          inStock: data.stock > 0,
          sellerId: request.user.sub,
          images: { create: images.map((url, position) => ({ url, position })) },
        },
        include: { images: true },
      })
      return reply.code(201).send(toStorefrontProduct(product))
    }
  )

  app.put(
    '/products/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const existing = await prisma.product.findUnique({ where: { id: request.params.id } })
      if (!existing) return reply.code(404).send({ error: 'Product not found' })
      if (existing.sellerId !== request.user.sub && request.user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden' })
      }

      const parsed = productInput.partial().safeParse(request.body)
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
      const { images, ...data } = parsed.data

      const product = await prisma.product.update({
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
      return toStorefrontProduct(product)
    }
  )

  app.delete(
    '/products/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const existing = await prisma.product.findUnique({ where: { id: request.params.id } })
      if (!existing) return reply.code(404).send({ error: 'Product not found' })
      if (existing.sellerId !== request.user.sub && request.user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      await prisma.product.delete({ where: { id: request.params.id } })
      return reply.code(204).send()
    }
  )
}
