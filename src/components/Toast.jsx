import styles from './Toast.module.css'

export default function Toast({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${styles.toast} ${t.type === 'error' ? styles.error : t.type === 'info' ? styles.info : styles.success}`}
        >
          <span className={styles.icon}>
            {t.type === 'error' ? '✕' : '✓'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
