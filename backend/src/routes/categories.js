export default async function categoryRoutes(app) {
  const { prisma } = app

  app.get('/categories', async () => {
    const rows = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    })
    return rows.map((r) => r.category)
  })
}
