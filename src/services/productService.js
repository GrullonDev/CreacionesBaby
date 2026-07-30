import api from './api'
import { getProducts, getProductById, getRelatedProducts, getFeaturedProducts, getCategories } from '../data/products'

const USE_API = Boolean(import.meta.env.VITE_API_URL)

export function fetchProducts(filters = {}) {
  if (USE_API) {
    return api.get('/products', { params: filters }).then((res) => res.data)
  }
  return getProducts()
}

export function fetchProductById(id) {
  if (USE_API) {
    return api.get(`/products/${id}`).then((res) => res.data)
  }
  return getProductById(id)
}

export function fetchRelatedProducts(category, currentId) {
  if (USE_API) {
    return api.get('/products', { params: { category, exclude: currentId } }).then((res) => res.data)
  }
  return getRelatedProducts(category, currentId)
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
  return getCategories()
}
