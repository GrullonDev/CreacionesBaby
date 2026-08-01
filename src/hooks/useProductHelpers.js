import { useMemo } from 'react'

export function useProductDiscount(product) {
  return useMemo(() => {
    if (!product.originalPrice) return 0
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }, [product.originalPrice, product.price])
}

export function useProductBadge(product) {
  const discountPercent = useProductDiscount(product)

  return useMemo(() => {
    if (discountPercent > 0) {
      return {
        text: `Sale -${discountPercent}%`,
        className: 'bg-red-50 text-red-600 border border-red-200'
      }
    }
    if (product.createdAt && new Date(product.createdAt) > new Date('2025-01-01')) {
      return {
        text: 'New',
        className: 'bg-slate-50 text-slate-700 border border-slate-200'
      }
    }
    if (product.rating >= 4.9) {
      return {
        text: 'Popular',
        className: 'bg-sky-50 text-sky-600 border border-sky-200'
      }
    }
    return null
  }, [discountPercent, product.createdAt, product.rating])
}

export function useCategoryTheme(category) {
  return useMemo(() => {
    switch (category) {
      case 'smart_tech':
      case 'audio_gear':
      case 'wearables':
        return {
          label: category.replace('_', ' ').toUpperCase(),
          btnBg: 'bg-tech-blue hover:bg-sky-700 text-white',
          textClass: 'text-tech-blue'
        }
      case 'streaming':
        return {
          label: 'STREAMING',
          btnBg: 'bg-stream-purple hover:bg-violet-700 text-white',
          textClass: 'text-stream-purple'
        }
      default:
        return {
          label: 'BABY GEAR',
          btnBg: 'bg-[#5c4c3e] hover:bg-[#4a3e35] text-white',
          textClass: 'text-[#5c4c3e]'
        }
    }
  }, [category])
}

export function useStockStatus(product) {
  return useMemo(() => {
    if (!product.inStock) return { status: 'out', text: 'Agotado', className: 'bg-slate-800 text-white' }
    if (product.stock !== undefined && product.stock <= 5) {
      return { status: 'low', text: `¡${product.stock} restantes!`, className: 'bg-red-50 text-red-600 border border-red-200' }
    }
    return { status: 'in', text: '', className: '' }
  }, [product.inStock, product.stock])
}

export function useFormatCurrency() {
  return (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
}