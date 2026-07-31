import { useEffect, useState } from 'react'
import { fetchProducts } from '../services/productService'
import { getRecentlyViewedIds } from '../utils/recentlyViewed'
import ProductCard from './ProductCard'

export default function RecentlyViewed({ excludeId }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const ids = getRecentlyViewedIds().filter((id) => id !== excludeId)
    if (ids.length === 0) {
      setProducts([])
      return
    }
    fetchProducts().then((all) => {
      const byId = new Map(all.map((p) => [p.id, p]))
      setProducts(ids.map((id) => byId.get(id)).filter(Boolean))
    })
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800">
      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Vistos recientemente</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {products.map((p) => (
          <div key={p.id} className="w-44 flex-shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
