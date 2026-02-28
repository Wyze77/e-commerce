import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import BackToTop from '../components/BackToTop'
import styles from './Shop.module.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
]

const DEFAULT_FILTERS = { search: '', category: '', minPrice: '', maxPrice: '', colors: [], sizes: [], sale: '', newArrival: '', tag: '' }
const PER_PAGE = 12
const NEW_ARRIVAL_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000
const CATEGORY_LABELS = {
  clothing: 'Clothing',
  shoes: 'Shoes',
  belts: 'Belts',
  accessories: 'Accessories',
}

const parseArrayParam = (value) => (value ? value.split(',').map(x => x.trim()).filter(Boolean) : [])

const parseFiltersFromParams = (params) => ({
  ...DEFAULT_FILTERS,
  search: params.get('search') || '',
  category: params.get('category') || '',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  colors: parseArrayParam(params.get('colors')),
  sizes: parseArrayParam(params.get('sizes')),
  sale: params.get('sale') === '1' ? '1' : '',
  newArrival: params.get('new') === '1' ? '1' : '',
  tag: params.get('tag') || '',
})

const parseSortFromParams = (params) => {
  const value = params.get('sort') || 'newest'
  return SORT_OPTIONS.some(o => o.value === value) ? value : 'newest'
}

const parsePageFromParams = (params) => {
  const page = Number(params.get('page') || 1)
  return Number.isInteger(page) && page > 0 ? page : 1
}

const buildParams = (filters, sort, page) => {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.colors?.length) params.set('colors', filters.colors.join(','))
  if (filters.sizes?.length) params.set('sizes', filters.sizes.join(','))
  if (filters.sale === '1') params.set('sale', '1')
  if (filters.newArrival === '1') params.set('new', '1')
  if (filters.tag) params.set('tag', filters.tag)
  if (sort && sort !== 'newest') params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  return params
}

const createdAtMs = (createdAt) => {
  const parsed = Date.parse(createdAt)
  return Number.isFinite(parsed) ? parsed : 0
}

const isNewArrivalProduct = (createdAt) => {
  const created = createdAtMs(createdAt)
  if (created < 1) return false
  const ageMs = Date.now() - created
  return ageMs >= 0 && ageMs <= NEW_ARRIVAL_DAYS * DAY_MS
}

