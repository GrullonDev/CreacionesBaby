import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../context/useToast'
import { extractApiError } from '../utils/apiError'
import { SELLER_CATEGORIES } from './useProducts'

const EMPTY_FORM = { name: '', description: '', category: '', brand: '', price: '', stock: '' }

export function useProductForm(id) {
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([''])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEditMode) return
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data
        setForm({
          name: p.name,
          description: p.description,
          category: p.category,
          brand: p.brand || '',
          price: String(p.price),
          stock: String(p.stock),
        })
        setImages(p.images?.length ? p.images : [''])
      })
      .catch((err) => addToast(extractApiError(err, 'No se pudo cargar el producto.'), 'error'))
      .finally(() => setLoading(false))
  }, [id, isEditMode, addToast])

  const setField = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
  }, [])

  const setImageAt = useCallback((index, value) => {
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)))
  }, [])

  const addImageField = useCallback(() => {
    setImages((prev) => [...prev, ''])
  }, [])

  const removeImageAt = useCallback((index) => {
    setImages((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']))
  }, [])

  const validate = useCallback(() => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El título es obligatorio'
    if (!form.description.trim()) errs.description = 'La descripción es obligatoria'
    if (!form.category) errs.category = 'Selecciona una categoría'
    if (!(Number(form.price) > 0)) errs.price = 'Ingresa un precio válido'
    if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Ingresa un inventario válido'
    const cleanImages = images.map((u) => u.trim()).filter(Boolean)
    if (cleanImages.length === 0) errs.images = 'Añade al menos una URL de imagen'
    else if (cleanImages.some((u) => !/^https?:\/\//i.test(u))) {
      errs.images = 'Cada imagen debe ser una URL válida (http:// o https://)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form, images])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validate()) return
      setSubmitting(true)
      try {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          brand: form.brand.trim() || undefined,
          price: Number(form.price),
          stock: Number(form.stock),
          images: images.map((u) => u.trim()).filter(Boolean),
        }
        if (isEditMode) {
          await api.put(`/products/${id}`, payload)
          addToast('Producto actualizado')
        } else {
          await api.post('/products', payload)
          addToast('Producto publicado')
        }
        navigate('/productos')
      } catch (err) {
        addToast(extractApiError(err, 'No se pudo guardar el producto.'), 'error')
      } finally {
        setSubmitting(false)
      }
    },
    [validate, form, images, isEditMode, id, addToast, navigate]
  )

  return {
    isEditMode,
    loading,
    submitting,
    form,
    setField,
    errors,
    images,
    setImageAt,
    addImageField,
    removeImageAt,
    handleSubmit,
    categories: SELLER_CATEGORIES,
  }
}
