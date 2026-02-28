import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useProducts } from '../hooks/useProducts'
import AppImage from './AppImage'
import styles from './Navbar.module.css'

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts'

const SHORTCUTS = [
  { label: 'New Arrivals', to: '/shop?new=1&sort=newest' },
  { label: 'Sale', to: '/shop?sale=1' },
  { label: 'Clothing', to: '/shop?category=clothing' },
  { label: 'Shoes', to: '/shop?category=shoes' },
  { label: 'Accessories', to: '/shop?category=accessories' },
  { label: 'Belts', to: '/shop?category=belts' },
]

const loadRecentIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(x => Number.isInteger(x)).slice(0, 5) : []
  } catch {
    return []
  }
}

export default function Navbar() {
  const { state, toast } = useStore()
  const { products } = useProducts()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false)
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [desktopQuery, setDesktopQuery] = useState('')
  const [mobileQuery, setMobileQuery] = useState('')
  const [desktopActive, setDesktopActive] = useState(-1)
  const [mobileActive, setMobileActive] = useState(-1)
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const [recentIds, setRecentIds] = useState(loadRecentIds)

  const location = useLocation()
  const navigate = useNavigate()
  const isShopRoute = location.pathname.startsWith('/shop')

  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0)
  const wishlistCount = state.wishlist.length

  const [cartPulse, setCartPulse] = useState(false)
  const prevCartCount = useRef(cartCount)

  const shopMenuRef = useRef(null)
  const accountRef = useRef(null)
  const desktopSearchRef = useRef(null)
  const mobileSearchRef = useRef(null)

  const refreshRecent = () => setRecentIds(loadRecentIds())

  const getMatches = (query) => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []

    return products
      .filter(p =>
        p.name.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.tags.some(tag => tag.toLowerCase().includes(needle))
      )
      .slice(0, 6)
  }

  const desktopMatches = useMemo(() => getMatches(desktopQuery), [desktopQuery, products])
  const mobileMatches = useMemo(() => getMatches(mobileQuery), [mobileQuery, products])

  const recentViewedProducts = useMemo(() => {
    return recentIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean)
      .slice(0, 5)
  }, [recentIds, products])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOverlayOpen(false)
    setShopMenuOpen(false)
    setAccountOpen(false)
    setDesktopSearchOpen(false)
    setMobileSearchOpen(false)
    setDesktopActive(-1)
    setMobileActive(-1)
  }, [location.pathname])

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartPulse(true)
      const t = setTimeout(() => setCartPulse(false), 320)
      prevCartCount.current = cartCount
      return () => clearTimeout(t)
    }
    prevCartCount.current = cartCount
  }, [cartCount])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen && !searchOverlayOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen, searchOverlayOpen])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      setSearchOverlayOpen(false)
      setShopMenuOpen(false)
      setAccountOpen(false)
      setDesktopSearchOpen(false)
      setMobileSearchOpen(false)
      setDesktopActive(-1)
      setMobileActive(-1)
    }

    const onPointerDown = (e) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target)) {
        setShopMenuOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setDesktopSearchOpen(false)
        setDesktopActive(-1)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setMobileSearchOpen(false)
        setMobileActive(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [])

  const onSearchNavigate = (productId) => {
    navigate(`/product/${productId}`)
    setDesktopQuery('')
    setMobileQuery('')
    setDesktopSearchOpen(false)
    setMobileSearchOpen(false)
    setSearchOverlayOpen(false)
    setDesktopActive(-1)
    setMobileActive(-1)
  }

  const handleDesktopKeyDown = (e) => {
    if (!desktopMatches.length) {
      if (e.key === 'Enter' && desktopQuery.trim()) {
        e.preventDefault()
        navigate(`/shop?search=${encodeURIComponent(desktopQuery.trim())}`)
        setDesktopSearchOpen(false)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setDesktopActive((prev) => (prev + 1) % desktopMatches.length)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDesktopActive((prev) => (prev <= 0 ? desktopMatches.length - 1 : prev - 1))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (desktopActive >= 0 && desktopActive < desktopMatches.length) {
        onSearchNavigate(desktopMatches[desktopActive].id)
      } else {
        navigate(`/shop?search=${encodeURIComponent(desktopQuery.trim())}`)
        setDesktopSearchOpen(false)
      }
    }
  }

  const handleMobileKeyDown = (e) => {
    if (!mobileMatches.length) {
      if (e.key === 'Enter' && mobileQuery.trim()) {
        e.preventDefault()
        navigate(`/shop?search=${encodeURIComponent(mobileQuery.trim())}`)
        setSearchOverlayOpen(false)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMobileActive((prev) => (prev + 1) % mobileMatches.length)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMobileActive((prev) => (prev <= 0 ? mobileMatches.length - 1 : prev - 1))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (mobileActive >= 0 && mobileActive < mobileMatches.length) {
        onSearchNavigate(mobileMatches[mobileActive].id)
      } else {
        navigate(`/shop?search=${encodeURIComponent(mobileQuery.trim())}`)
        setSearchOverlayOpen(false)
      }
    }
  }

  const drawerLinkClass = ({ isActive }) => (isActive ? styles.drawerActive : '')
  const openSearchOverlay = () => {
    setSearchOverlayOpen(true)
    setMobileSearchOpen(true)
    setMobileActive(-1)
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.logo}>VAUX</Link>

          <div className={styles.links}>
            <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''} end>Home</NavLink>

            <div className={styles.shopMenuWrap} ref={shopMenuRef}>
              <button
                className={`${styles.shopTrigger} ${isShopRoute ? styles.active : ''}`}
                onClick={() => {
                  setShopMenuOpen(v => !v)
                  refreshRecent()
                }}
                aria-haspopup="menu"
                aria-expanded={shopMenuOpen}
              >
                Shop
              </button>

              {shopMenuOpen && (
                <div className={styles.shopMenu} role="menu" aria-label="Shop shortcuts">
                  <div className={styles.menuSection}>
                    <p className={styles.menuTitle}>Quick Shortcuts</p>
                    {SHORTCUTS.map(link => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className={styles.menuLink}
                        role="menuitem"
                        onClick={() => setShopMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className={styles.menuSection}>
                    <p className={styles.menuTitle}>Recently Viewed</p>
                    {recentViewedProducts.length === 0 ? (
                      <p className={styles.menuEmpty}>No recent products yet</p>
                    ) : (
                      recentViewedProducts.map(item => (
                        <Link
                          key={item.id}
                          to={`/product/${item.id}`}
                          className={styles.menuRecent}
                          role="menuitem"
                          onClick={() => setShopMenuOpen(false)}
                        >
                          <AppImage src={item.images[0]} alt="" />
                          <span>{item.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/collections" className={({ isActive }) => isActive ? styles.active : ''}>Collections</NavLink>
            <NavLink to="/lookbook" className={({ isActive }) => isActive ? styles.active : ''}>Lookbook</NavLink>
          </div>
        </div>

        <div className={styles.searchDesktop} ref={desktopSearchRef}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const next = desktopQuery.trim()
              if (!next) return
              navigate(`/shop?search=${encodeURIComponent(next)}`)
              setDesktopSearchOpen(false)
            }}
          >
            <input
              type="search"
              placeholder="Search by product, brand, or tag"
              value={desktopQuery}
              onChange={(e) => {
                setDesktopQuery(e.target.value)
                setDesktopSearchOpen(true)
                setDesktopActive(-1)
              }}
              onFocus={() => setDesktopSearchOpen(true)}
              onKeyDown={handleDesktopKeyDown}
              className={styles.searchInput}
              aria-label="Global product search"
              aria-expanded={desktopSearchOpen}
              aria-controls="desktop-search-results"
            />
          </form>

          {desktopSearchOpen && desktopQuery.trim() && (
            <div className={styles.searchResults} id="desktop-search-results" role="listbox">
              {desktopMatches.length === 0 ? (
                <p className={styles.searchEmpty}>No matching products found</p>
              ) : (
                desktopMatches.map((item, idx) => (
                  <button
                    key={item.id}
                    className={`${styles.searchItem} ${idx === desktopActive ? styles.searchItemActive : ''}`}
                    onMouseEnter={() => setDesktopActive(idx)}
                    onClick={() => onSearchNavigate(item.id)}
                    role="option"
                    aria-selected={idx === desktopActive}
                  >
                    <AppImage src={item.images[0]} alt="" />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.brand}</small>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className={styles.right}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.searchIconBtn}`}
            aria-label="Open search"
            onClick={openSearchOverlay}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
            </svg>
          </button>

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
            {cartCount > 0 && <span className={`${styles.badge} ${cartPulse ? styles.badgePulse : ''}`}>{cartCount}</span>}
          </Link>

          <div className={styles.accountWrap} ref={accountRef}>
            <button
              className={styles.accountBtn}
              onClick={() => setAccountOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-label="Account options"
            >
              Account
            </button>

            {accountOpen && (
              <div className={styles.accountMenu} role="menu" aria-label="Account menu">
                <button className={styles.accountItem} onClick={() => toast('Profile coming soon', 'info')} role="menuitem">Profile</button>
                <button className={styles.accountItem} onClick={() => toast('Orders coming soon', 'info')} role="menuitem">Orders</button>
                <button className={styles.accountItem} onClick={() => toast('Auth is mocked in this demo', 'info')} role="menuitem">Sign Out</button>
              </div>
            )}
          </div>

          <button
            className={styles.hamburger}
            onClick={() => {
              setMenuOpen((open) => {
                const next = !open
                if (next) refreshRecent()
                return next
              })
              setShopMenuOpen(false)
              setAccountOpen(false)
              setSearchOverlayOpen(false)
            }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={menuOpen ? styles.bar1Open : styles.bar1} />
            <span className={menuOpen ? styles.bar2Open : styles.bar2} />
            <span className={menuOpen ? styles.bar3Open : styles.bar3} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)}>
          <aside className={styles.drawer} onClick={(e) => e.stopPropagation()} aria-label="Mobile navigation drawer">
            <div className={styles.drawerHead}>
              <p>Menu</p>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">Close</button>
            </div>

            <div className={styles.drawerLinks}>
              <NavLink to="/" className={drawerLinkClass} onClick={() => setMenuOpen(false)} end>Home</NavLink>
              <NavLink to="/shop" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>Shop</NavLink>
              <NavLink to="/collections" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>Collections</NavLink>
              <NavLink to="/lookbook" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>Lookbook</NavLink>
            </div>

            <div className={styles.drawerSection}>
              <p className={styles.drawerTitle}>Quick Shop</p>
              <div className={styles.drawerShortcutGrid}>
                {SHORTCUTS.map(link => (
                  <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>
                ))}
              </div>
            </div>

            <div className={styles.drawerSection}>
              <p className={styles.drawerTitle}>Recently Viewed</p>
              {recentViewedProducts.length === 0 ? (
                <p className={styles.drawerEmpty}>No recently viewed items</p>
              ) : (
                <div className={styles.drawerRecentList}>
                  {recentViewedProducts.map(item => (
                    <Link key={item.id} to={`/product/${item.id}`} onClick={() => setMenuOpen(false)}>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              className={`btn btn-outline ${styles.searchOverlayBtn}`}
              onClick={() => {
                setMenuOpen(false)
                openSearchOverlay()
              }}
            >
              Search Products
            </button>
          </aside>
        </div>
      )}

      {searchOverlayOpen && (
        <div className={styles.searchOverlay} onClick={() => setSearchOverlayOpen(false)}>
          <div className={styles.searchPanel} onClick={(e) => e.stopPropagation()} ref={mobileSearchRef}>
            <div className={styles.searchPanelHead}>
              <p>Search</p>
              <button onClick={() => setSearchOverlayOpen(false)} aria-label="Close search">Close</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const next = mobileQuery.trim()
                if (!next) return
                navigate(`/shop?search=${encodeURIComponent(next)}`)
                setSearchOverlayOpen(false)
              }}
            >
              <input
                type="search"
                placeholder="Search by name, brand, tag"
                value={mobileQuery}
                onChange={(e) => {
                  setMobileQuery(e.target.value)
                  setMobileSearchOpen(true)
                  setMobileActive(-1)
                }}
                onFocus={() => setMobileSearchOpen(true)}
                onKeyDown={handleMobileKeyDown}
                className={styles.searchOverlayInput}
                aria-label="Mobile product search"
                aria-controls="mobile-search-results"
                aria-expanded={mobileSearchOpen}
                autoFocus
              />
            </form>

            {mobileSearchOpen && mobileQuery.trim() && (
              <div className={styles.searchOverlayResults} id="mobile-search-results" role="listbox">
                {mobileMatches.length === 0 ? (
                  <p className={styles.searchEmpty}>No matching products found</p>
                ) : (
                  mobileMatches.map((item, idx) => (
                    <button
                      key={item.id}
                      className={`${styles.searchItem} ${idx === mobileActive ? styles.searchItemActive : ''}`}
                      onMouseEnter={() => setMobileActive(idx)}
                      onClick={() => onSearchNavigate(item.id)}
                      role="option"
                      aria-selected={idx === mobileActive}
                    >
                      <AppImage src={item.images[0]} alt="" />
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.brand}</small>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