export default function Shop() {
  const { products, loading } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => parseFiltersFromParams(searchParams))
  const [sort, setSort] = useState(() => parseSortFromParams(searchParams))
  const [page, setPage] = useState(() => parsePageFromParams(searchParams))
  const [showFilters, setShowFilters] = useState(false)
  const queryStateRef = useRef('')

  useEffect(() => {
    const nextFilters = parseFiltersFromParams(searchParams)
    const nextSort = parseSortFromParams(searchParams)
    const nextPage = parsePageFromParams(searchParams)

    const queryState = JSON.stringify({ filters: nextFilters, sort: nextSort })
    const hasChangedState = queryStateRef.current !== '' && queryStateRef.current !== queryState
    queryStateRef.current = queryState

    setFilters(nextFilters)
    setSort(nextSort)

    if (hasChangedState) {
      setPage(1)
      if (nextPage !== 1) {
        syncQuery(nextFilters, nextSort, 1)
      }
      return
    }

    setPage(nextPage)
  }, [searchParams])

  const syncQuery = (nextFilters, nextSort, nextPage) => {
    const nextParams = buildParams(nextFilters, nextSort, nextPage)
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams)
    }
  }

  useEffect(() => {
    if (!showFilters) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowFilters(false)
    }

    const onResize = () => {
      if (window.innerWidth >= 1025) setShowFilters(false)
    }

    const previousOverflow = document.body.style.overflow
    if (window.innerWidth <= 1024) {
      document.body.style.overflow = 'hidden'
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [showFilters])

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters)
    setPage(1)
    syncQuery(nextFilters, sort, 1)
  }

  const handleSortChange = (nextSort) => {
    setSort(nextSort)
    setPage(1)
    syncQuery(filters, nextSort, 1)
  }

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
    if (filters.sale === '1') list = list.filter(p => Boolean(p.salePrice))
    if (filters.newArrival === '1') list = list.filter(p => isNewArrivalProduct(p.createdAt))
    if (filters.tag) {
      const tagNeedle = filters.tag.toLowerCase()
      list = list.filter(p => p.tags.some(tag => tag.toLowerCase() === tagNeedle))
    }

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
    else if (sort === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.id - a.id))
    else list.sort((a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt) || b.id - a.id)

    return list
  }, [products, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  useEffect(() => {
    if (loading) return
    if (page > totalPages) {
      setPage(totalPages)
      syncQuery(filters, sort, totalPages)
    }
  }, [loading, page, totalPages, filters, sort])

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, page])

  const suggestedProducts = useMemo(() => {
    const featured = products.filter((item) => item.featured)
    if (featured.length >= 4) {
      return featured
        .sort((a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt) || b.id - a.id)
        .slice(0, 4)
    }

    return [...products]
      .sort((a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt) || b.id - a.id)
      .slice(0, 4)
  }, [products])

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSort('newest')
    setPage(1)
    setSearchParams({})
  }

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.colors?.length ||
    filters.sizes?.length ||
    filters.sale === '1' ||
    filters.newArrival === '1' ||
    filters.tag ||
    sort !== 'newest' ||
    page !== 1
  )

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
    syncQuery(filters, sort, nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const categoryLabel = CATEGORY_LABELS[filters.category] || 'All Products'
  const breadcrumbCategory = CATEGORY_LABELS[filters.category] || 'All Products'
  const itemsOnCurrentPage = loading ? 0 : paginatedProducts.length

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <strong>{breadcrumbCategory}</strong>
      </nav>

      <div className={styles.summaryRow}>
        <p className={styles.counter}>
          Showing {itemsOnCurrentPage} of {filtered.length} {categoryLabel}
        </p>

        <div className={styles.summaryActions}>
          <button
            type="button"
            className={`btn btn-ghost ${styles.filterToggle}`}
            onClick={() => setShowFilters(true)}
            aria-label="Open filters"
            aria-expanded={showFilters}
            aria-controls="shop-filters-panel"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            Filters
          </button>

          {hasActiveFilters && (
            <button
              className={`btn btn-ghost ${styles.clearAllBtn}`}
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
          <select
            value={sort}
            onChange={e => handleSortChange(e.target.value)}
            className={styles.sort}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Desktop Sidebar */}
        <div className={styles.sidebar}>
          <Filters filters={filters} onChange={handleFiltersChange} onClear={clearFilters} />
        </div>

        {/* Main */}
        <div className={styles.main}>
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.cardSkeleton}>
                  <div className={styles.imageSkeleton} />
                  <div className={styles.lineSkeleton} />
                  <div className={styles.lineSkeletonShort} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <>
              <div className={styles.empty}>
                <div className={styles.emptyIllustration} aria-hidden="true" />
                <p className={styles.emptyTitle}>No items match your filters</p>
                <p className={styles.emptySub}>Try adjusting your category, price range, or search terms.</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>

              <section className={styles.suggestions}>
                <h2 className={styles.suggestionsTitle}>You might like</h2>
                <div className={styles.suggestGrid}>
                  {suggestedProducts.map((item) => (
                    <ProductCard key={`suggest-${item.id}`} product={item} />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="products-grid">
                {paginatedProducts.map((p, i) => (
                  <div key={p.id} className="fade-up" style={{ animationDelay: `${i * .04}s` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={`${styles.pagination} fade-up`}>
                  <button
                    className={`btn btn-ghost ${styles.pageBtn}`}
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>

                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const value = idx + 1
                      return (
                        <button
                          key={value}
                          className={`${styles.pageNumber} ${value === page ? styles.pageNumberActive : ''}`}
                          onClick={() => goToPage(value)}
                          aria-current={value === page ? 'page' : undefined}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    className={`btn btn-ghost ${styles.pageBtn}`}
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersOverlay} onClick={() => setShowFilters(false)}>
          <aside
            id="shop-filters-panel"
            className={styles.filtersPanel}
            onClick={(event) => event.stopPropagation()}
            aria-label="Filter products"
          >
            <div className={styles.filtersPanelHeader}>
              <p>Filters</p>
              <button
                type="button"
                className={styles.filtersClose}
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                Close
              </button>
            </div>
            <Filters filters={filters} onChange={handleFiltersChange} onClear={clearFilters} sticky={false} />
          </aside>
        </div>
      )}

      <BackToTop />
    </div>
  )
}
