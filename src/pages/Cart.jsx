import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import styles from './Cart.module.css'

const SHIPPING = 12

export default function Cart() {
  const { state, dispatch, toast } = useStore()
  const { cart } = state

  const subtotal = cart.reduce((s, i) => {
    const price = i.product.salePrice ?? i.product.price
    return s + price * i.qty
  }, 0)

  const freeShipping = subtotal >= 150
  const shipping = cart.length === 0 ? 0 : freeShipping ? 0 : SHIPPING
  const total = subtotal + shipping

  const removeItem = (key) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: key })
    toast('Item removed', 'info')
  }

  const updateQty = (key, qty) => {
    if (qty < 1) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: key })
    } else {
      dispatch({ type: 'UPDATE_QTY', payload: { key, qty } })
    }
  }

  const getMaxQty = (item) => {
    const v = item.product.variants.find(v => v.color === item.color && v.size === item.size)
    return v?.stock || 1
  }

  if (cart.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <svg width="48" height="48" fill="none" stroke="var(--ink-muted)" strokeWidth="1" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <p className={styles.emptySub}>Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className={styles.header}>
        <h1>Cart <span className={styles.count}>({cart.length} {cart.length === 1 ? 'item' : 'items'})</span></h1>
        <button
          className={styles.clearBtn}
          onClick={() => { dispatch({ type: 'CLEAR_CART' }); toast('Cart cleared', 'info') }}
        >
          Clear all
        </button>
      </div>

      <div className={styles.layout}>
        {/* Items */}
        <div className={styles.items}>
          {cart.map(item => {
            const price = item.product.salePrice ?? item.product.price
            return (
              <div key={item.key} className={styles.item}>
                <Link to={`/product/${item.product.id}`} className={styles.imgWrap}>
                  <img src={item.product.images[0]} alt={item.product.name} className={styles.img} />
                </Link>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTop}>
                    <div>
                      <p className={styles.itemBrand}>{item.product.brand}</p>
                      <Link to={`/product/${item.product.id}`} className={styles.itemName}>{item.product.name}</Link>
                      <p className={styles.itemMeta}>{item.color} · {item.size}</p>
                    </div>
                    <p className={styles.itemPrice}>${(price * item.qty).toFixed(2)}</p>
                  </div>
                  <div className={styles.itemBottom}>
                    <QuantitySelector
                      qty={item.qty}
                      onChange={qty => updateQty(item.key, qty)}
                      max={getMaxQty(item)}
                    />
                    <button className={styles.removeBtn} onClick={() => removeItem(item.key)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          <div className={styles.summaryRows}>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>{freeShipping ? <span style={{ color: 'var(--success)' }}>Free</span> : `$${SHIPPING}`}</span>
            </div>
            {!freeShipping && subtotal > 0 && (
              <p className={styles.shippingNote}>
                Add ${(150 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}
            <hr />
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button className={`btn btn-primary ${styles.checkoutBtn}`}>
            Proceed to Checkout
          </button>
          <Link to="/shop" className={styles.continueShopping}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
