import { z } from 'zod'

const orderInput = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        selectedColor: z.string().optional(),
        selectedSize: z.string().optional(),
      })
    )
    .min(1),
  address: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
  }),
  promoCode: z.string().nullable().optional(),
  discount: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
})

function toStorefrontOrder(order) {
  return {
    id: order.id,
    date: order.createdAt,
    status: order.status,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      quantity: item.quantity,
      price: Number(item.price),
      selectedColor: item.selectedColor || undefined,
      selectedSize: item.selectedSize || undefined,
    })),
    subtotal: order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    discount: Number(order.discount),
    promoCode: order.promoCode,
    shipping: Number(order.shipping),
    total: Number(order.total),
    address: {
      name: order.addressName,
      email: order.addressEmail,
      address: order.addressLine,
      city: order.addressCity,
      zip: order.addressZip,
    },
  }
}

export default async function orderRoutes(app) {
  const { prisma } = app

  app.post('/orders', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = orderInput.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { items, address, promoCode, discount, shipping } = parsed.data

    const productIds = [...new Set(items.map((i) => i.productId))]
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const productMap = new Map(products.map((p) => [p.id, p]))

    const missing = productIds.filter((id) => !productMap.has(id))
    if (missing.length > 0) {
      return reply.code(400).send({ error: `Unknown product(s): ${missing.join(', ')}` })
    }
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (product.stock < item.quantity) {
        return reply.code(409).send({ error: `Insufficient stock for "${product.name}"` })
      }
    }

    const subtotal = items.reduce((sum, item) => sum + Number(productMap.get(item.productId).price) * item.quantity, 0)
    const total = Math.max(0, subtotal - discount + shipping)

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: request.user.sub,
          total,
          discount,
          shipping,
          promoCode: promoCode || null,
          addressName: address.name,
          addressEmail: address.email,
          addressLine: address.address,
          addressCity: address.city,
          addressZip: address.zip,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productMap.get(item.productId).price,
              selectedColor: item.selectedColor || null,
              selectedSize: item.selectedSize || null,
            })),
          },
        },
        include: { items: { include: { product: { include: { images: true } } } } },
      })

      for (const item of items) {
        const product = productMap.get(item.productId)
        const newStock = product.stock - item.quantity
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock, inStock: newStock > 0 },
        })
      }

      return created
    })

    return reply.code(201).send(toStorefrontOrder(order))
  })

  app.get('/orders', { preHandler: [app.authenticate] }, async (request) => {
    const orders = await prisma.order.findMany({
      where: { userId: request.user.sub },
      include: { items: { include: { product: { include: { images: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(toStorefrontOrder)
  })

  app.get('/orders/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const order = await prisma.order.findUnique({
      where: { id: request.params.id },
      include: { items: { include: { product: { include: { images: true } } } } },
    })
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    if (order.userId !== request.user.sub && request.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    return toStorefrontOrder(order)
  })
}
