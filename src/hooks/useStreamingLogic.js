import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchProducts } from '../services/productService'

const SUB_THEMES = {
  netflix: {
    bgGrad: 'from-red-950/90 to-black',
    badgeBg: 'bg-red-600 text-white',
    cartBg: 'bg-red-600 hover:bg-red-700 text-white',
    accentBorder: 'border-red-500/20',
  },
  disney: {
    bgGrad: 'from-blue-950/90 to-black',
    badgeBg: 'bg-sky-600 text-white',
    cartBg: 'bg-sky-600 hover:bg-sky-700 text-white',
    accentBorder: 'border-sky-500/20',
  },
  hbo: {
    bgGrad: 'from-violet-950/90 to-black',
    badgeBg: 'bg-purple-600 text-white',
    cartBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    accentBorder: 'border-purple-500/20',
  },
  spotify: {
    bgGrad: 'from-emerald-950/90 to-black',
    badgeBg: 'bg-emerald-500 text-black',
    cartBg: 'bg-emerald-500 hover:bg-emerald-600 text-black',
    accentBorder: 'border-emerald-500/20',
  },
}

const DEFAULT_SUB_THEME = {
  bgGrad: 'from-[#5c4c3e]/90 to-black',
  badgeBg: 'bg-[#5c4c3e] text-white',
  cartBg: 'bg-[#5c4c3e] hover:bg-stone-700 text-white',
  accentBorder: 'border-stone-500/20',
}

export function useStreamingLogic() {
  const [streamingItems, setStreamingItems] = useState([])

  useEffect(() => {
    fetchProducts().then((all) => {
      setStreamingItems(all.filter((p) => p.category === 'streaming'))
    })
  }, [])

  const handleAdd = useCallback((item, addItem, addToast) => {
    addItem(item)
    addToast(`${item.name} añadido al carrito`)
  }, [])

  const getSubTheme = useCallback(
    (brand) => SUB_THEMES[brand.toLowerCase()] || DEFAULT_SUB_THEME,
    []
  )

  const featuredItems = useMemo(() => streamingItems.slice(0, 4), [streamingItems])

  return {
    streamingItems,
    featuredItems,
    handleAdd,
    getSubTheme,
  }
}
