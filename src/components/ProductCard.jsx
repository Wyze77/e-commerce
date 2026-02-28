import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import AppImage from './AppImage'
import { formatCurrency } from '../utils/currency'
import QuickLookModal from './QuickLookModal'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { state, dispatch, toast } = useStore()
  const [quickLookOpen, setQuickLookOpen] = useState(false)
  const quickLookTriggerRef = useRef(null)

  const inWishlist = state.wishlist.includes(product.id)
  const firstAvailableVariant = product.variants.find(v => v.stock > 0)
  const totalStock = product.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock || 0), 0)
  const outOfStock = totalStock < 1

  const isNewArrival = useMemo(() => {
    if (!product.createdAt) return false
    const createdAtMs = Date.parse(product.createdAt)
    if (!Number.isFinite(createdAtMs)) return false
    const ageMs = Date.now() - createdAtMs
    if (ageMs < 0) return false
    const dayMs = 24 * 60 * 60 * 1000
    return ageMs <= 30 * dayMs
  }, [product.createdAt])

  const isLimitedStock = totalStock > 0 && totalStock < 10

  const toggleWishlist = (e) => {
    if (e) e.preventDefault()
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', inWishlist ? 'info' : 'success')
  }

  const displayPrice = product.salePrice ?? product.price

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!firstAvailableVariant) {
      toast('No stock available', 'error')
      return
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        color: firstAvailableVariant.color,
        size: firstAvailableVariant.size,
        qty: 1,
      },
    })
    toast(`${product.name} added to cart`)
  }

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link to={`/product/${product.id}`} className={styles.imgWrap}>
          <AppImage
            src={product.images[0]}
            alt={product.name}
            className={styles.img}
            wrapperClassName={styles.imgLayer}
            loading="lazy"
          />
        </Link>

        <div className={styles.badges}>
          {isNewArrival && <span className={styles.badgeNew}>New Arrival</span>}
          {isLimitedStock && <span className={styles.badgeLimited}>Limited Stock</span>}
        </div>

        <button
          ref={quickLookTriggerRef}
          type="button"
          className={styles.quickLookButton}
          onClick={() => setQuickLookOpen(true)}
          aria-label={`Open quick look for ${product.name}`}
        >
          Quick Look
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <Link to={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
          <button
            type="button"
            className={`${styles.wishButton} ${inWishlist ? styles.wished : ''}`}
            onClick={toggleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={inWishlist}
          >
            <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <p className={styles.price}>
          <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
          {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
        </p>
        <button
          type="button"
          className={`btn btn-primary ${styles.addButton}`}
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>

      <QuickLookModal
        product={product}
        isOpen={quickLookOpen}
        onClose={() => setQuickLookOpen(false)}
        returnFocusRef={quickLookTriggerRef}
      />
    </article>
  )
}
