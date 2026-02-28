import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
      <div className={styles.btns}>
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <Link to="/shop" className="btn btn-outline">Browse Shop</Link>
      </div>
    </div>
  )
}
