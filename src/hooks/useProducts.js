import { useState, useEffect } from 'react'

let cache = null

export function useProducts() {
  const [products, setProducts] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cache) return
    fetch('/products.json')
      .then(r => r.json())
      .then(data => {
        cache = data
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { products, loading, error }
}
