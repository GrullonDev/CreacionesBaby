import { useEffect } from 'react'

const BRAND = 'Creaciones Baby'
const DEFAULT_TITLE = 'Creaciones Baby | Modern Heritage Babywear'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND}` : DEFAULT_TITLE
  }, [title])
}
