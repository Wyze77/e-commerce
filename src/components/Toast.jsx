import styles from './Toast.module.css'

const ICONS = {
  success: 'check',
  error: '!',
  info: 'i',
}

export default function Toast({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${styles.toast} ${t.type === 'error' ? styles.error : t.type === 'info' ? styles.info : styles.success}`}
          role="status"
        >
          <span className={styles.icon}>
            {ICONS[t.type] || ICONS.success}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
