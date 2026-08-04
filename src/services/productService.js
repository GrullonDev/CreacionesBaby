import api from './api'
import { getProducts, getProductById, getRelatedProducts, getFeaturedProducts, getCategories } from '../data/products'
import { getSellerProducts, getSellerProductById } from '../data/sellerProducts'

const USE_API = Boolean(import.meta.env.VITE_API_URL)

export function fetchProducts(filters = {}) {
  if (USE_API) {
    return api.get('/products', { params: filters }).then((res) => res.data)
  }
  return Promise.all([getSellerProducts(), getProducts()]).then(([seller, mock]) => [...seller, ...mock])
}

export function fetchProductById(id) {
  if (USE_API) {
    return api.get(`/products/${id}`).then((res) => res.data)
  }
  return getSellerProductById(id).then((product) => product || getProductById(id))
}

export function fetchRelatedProducts(category, currentId) {
  if (USE_API) {
    return api.get('/products', { params: { category, exclude: currentId } }).then((res) => res.data)
  }
  return Promise.all([getSellerProducts(), getRelatedProducts(category, currentId)]).then(
    ([seller, mock]) => {
      const sellerMatches = seller.filter(
        (p) => p.category === category && String(p.id) !== String(currentId)
      )
      return [...sellerMatches, ...mock].slice(0, 4)
    }
  )
}

export function fetchFeaturedProducts() {
  if (USE_API) {
    return api.get('/products', { params: { featured: true } }).then((res) => res.data)
  }
  return getFeaturedProducts()
}

export function fetchCategories() {
  if (USE_API) {
    return api.get('/categories').then((res) => res.data)
  }
  return Promise.all([getSellerProducts(), getCategories()]).then(([seller, mock]) => [
    ...new Set([...seller.map((p) => p.category), ...mock]),
  ])
}
