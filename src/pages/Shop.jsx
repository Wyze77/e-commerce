import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import styles from './Shop.module.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const DEFAULT_FILTERS = { search: '', category: '', minPrice: '', maxPrice: '', colors: [], sizes: [] }

export default function Shop() {
  const { products, loading } = useProducts()
  const [searchParams] = useSearchParams()
  const [sort, setSort] = useState('newest')
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    category: searchParams.get('category') || '',
  }))
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setFilters(f => ({ ...f, category: cat }))
  }, [searchParams])

  const filtered = useMemo(() => {
    let list = [...products]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    if (filters.category) list = list.filter(p => p.category === filters.category)

    if (filters.minPrice) list = list.filter(p => (p.salePrice ?? p.price) >= Number(filters.minPrice))
    if (filters.maxPrice) list = list.filter(p => (p.salePrice ?? p.price) <= Number(filters.maxPrice))

    if (filters.colors?.length) {
      list = list.filter(p => p.colors.some(c => filters.colors.includes(c)))
    }

    if (filters.sizes?.length) {
      list = list.filter(p => p.sizes.some(s => filters.sizes.includes(s)))
    }

    if (sort === 'price-asc') list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
    else if (sort === 'price-desc') list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
    else list.sort((a, b) => b.id - a.id)

    return list
  }, [products, filters, sort])

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className={styles.pageHeader}>
        <h1>Shop</h1>
        <p className={styles.count}>{filtered.length} products</p>
      </div>

      <div className={styles.layout}>
        {/* Mobile filter toggle */}
        <button
          className={`btn btn-ghost ${styles.filterToggle}`}
          onClick={() => setShowFilters(o => !o)}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>

        {/* Sidebar */}
        <div className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
          <Filters filters={filters} onChange={setFilters} onClear={clearFilters} />
        </div>

        {/* Main */}
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.countDesktop}>{filtered.length} products</p>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className={styles.sort}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ aspectRatio: '3/4', background: 'var(--sand)', borderRadius: '4px', animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No products found</p>
              <p className={styles.emptySub}>Try adjusting your filters or search term.</p>
              <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: '1.5rem' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((p, i) => (
                <div key={p.id} className="fade-up" style={{ animationDelay: `${i * .04}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
