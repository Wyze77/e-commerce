import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const { state, dispatch, toast } = useStore()

  const product = products.find(p => p.id === Number(id))

  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)

  const inWishlist = product ? state.wishlist.includes(product.id) : false

  const getVariant = (color, size) =>
    product?.variants.find(v => v.color === color && v.size === size)

  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return product?.sizes || []
    return product.variants
      .filter(v => v.color === selectedColor && v.stock > 0)
      .map(v => v.size)
  }, [product, selectedColor])

  const currentVariant = selectedColor && selectedSize
    ? getVariant(selectedColor, selectedSize)
    : null

  const maxQty = currentVariant?.stock || 1
  const canAdd = selectedColor && selectedSize && currentVariant && currentVariant.stock > 0

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
    if (!canAdd) return
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
        <span>›</span>
        <Link to="/shop">Shop</Link>
        <span>›</span>
        <Link to={`/shop?category=${product.category}`} style={{ textTransform: 'capitalize' }}>{product.category}</Link>
        <span>›</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className={styles.img}
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
                  <img src={img} alt="" />
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
            <span className={product.salePrice ? styles.sale : ''}>${displayPrice}</span>
            {product.salePrice && <span className={styles.original}>${product.price}</span>}
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
              disabled={!canAdd}
            >
              {canAdd ? 'Add to Cart' : 'Select Options'}
            </button>
          </div>

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
    </div>
  )
}
