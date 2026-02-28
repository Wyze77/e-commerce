import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard'
import BackToTop from '../components/BackToTop'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './ProductDetail.module.css'

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts'
const RECENTLY_VIEWED_LIMIT = 6

const loadRecentIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(x => Number.isInteger(x)) : []
  } catch {
    return []
  }
}

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const { state, dispatch, toast } = useStore()

  const product = products.find(p => p.id === Number(id))

  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [recentIds, setRecentIds] = useState(loadRecentIds)

  const inWishlist = product ? state.wishlist.includes(product.id) : false

  const getVariant = (color, size) =>
    product?.variants.find(v => v.color === color && v.size === size)

  const currentVariant = selectedColor && selectedSize
    ? getVariant(selectedColor, selectedSize)
    : null

  useEffect(() => {
    setActiveImg(0)
    setSelectedColor('')
    setSelectedSize('')
    setQty(1)
  }, [product?.id])

  useEffect(() => {
    if (!product) return

    setRecentIds(prev => {
      const next = [product.id, ...prev.filter(pid => pid !== product.id)].slice(0, RECENTLY_VIEWED_LIMIT)
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
      return next
    })
  }, [product])

  const recentlyViewedProducts = useMemo(() => {
    if (!product) return []

    return recentIds
      .filter(pid => pid !== product.id)
      .map(pid => products.find(p => p.id === pid))
      .filter(Boolean)
      .slice(0, RECENTLY_VIEWED_LIMIT)
  }, [recentIds, products, product])

  const relatedProducts = useMemo(() => {
    if (!product) return []

    return products
      .filter(p => p.id !== product.id)
      .map(candidate => {
        const sharedTags = candidate.tags.filter(tag => product.tags.includes(tag)).length
        const score = (candidate.category === product.category ? 2 : 0) + sharedTags
        return { candidate, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.candidate.id - a.candidate.id)
      .slice(0, 4)
      .map(item => item.candidate)
  }, [products, product])

  const maxQty = currentVariant?.stock || 1
  const selectionMissing = !selectedColor || !selectedSize
  const variantOutOfStock = selectedColor && selectedSize && (!currentVariant || currentVariant.stock < 1)
  const canAdd = !selectionMissing && !variantOutOfStock && currentVariant

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    setSelectedSize('')
    setQty(1)
  }

  const handleSizeSelect = (size) => {
    const v = getVariant(selectedColor, size)
    if (!v || v.stock === 0) return
    setSelectedSize(size)
    setQty(1)
  }

  const addToCart = () => {
    if (selectionMissing) {
      toast('Select both color and size before adding to cart', 'info')
      return
    }

    if (!currentVariant || currentVariant.stock < 1) {
      toast('Selected variant is out of stock', 'error')
      return
    }

    dispatch({ type: 'ADD_TO_CART', payload: { product, color: selectedColor, size: selectedSize, qty } })
    toast(`${product.name} added to cart`)
  }

  const toggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist', inWishlist ? 'info' : 'success')
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '1rem' }}>Product not found</h2>
        <Link to="/shop" className="btn btn-outline">Back to Shop</Link>
      </div>
    )
  }

  const displayPrice = product.salePrice ?? product.price

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <Link to="/shop">Shop</Link>
        <span>&gt;</span>
        <Link to={`/shop?category=${product.category}`} className={styles.breadcrumbCategory}>{product.category}</Link>
        <span>&gt;</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <AppImage
              src={product.images[activeImg]}
              alt={product.name}
              className={styles.img}
              wrapperClassName={styles.mainImageMedia}
            />
            {product.salePrice && <span className="tag tag-sale" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Sale</span>}
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <AppImage src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>

          <p className={styles.price}>
            <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
            {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
          </p>

          <hr style={{ margin: '1.5rem 0' }} />

          {/* Color */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Color <span className={styles.selected}>{selectedColor}</span>
            </p>
            <div className={styles.colorBtns}>
              {product.colors.map(color => {
                const hasStock = product.variants.some(v => v.color === color && v.stock > 0)
                return (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${selectedColor === color ? styles.colorActive : ''} ${!hasStock ? styles.outOfStock : ''}`}
                    onClick={() => handleColorSelect(color)}
                    disabled={!hasStock}
                    title={color}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Size <span className={styles.selected}>{selectedSize}</span>
            </p>
            <div className={styles.sizeBtns}>
              {product.sizes.map(size => {
                const v = selectedColor ? getVariant(selectedColor, size) : null
                const isAvail = !selectedColor || (v && v.stock > 0)
                return (
                  <button
                    key={size}
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeActive : ''} ${!isAvail ? styles.outOfStock : ''}`}
                    onClick={() => handleSizeSelect(size)}
                    disabled={!isAvail || !selectedColor}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {!selectedColor && <p className={styles.hint}>Select a color first</p>}
          </div>

          {currentVariant && (
            <p className={styles.stockNote}>
              {currentVariant.stock <= 3
                ? <span style={{ color: 'var(--error)' }}>Only {currentVariant.stock} left!</span>
                : <span style={{ color: 'var(--success)' }}>In stock</span>}
            </p>
          )}

          {/* Qty + CTA */}
          <div className={styles.actions}>
            <QuantitySelector qty={qty} onChange={setQty} max={maxQty} />
            <button
              className={`btn btn-primary ${styles.addBtn}`}
              onClick={addToCart}
              disabled={variantOutOfStock}
              aria-disabled={selectionMissing ? 'true' : undefined}
            >
              {variantOutOfStock ? 'Out of Stock' : canAdd ? 'Add to Cart' : 'Select Options'}
            </button>
          </div>
          {selectionMissing && (
            <p className={styles.addHint}>Pick color and size to continue.</p>
          )}

          <button
            className={`btn ${styles.wishBtn}`}
            onClick={toggleWishlist}
          >
            <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>

          <hr style={{ margin: '1.5rem 0' }} />

          <p className={styles.description}>{product.description}</p>

          <div className={styles.tags}>
            {product.tags.map(tag => (
              <span key={tag} className={styles.tagChip}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Recently Viewed</h2>
            <Link to="/shop" className={styles.sectionLink}>Back to Shop</Link>
          </div>

          {recentlyViewedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No recently viewed products yet.</p>
              <p>Browse products and they will appear here.</p>
            </div>
          ) : (
            <div className="products-grid">
              {recentlyViewedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Related Products</h2>
          </div>

          {relatedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No related products found for this item.</p>
              <p>Try exploring other categories in the shop.</p>
            </div>
          ) : (
            <div className="products-grid">
              {relatedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>
      </div>
      <BackToTop />
    </div>
  )
}
