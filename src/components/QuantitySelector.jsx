import styles from './QuantitySelector.module.css'

export default function QuantitySelector({ qty, onChange, max = 99, min = 1 }) {
  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        onClick={() => onChange(Math.max(min, qty - 1))}
        disabled={qty <= min}
        aria-label="Decrease"
      >-</button>
      <span className={styles.qty}>{qty}</span>
      <button
        className={styles.btn}
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        aria-label="Increase"
      >+</button>
    </div>
  )
}

