import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SELLER_CATEGORIES,
  getSellerProductRawById,
  getSellerProductImageUrls,
  addSellerProduct,
  updateSellerProduct,
} from '../data/sellerProducts'
import { useToast } from '../context/useToast'

const EMPTY_FORM = { name: '', description: '', category: '', brand: '', price: '', stock: '' }

export function useSellerProductForm(id) {
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [form, setForm] = useState(EMPTY_FORM)
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const newImageKey = useRef(0)

  useEffect(() => {
    if (!isEditMode) return
    const record = getSellerProductRawById(id)
    if (!record) {
      setLoading(false)
      return
    }
    setForm({
      name: record.name,
      description: record.description,
      category: record.category,
      brand: record.brand || '',
      price: String(record.price),
      stock: String(record.stock),
    })
    getSellerProductImageUrls(record).then((urls) => {
      setExistingImages(record.imageIds.map((imgId, i) => ({ id: imgId, url: urls[i] })).filter((img) => img.url))
      setLoading(false)
    })
  }, [id, isEditMode])

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setField = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
  }, [])

  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    const additions = files.map((file) => ({
      key: `new-${newImageKey.current++}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setNewImages((prev) => [...prev, ...additions])
  }, [])

  const removeExistingImage = useCallback((imgId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imgId))
    setRemovedImageIds((prev) => [...prev, imgId])
  }, [])

  const removeNewImage = useCallback((key) => {
    setNewImages((prev) => {
      const target = prev.find((img) => img.key === key)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.key !== key)
    })
  }, [])

  const validate = useCallback(() => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El título es obligatorio'
    if (!form.description.trim()) errs.description = 'La descripción es obligatoria'
    if (!form.category) errs.category = 'Selecciona una categoría'
    if (!(Number(form.price) > 0)) errs.price = 'Ingresa un precio válido'
    if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Ingresa un inventario válido'
    if (existingImages.length + newImages.length === 0) errs.images = 'Añade al menos una foto'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form, existingImages, newImages])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validate()) return
      setSubmitting(true)
      try {
        const files = newImages.map((img) => img.file)
        if (isEditMode) {
          await updateSellerProduct(id, form, files, removedImageIds)
          addToast('Producto actualizado')
        } else {
          await addSellerProduct(form, files)
          addToast('Producto publicado')
        }
        navigate('/vendedor')
      } finally {
        setSubmitting(false)
      }
    },
    [validate, newImages, isEditMode, id, form, removedImageIds, addToast, navigate]
  )

  return {
    isEditMode,
    loading,
    submitting,
    form,
    setField,
    errors,
    existingImages,
    newImages,
    addFiles,
    removeExistingImage,
    removeNewImage,
    handleSubmit,
    categories: SELLER_CATEGORIES,
  }
}
