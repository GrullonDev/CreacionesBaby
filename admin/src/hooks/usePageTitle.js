import { useEffect } from 'react'

const BRAND = 'Panel de Vendedor | Creaciones Baby'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND}` : BRAND
  }, [title])
}
