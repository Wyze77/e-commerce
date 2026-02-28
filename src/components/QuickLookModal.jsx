import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../context/StoreContext'
import QuantitySelector from './QuantitySelector'
import AppImage from './AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './QuickLookModal.module.css'

const getFocusableElements = (container) => {
  if (!container) return []
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

export default function QuickLookModal({ product, isOpen, onClose, returnFocusRef }) {
  const { dispatch, toast } = useStore()
  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousOverflowRef = useRef('')
  const fallbackFocusedElementRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !product) return
    setActiveImage(0)
    setSelectedColor('')
    setSelectedSize('')
    setQty(1)
    setAttemptedSubmit(false)
  }, [isOpen, product?.id])

  const currentVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null
    return product?.variants?.find((variant) => variant.color === selectedColor && variant.size === selectedSize) || null
  }, [product, selectedColor, selectedSize])

  const maxQty = currentVariant?.stock || 1

  useEffect(() => {
    if (qty > maxQty) setQty(maxQty)
  }, [qty, maxQty])

  useEffect(() => {
    if (!isOpen) return

    fallbackFocusedElementRef.current = document.activeElement
    previousOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusModal = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = getFocusableElements(dialogRef.current)
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusModal)
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflowRef.current
      const nextFocus = returnFocusRef?.current || fallbackFocusedElementRef.current
      nextFocus?.focus?.()
    }
  }, [isOpen, onClose, returnFocusRef])

  if (!isOpen || !product) return null

  const hasColorStock = (color) => product.variants.some((variant) => variant.color === color && variant.stock > 0)

  const isSizeDisabled = (size) => {
    if (!selectedColor) {
      return !product.variants.some((variant) => variant.size === size && variant.stock > 0)
    }
    return !product.variants.some(
      (variant) => variant.color === selectedColor && variant.size === size && variant.stock > 0
    )
  }

  const handleColorClick = (color) => {
    setSelectedColor(color)
    if (selectedSize) {
      const stillValid = product.variants.some(
        (variant) => variant.color === color && variant.size === selectedSize && variant.stock > 0
      )
      if (!stillValid) setSelectedSize('')
    }
    if (attemptedSubmit) setAttemptedSubmit(false)
  }

  const handleSizeClick = (size) => {
    if (isSizeDisabled(size)) return
    setSelectedSize(size)
    if (attemptedSubmit) setAttemptedSubmit(false)
  }

  const addToCart = () => {
    if (!selectedColor || !selectedSize) {
      setAttemptedSubmit(true)
      toast('Please choose both color and size', 'info')
      return
    }

    if (!currentVariant || currentVariant.stock < 1) {
      setAttemptedSubmit(true)
      toast('Selected variant is out of stock', 'error')
      return
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        color: selectedColor,
        size: selectedSize,
        qty,
      },
    })
    toast(`${product.name} added to cart`)
    onClose()
  }

  return (
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick look for ${product.name}`}
        ref={dialogRef}
      >
        <header className={styles.header}>
          <p className={styles.eyebrow}>Quick Look</p>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close quick look"
            ref={closeButtonRef}
          >
            Close
          </button>
        </header>

        <div className={styles.layout}>
          <div className={styles.mediaColumn}>
            <div className={styles.mainImageWrap}>
              <AppImage src={product.images[activeImage]} alt={product.name} className={styles.mainImage} />
            </div>
            {product.images.length > 1 && (
              <div className={styles.thumbRow}>
                {product.images.map((image, index) => (
                  <button
                    key={`${product.id}-quick-${index}`}
                    type="button"
                    className={`${styles.thumbButton} ${index === activeImage ? styles.thumbButtonActive : ''}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <AppImage src={image} alt="" className={styles.thumbImage} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoColumn}>
            <h2 className={styles.title}>{product.name}</h2>
            <p className={styles.priceRow}>
              <span className={product.salePrice ? styles.salePrice : ''}>
                {formatCurrency(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && <span className={styles.originalPrice}>{formatCurrency(product.price)}</span>}
            </p>

            <div className={`${styles.optionGroup} ${attemptedSubmit && !selectedColor ? styles.optionMissing : ''}`}>
              <p className={styles.optionLabel}>
                Color
                {selectedColor && <span className={styles.selectedValue}>{selectedColor}</span>}
              </p>
              <div className={styles.optionButtons}>
                {product.colors.map((color) => {
                  const disabled = !hasColorStock(color)
                  return (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.optionButton} ${selectedColor === color ? styles.optionButtonActive : ''}`}
                      onClick={() => handleColorClick(color)}
                      disabled={disabled}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={`${styles.optionGroup} ${attemptedSubmit && !selectedSize ? styles.optionMissing : ''}`}>
              <p className={styles.optionLabel}>
                Size
                {selectedSize && <span className={styles.selectedValue}>{selectedSize}</span>}
              </p>
              <div className={styles.optionButtons}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.optionButton} ${selectedSize === size ? styles.optionButtonActive : ''}`}
                    onClick={() => handleSizeClick(size)}
                    disabled={isSizeDisabled(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <QuantitySelector qty={qty} onChange={setQty} max={maxQty} />
              <button type="button" className={`btn btn-primary ${styles.addButton}`} onClick={addToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
