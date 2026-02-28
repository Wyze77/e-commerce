import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import styles from './SiteFooter.module.css'

export default function SiteFooter() {
  const { toast } = useStore()
  const [email, setEmail] = useState('')

  const subscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast('Please enter your email', 'error')
      return
    }

    setEmail('')
    toast('Thanks for subscribing')
  }

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.layout}`}>
        <div>
          <p className={styles.logo}>VAUX</p>
          <p className={styles.brandCopy}>Modern essentials designed for longevity.</p>
        </div>

        <form onSubmit={subscribe} className={styles.newsletter}>
          <p className={styles.title}>Newsletter</p>
          <label htmlFor="newsletter-email" className="sr-only">Email</label>
          <div className={styles.formRow}>
            <input
              id="newsletter-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </div>
        </form>

        <div className={styles.linksWrap}>
          <div>
            <p className={styles.title}>Social</p>
            <div className={styles.links}>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="Pinterest">Pinterest</a>
              <a href="#" aria-label="TikTok">TikTok</a>
            </div>
          </div>

          <div>
            <p className={styles.title}>Policies</p>
            <div className={styles.links}>
              <Link to="/shipping">Shipping</Link>
              <Link to="/returns">Returns</Link>
              <Link to="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>(c) {new Date().getFullYear()} VAUX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
