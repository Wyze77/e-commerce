import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import styles from './SiteFooter.module.css'

export default function SiteFooter() {
  const { toast } = useStore()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const subscribe = (e) => {
    e.preventDefault()
    const nextEmail = email.trim()

    if (!nextEmail) {
      setEmailError('Please enter your email address.')
      toast('Please enter your email', 'error')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(nextEmail)) {
      setEmailError('Please use a valid email format.')
      toast('Please enter a valid email', 'error')
      return
    }

    setEmailError('')
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
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
              }}
              aria-invalid={emailError ? 'true' : 'false'}
            />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </div>
          {emailError && <p className={styles.errorText}>{emailError}</p>}
        </form>

        <div className={styles.linksWrap}>
          <div>
            <p className={styles.title}>Social</p>
            <div className={styles.links}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram placeholder">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest placeholder">Pinterest</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok placeholder">TikTok</a>
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
