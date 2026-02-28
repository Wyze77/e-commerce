import { useState, useEffect } from 'react'
import { PRODUCT_IMAGE_POOL } from '../data/productImagePool'

let cache = null
const MIN_IMAGE_COUNT = 3
const LOCAL_PLACEHOLDER = '/images/placeholder.jpg'

const normalizeImageList = (images, productId) => {
  const clean = Array.isArray(images)
    ? images.filter((image) => typeof image === 'string' && image.trim())
    : []

  const gallery = [...clean]
  while (gallery.length < MIN_IMAGE_COUNT) {
    const seedIndex = Math.abs((productId * 11 + gallery.length * 7) % PRODUCT_IMAGE_POOL.length)
    gallery.push(PRODUCT_IMAGE_POOL[seedIndex] || LOCAL_PLACEHOLDER)
  }

  return gallery.slice(0, MIN_IMAGE_COUNT)
}

const normalizeProduct = (product) => ({
  ...product,
  images: normalizeImageList(product.images, Number(product.id) || 0),
  rating: Number.isFinite(product.rating)
    ? Math.max(0, Math.min(5, product.rating))
    : Number((3.8 + ((Number(product.id) * 13) % 12) / 10).toFixed(1)),
  reviewCount: Number.isInteger(product.reviewCount) && product.reviewCount >= 0
    ? product.reviewCount
    : 26 + ((Number(product.id) * 17) % 210),
})

const normalizeProducts = (data) => {
  if (!Array.isArray(data)) return []
  return data.map(normalizeProduct)
}

export function useProducts() {
  const [products, setProducts] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cache) return

    fetch('/products.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load products')
        return response.json()
      })
      .then((data) => {
        const normalized = normalizeProducts(data)
        cache = normalized
        setProducts(normalized)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { products, loading, error }
}
