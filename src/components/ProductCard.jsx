import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import AppImage from './AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { state, dispatch, toast } = useStore()
  const inWishlist = state.wishlist.includes(product.id)
  const firstAvailableVariant = product.variants.find(v => v.stock > 0)
  const totalStock = product.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock || 0), 0)
  const outOfStock = totalStock < 1
  const showRating = Number.isFinite(product.rating) && Number.isFinite(product.reviewCount) && product.reviewCount > 0

  const toggleWishlist = (e) => {
    e.preventDefault()
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', inWishlist ? 'info' : 'success')
  }

  const displayPrice = product.salePrice ?? product.price

  const quickAdd = (e) => {
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
      <Link to={`/product/${product.id}`} className={styles.imgWrap}>
        <AppImage
          src={product.images[0]}
          alt={product.name}
          className={styles.img}
          wrapperClassName={styles.imgLayer}
          loading="lazy"
        />
        {product.images[1] && (
          <AppImage
            src={product.images[1]}
            alt=""
            className={styles.imgHover}
            wrapperClassName={styles.imgHoverLayer}
            loading="lazy"
          />
        )}
        <div className={styles.tags}>
          {product.salePrice && <span className="tag tag-sale">Sale</span>}
          {outOfStock && <span className={styles.stockTag}>Out of stock</span>}
        </div>

        {!outOfStock && firstAvailableVariant && (
          <button
            className={styles.quickAdd}
            onClick={quickAdd}
            aria-label={`Quick add ${product.name}`}
          >
            Quick Add
          </button>
        )}

        <button
          className={`${styles.wishBtn} ${inWishlist ? styles.wished : ''}`}
          onClick={toggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </Link>

      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <Link to={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
        {showRating && (
          <p className={styles.rating}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.77 5.61L21 8.53l-4.5 4.39 1.06 6.2L12 16.77 6.44 19.12l1.06-6.2L3 8.53l6.23-.92L12 2z" />
            </svg>
            <span>{product.rating.toFixed(1)}</span>
            <span className={styles.reviews}>({product.reviewCount})</span>
          </p>
        )}
        <p className={styles.price}>
          <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
          {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
        </p>
      </div>
    </article>
  )
}
