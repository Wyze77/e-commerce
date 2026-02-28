import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import styles from './Wishlist.module.css'

export default function Wishlist() {
  const { products } = useProducts()
  const { state, dispatch, toast } = useStore()
  const { wishlist } = state

  const wishedProducts = products.filter(p => wishlist.includes(p.id))

  const getFirstAvailableVariant = (product) => {
    if (!product?.variants?.length) return null
    return product.variants.find(v => v.stock > 0 && v.color && v.size) || null
  }

  const removeFromWishlist = (id) => {
    dispatch({ type: 'REMOVE_WISHLIST', payload: id })
    toast('Removed from wishlist', 'info')
  }

  const moveToCart = (product) => {
    const firstVariant = getFirstAvailableVariant(product)
    if (!firstVariant) {
      toast('No purchasable variant in stock', 'error')
      return
    }
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, color: firstVariant.color, size: firstVariant.size, qty: 1 }
    })
    dispatch({ type: 'REMOVE_WISHLIST', payload: product.id })
    toast(`${product.name} moved to cart`)
  }

  if (wishedProducts.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <svg width="48" height="48" fill="none" stroke="var(--ink-muted)" strokeWidth="1" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
        <p className={styles.emptySub}>Save items you love to come back to them later.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Discover Products</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className={styles.header}>
        <h1>Wishlist <span className={styles.count}>({wishedProducts.length})</span></h1>
      </div>

      <div className={styles.grid}>
        {wishedProducts.map((product, i) => {
          const price = product.salePrice ?? product.price
          const hasStock = product.variants.some(v => v.stock > 0)
          return (
            <article key={product.id} className={styles.card} style={{ animationDelay: `${i * .06}s` }}>
              <Link to={`/product/${product.id}`} className={styles.imgWrap}>
                <img src={product.images[0]} alt={product.name} className={styles.img} />
                {product.salePrice && <span className="tag tag-sale" style={{ position: 'absolute', top: '.75rem', left: '.75rem' }}>Sale</span>}
              </Link>
              <div className={styles.info}>
                <div>
                  <p className={styles.brand}>{product.brand}</p>
                  <Link to={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
                  <p className={styles.price}>
                    <span>${price}</span>
                    {product.salePrice && <span className={styles.original}>${product.price}</span>}
                  </p>
                </div>
                <div className={styles.btnRow}>
                  <button
                    className={`btn btn-primary ${styles.cartBtn}`}
                    onClick={() => moveToCart(product)}
                    disabled={!hasStock}
                    title={hasStock ? 'Move to cart' : 'Out of stock'}
                  >
                    {hasStock ? 'Move to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
