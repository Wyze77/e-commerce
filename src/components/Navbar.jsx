import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { state } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0)
  const wishlistCount = state.wishlist.length

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          VAUX
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive && location.pathname === '/' ? styles.active : ''} onClick={closeMenu} end>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Shop</NavLink>
        </div>

        <div className={styles.icons}>
          <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span className={menuOpen ? styles.bar1Open : styles.bar1} />
            <span className={menuOpen ? styles.bar2Open : styles.bar2} />
            <span className={menuOpen ? styles.bar3Open : styles.bar3} />
          </button>
        </div>
      </div>
    </nav>
  )
}
