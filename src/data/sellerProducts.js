import { putImage, getImageBlob, deleteImage } from '../utils/imageStore'

const STORAGE_KEY = 'creaciones_seller_products'

export const SELLER_CATEGORIES = [
  { id: 'baby_gear', label: 'Baby Essentials' },
  { id: 'smart_tech', label: 'Smart Technology' },
  { id: 'audio_gear', label: 'Audio Gear' },
  { id: 'wearables', label: 'Nursery Tech' },
]

const urlCache = new Map()

function loadRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

async function resolveImageUrl(imageId) {
  if (urlCache.has(imageId)) return urlCache.get(imageId)
  const blob = await getImageBlob(imageId)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(imageId, url)
  return url
}

function categoryLabel(categoryId) {
  return SELLER_CATEGORIES.find((c) => c.id === categoryId)?.label || ''
}

async function toStorefrontProduct(record) {
  const urls = (await Promise.all(record.imageIds.map(resolveImageUrl))).filter(Boolean)
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    subcategory: categoryLabel(record.category),
    brand: record.brand || 'Creaciones Baby',
    price: record.price,
    originalPrice: null,
    description: record.description,
    image: urls[0] || '',
    images: urls,
    rating: 0,
    reviews: 0,
    features: [],
    inStock: record.stock > 0,
    stock: record.stock,
    createdAt: record.createdAt,
    colors: [],
    sizes: [],
    isSellerProduct: true,
  }
}

export async function getSellerProducts() {
  const records = loadRecords()
  return Promise.all(records.map(toStorefrontProduct))
}

export async function getSellerProductById(id) {
  const record = loadRecords().find((r) => String(r.id) === String(id))
  return record ? toStorefrontProduct(record) : null
}

export function getSellerProductRawById(id) {
  return loadRecords().find((r) => String(r.id) === String(id)) || null
}

export async function getSellerProductImageUrls(record) {
  return (await Promise.all(record.imageIds.map(resolveImageUrl))).filter(Boolean)
}

export async function addSellerProduct(input, files) {
  const imageIds = await Promise.all(files.map(putImage))
  const record = {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category,
    brand: input.brand?.trim() || '',
    price: Number(input.price),
    stock: Number(input.stock),
    imageIds,
    createdAt: new Date().toISOString(),
  }
  const records = loadRecords()
  records.unshift(record)
  saveRecords(records)
  return toStorefrontProduct(record)
}

export async function updateSellerProduct(id, input, newFiles = [], removedImageIds = []) {
  const records = loadRecords()
  const idx = records.findIndex((r) => String(r.id) === String(id))
  if (idx === -1) throw new Error('Producto no encontrado')

  await Promise.all(removedImageIds.map(deleteImage))
  removedImageIds.forEach((rid) => urlCache.delete(rid))

  const newIds = await Promise.all(newFiles.map(putImage))
  const record = {
    ...records[idx],
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category,
    brand: input.brand?.trim() || '',
    price: Number(input.price),
    stock: Number(input.stock),
    imageIds: [
      ...records[idx].imageIds.filter((iid) => !removedImageIds.includes(iid)),
      ...newIds,
    ],
  }
  records[idx] = record
  saveRecords(records)
  return toStorefrontProduct(record)
}

export async function deleteSellerProduct(id) {
  const records = loadRecords()
  const record = records.find((r) => String(r.id) === String(id))
  if (!record) return
  await Promise.all(record.imageIds.map(deleteImage))
  record.imageIds.forEach((iid) => urlCache.delete(iid))
  saveRecords(records.filter((r) => String(r.id) !== String(id)))
}
