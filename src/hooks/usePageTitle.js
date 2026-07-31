import { useEffect } from 'react'
import { track } from '../utils/analytics'

const BRAND = 'Creaciones Baby'
const DEFAULT_TITLE = 'Creaciones Baby | Modern Heritage Babywear'
const DEFAULT_DESCRIPTION = 'Creaciones Baby: ropa, tecnología inteligente y accesorios premium para bebés en Guatemala. Envíos a todo el país, calidad garantizada.'

export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND}` : DEFAULT_TITLE

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description || DEFAULT_DESCRIPTION)
    }

    track('page_view', { title: title || 'Home', path: window.location.pathname })
  }, [title, description])
}
