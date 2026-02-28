# Codex Implementation Report

## Audit
- Routes/pages: `/`, `/shop`, `/collections`, `/lookbook`, `/product/:id`, `/cart`, `/wishlist`, `/shipping`, `/returns`, `/privacy`, `*` (not found).
- Key components: `Navbar`, `ProductCard`, `Filters`, `SiteFooter`, `Toast`, `QuantitySelector`, `BackToTop`.
- Store/state shape (`StoreContext`): `{ cart: [], wishlist: [], toasts: [] }` with reducer actions for cart CRUD, wishlist toggle/remove, toast add/remove.
- Product data source: `useProducts()` fetches `/public/products.json` (now normalized at runtime for gallery images + rating metadata).

## Top 10 Issues Found
1. Product image reliability relied on remote URLs with no resilient fallback handling.
2. No shared product image loading skeleton; card/detail loading felt abrupt.
3. Many products had only one image, making detail gallery inconsistent.
4. Product card aspect ratio did not match the requested clean 4:5 fashion grid.
5. Pricing display formatting was inconsistent across cart, wishlist, lookbook, and cards.
6. Design tokens existed but spacing/typography/input systems were not fully normalized.
7. Shop empty state had only one action and weak recovery path.
8. Product detail add-to-cart state gave limited feedback when options were missing.
9. Navbar active link affordance was subtle and lacked stronger professional nav rhythm.
10. Footer newsletter validation allowed weak input quality and lacked inline error state.

## Plan (PR-sized)
- PR-A: Image infrastructure and gallery normalization.
- PR-B: Design token and global UI consistency pass.
- PR-C: Navbar/footer polish while preserving existing features.
- PR-D: Product card UX and unified currency formatting.
- PR-E: Shop-page loading/empty-state friction reduction.
- PR-F: Product-detail variant/gallery interaction refinement.

## PR-A
### Explanation
Implemented a reusable `AppImage` with shimmer loading and robust fallback to `/images/placeholder.jpg`, then applied it across product image surfaces. Runtime product normalization now guarantees 3 gallery images using a 30-URL pool.

### Files (Full Content)

#### public/images/placeholder.jpg
`Binary file created (JPEG placeholder).`

#### src/components/AppImage.jsx
```jsx
import { useEffect, useMemo, useState } from 'react'
import styles from './AppImage.module.css'

const DEFAULT_FALLBACK = '/images/placeholder.jpg'

export default function AppImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallbackSrc = DEFAULT_FALLBACK,
  onLoad,
  onError,
  ...props
}) {
  const resolvedSrc = useMemo(() => {
    if (typeof src === 'string' && src.trim()) return src.trim()
    return fallbackSrc
  }, [src, fallbackSrc])

  const [currentSrc, setCurrentSrc] = useState(resolvedSrc)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setCurrentSrc(resolvedSrc)
    setIsLoading(true)
  }, [resolvedSrc])

  const handleLoad = (event) => {
    setIsLoading(false)
    if (onLoad) onLoad(event)
  }

  const handleError = (event) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
      return
    }

    setIsLoading(false)
    if (onError) onError(event)
  }

  return (
    <span className={`${styles.wrap} ${wrapperClassName} ${isLoading ? styles.loading : ''}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`${styles.img} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        {...props}
      />
      <span className={styles.shimmer} aria-hidden="true" />
    </span>
  )
}

```

#### src/components/AppImage.module.css
```css
.wrap {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--surface-muted);
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.25s ease;
}

.loading .img {
  opacity: 0;
}

.shimmer {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  background: linear-gradient(
    110deg,
    rgba(255, 255, 255, 0) 8%,
    rgba(255, 255, 255, 0.58) 40%,
    rgba(255, 255, 255, 0) 78%
  );
  transform: translateX(-100%);
}

.loading .shimmer {
  opacity: 1;
  animation: shimmer 1.2s linear infinite;
}

@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .img {
    transition: none;
  }

  .loading .shimmer {
    animation: none;
    opacity: 0.65;
  }
}

```

#### src/data/productImagePool.js
```js
export const PRODUCT_IMAGE_POOL = [
  'https://picsum.photos/seed/vaux-01/900/1125',
  'https://picsum.photos/seed/vaux-02/900/1125',
  'https://picsum.photos/seed/vaux-03/900/1125',
  'https://picsum.photos/seed/vaux-04/900/1125',
  'https://picsum.photos/seed/vaux-05/900/1125',
  'https://picsum.photos/seed/vaux-06/900/1125',
  'https://picsum.photos/seed/vaux-07/900/1125',
  'https://picsum.photos/seed/vaux-08/900/1125',
  'https://picsum.photos/seed/vaux-09/900/1125',
  'https://picsum.photos/seed/vaux-10/900/1125',
  'https://picsum.photos/seed/vaux-11/900/1125',
  'https://picsum.photos/seed/vaux-12/900/1125',
  'https://picsum.photos/seed/vaux-13/900/1125',
  'https://picsum.photos/seed/vaux-14/900/1125',
  'https://picsum.photos/seed/vaux-15/900/1125',
  'https://picsum.photos/seed/vaux-16/900/1125',
  'https://picsum.photos/seed/vaux-17/900/1125',
  'https://picsum.photos/seed/vaux-18/900/1125',
  'https://picsum.photos/seed/vaux-19/900/1125',
  'https://picsum.photos/seed/vaux-20/900/1125',
  'https://picsum.photos/seed/vaux-21/900/1125',
  'https://picsum.photos/seed/vaux-22/900/1125',
  'https://picsum.photos/seed/vaux-23/900/1125',
  'https://picsum.photos/seed/vaux-24/900/1125',
  'https://picsum.photos/seed/vaux-25/900/1125',
  'https://picsum.photos/seed/vaux-26/900/1125',
  'https://picsum.photos/seed/vaux-27/900/1125',
  'https://picsum.photos/seed/vaux-28/900/1125',
  'https://picsum.photos/seed/vaux-29/900/1125',
  'https://picsum.photos/seed/vaux-30/900/1125',
]

```

#### src/hooks/useProducts.js
```js
import { useState, useEffect } from 'react'
import { PRODUCT_IMAGE_POOL } from '../data/productImagePool'

let cache = null
const MIN_IMAGE_COUNT = 3
const LOCAL_PLACEHOLDER = '/images/placeholder.jpg'

const normalizeImageList = (images, productId) => {
  const clean = Array.isArray(images)
    ? images.filter((image) => typeof image === 'string' && image.trim())
    : []

  const gallery = [...clean]
  while (gallery.length < MIN_IMAGE_COUNT) {
    const seedIndex = Math.abs((productId * 11 + gallery.length * 7) % PRODUCT_IMAGE_POOL.length)
    gallery.push(PRODUCT_IMAGE_POOL[seedIndex] || LOCAL_PLACEHOLDER)
  }

  return gallery.slice(0, MIN_IMAGE_COUNT)
}

const normalizeProduct = (product) => ({
  ...product,
  images: normalizeImageList(product.images, Number(product.id) || 0),
  rating: Number.isFinite(product.rating)
    ? Math.max(0, Math.min(5, product.rating))
    : Number((3.8 + ((Number(product.id) * 13) % 12) / 10).toFixed(1)),
  reviewCount: Number.isInteger(product.reviewCount) && product.reviewCount >= 0
    ? product.reviewCount
    : 26 + ((Number(product.id) * 17) % 210),
})

const normalizeProducts = (data) => {
  if (!Array.isArray(data)) return []
  return data.map(normalizeProduct)
}

export function useProducts() {
  const [products, setProducts] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cache) return

    fetch('/products.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load products')
        return response.json()
      })
      .then((data) => {
        const normalized = normalizeProducts(data)
        cache = normalized
        setProducts(normalized)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { products, loading, error }
}

```

#### src/components/Navbar.jsx
```jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useProducts } from '../hooks/useProducts'
import AppImage from './AppImage'
import styles from './Navbar.module.css'

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts'

const SHORTCUTS = [
  { label: 'New Arrivals', to: '/shop?sort=newest' },
  { label: 'Sale', to: '/shop?sale=1' },
  { label: 'Clothing', to: '/shop?category=clothing' },
  { label: 'Shoes', to: '/shop?category=shoes' },
  { label: 'Belts', to: '/shop?category=belts' },
  { label: 'Accessories', to: '/shop?category=accessories' },
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

  const [desktopQuery, setDesktopQuery] = useState('')
  const [mobileQuery, setMobileQuery] = useState('')
  const [desktopActive, setDesktopActive] = useState(-1)
  const [mobileActive, setMobileActive] = useState(-1)
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const [recentIds, setRecentIds] = useState(loadRecentIds)

  const location = useLocation()
  const navigate = useNavigate()

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

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.logo}>VAUX</Link>

          <div className={styles.links}>
            <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''} end>Home</NavLink>

            <div className={styles.shopMenuWrap} ref={shopMenuRef}>
              <button
                className={`${styles.shopTrigger} ${location.pathname.startsWith('/shop') ? styles.active : ''}`}
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
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Open menu"
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
              <NavLink to="/" onClick={() => setMenuOpen(false)} end>Home</NavLink>
              <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
              <NavLink to="/collections" onClick={() => setMenuOpen(false)}>Collections</NavLink>
              <NavLink to="/lookbook" onClick={() => setMenuOpen(false)}>Lookbook</NavLink>
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
                setSearchOverlayOpen(true)
                setMobileSearchOpen(true)
                setMobileActive(-1)
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

```

#### src/components/Navbar.module.css
```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  height: var(--nav-h);
  background: rgba(250, 248, 245, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--sand-dark);
}

.inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  height: 100%;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 1.25rem;
}

@media (min-width: 768px) {
  .inner { padding: 0 2rem; }
}

.left {
  display: flex;
  align-items: center;
  gap: 1.4rem;
  min-width: 0;
}

.logo {
  font-family: var(--font-serif);
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: .2em;
  color: var(--ink);
  flex-shrink: 0;
}

.links {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.links a,
.shopTrigger {
  position: relative;
  padding: .25rem .2rem;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  transition: color .2s;
}

.links a::after,
.shopTrigger::after {
  content: '';
  position: absolute;
  left: .2rem;
  right: .2rem;
  bottom: .06rem;
  height: 1px;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform .2s ease;
}

.links a:hover,
.shopTrigger:hover,
.active {
  color: var(--ink);
}

.links a:hover::after,
.shopTrigger:hover::after,
.active::after {
  transform: scaleX(1);
}

.shopMenuWrap {
  position: relative;
}

.shopTrigger {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

.shopMenu {
  position: absolute;
  top: calc(100% + 1rem);
  left: -1rem;
  width: min(520px, 86vw);
  background: var(--white);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .85rem;
}

.menuSection {
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  padding: .75rem;
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.menuTitle {
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--ink-muted);
  margin-bottom: .3rem;
}

.menuLink {
  font-size: .78rem;
  color: var(--ink-light);
  padding: .35rem .45rem;
  border-radius: 4px;
  transition: background .2s, color .2s;
}

.menuLink:hover {
  background: var(--cream);
  color: var(--ink);
}

.menuEmpty {
  font-size: .76rem;
  color: var(--ink-muted);
}

.menuRecent {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .76rem;
  color: var(--ink-light);
  padding: .3rem .4rem;
  border-radius: 4px;
  transition: background .2s, color .2s;
}

.menuRecent > span {
  width: 30px;
  height: 36px;
  border-radius: 3px;
  background: var(--sand);
  flex-shrink: 0;
}

.menuRecent:hover {
  background: var(--cream);
  color: var(--ink);
}

.searchDesktop {
  position: relative;
  width: min(520px, 44vw);
}

.searchInput {
  height: 38px;
  border-radius: 999px;
  padding-inline: 1rem;
  font-size: .78rem;
}

.searchResults,
.searchOverlayResults {
  margin-top: .5rem;
  background: var(--white);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
  padding: .4rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  max-height: min(360px, 60vh);
  overflow-y: auto;
}

.searchItem {
  width: 100%;
  display: flex;
  align-items: center;
  gap: .55rem;
  text-align: left;
  padding: .45rem;
  border-radius: 6px;
  color: var(--ink-light);
  transition: background .2s;
}

.searchItem > span {
  width: 34px;
  height: 42px;
  border-radius: 4px;
  background: var(--sand);
  flex-shrink: 0;
}

.searchItem > span:last-child {
  display: grid;
  gap: .08rem;
}

.searchItem strong {
  font-size: .76rem;
  color: var(--ink);
  font-weight: 500;
}

.searchItem small {
  font-size: .7rem;
  color: var(--ink-muted);
}

.searchItem:hover,
.searchItemActive {
  background: var(--cream);
}

.searchEmpty {
  font-size: .78rem;
  color: var(--ink-muted);
  padding: .5rem;
}

.right {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: .7rem;
}

.iconBtn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background .2s;
}

.iconBtn:hover {
  background: var(--sand);
}

.badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: var(--ink);
  color: var(--white);
  font-size: .62rem;
  font-weight: 700;
  min-width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.badgePulse {
  animation: badgePulse .32s ease;
}

@keyframes badgePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.22); }
  100% { transform: scale(1); }
}

.accountWrap {
  position: relative;
}

.accountBtn {
  height: 32px;
  padding: 0 .65rem;
  border: 1px solid var(--sand-dark);
  border-radius: 999px;
  font-size: .68rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-light);
  background: var(--white);
}

.accountMenu {
  position: absolute;
  top: calc(100% + .65rem);
  right: 0;
  width: 170px;
  background: var(--white);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-md);
  padding: .35rem;
  display: grid;
  gap: .2rem;
}

.accountItem {
  width: 100%;
  text-align: left;
  font-size: .76rem;
  color: var(--ink-light);
  padding: .45rem .5rem;
  border-radius: 4px;
}

.accountItem:hover {
  background: var(--cream);
  color: var(--ink);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: .4rem;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 21px;
  height: 1.5px;
  background: var(--ink);
  transition: all .25s;
  transform-origin: center;
}

.bar1Open { transform: translateY(5.5px) rotate(45deg); }
.bar2Open { opacity: 0; transform: scaleX(0); }
.bar3Open { transform: translateY(-5.5px) rotate(-45deg); }

.drawerOverlay,
.searchOverlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 24, .36);
  backdrop-filter: blur(2px);
  z-index: 140;
  display: flex;
}

.drawer {
  margin-left: auto;
  width: min(420px, 90vw);
  height: 100%;
  background: var(--cream);
  border-left: 1px solid var(--sand-dark);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.drawerHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: .85rem;
  color: var(--ink);
}

.drawerHead button {
  font-size: .75rem;
  color: var(--ink-muted);
  text-decoration: underline;
}

.drawerLinks {
  display: grid;
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  background: var(--white);
}

.drawerLinks a {
  padding: .85rem .9rem;
  font-size: .85rem;
  border-bottom: 1px solid var(--sand-dark);
}

.drawerLinks a:last-child {
  border-bottom: none;
}

.drawerSection {
  border: 1px solid var(--sand-dark);
  background: var(--white);
  border-radius: var(--r-sm);
  padding: .8rem;
}

.drawerTitle {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--ink-muted);
  margin-bottom: .6rem;
}

.drawerShortcutGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .45rem;
}

.drawerShortcutGrid a {
  font-size: .76rem;
  color: var(--ink-light);
  border: 1px solid var(--sand-dark);
  border-radius: 4px;
  padding: .45rem .5rem;
}

.drawerRecentList {
  display: grid;
  gap: .4rem;
}

.drawerRecentList a {
  font-size: .78rem;
  color: var(--ink-light);
}

.drawerEmpty {
  font-size: .78rem;
  color: var(--ink-muted);
}

.searchOverlayBtn {
  width: 100%;
  height: 42px;
  font-size: .72rem;
}

.searchPanel {
  margin: 8vh auto auto;
  width: min(680px, 92vw);
  background: var(--cream);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
  padding: 1rem;
}

.searchPanelHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .75rem;
  font-size: .9rem;
}

.searchPanelHead button {
  font-size: .76rem;
  color: var(--ink-muted);
  text-decoration: underline;
}

.searchOverlayInput {
  height: 42px;
  border-radius: var(--r-sm);
}

@media (max-width: 1099px) {
  .inner {
    grid-template-columns: 1fr auto;
  }

  .searchDesktop,
  .links,
  .accountWrap {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .badgePulse {
    animation: none;
  }
}

```

#### src/pages/Home.jsx
```jsx
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ProductCard from '../components/ProductCard'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Home.module.css'

const FEATURED_COLLECTIONS = [
  {
    name: 'Men',
    desc: 'Clean tailoring and elevated essentials.',
    to: '/shop?category=clothing&sort=newest',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900',
  },
  {
    name: 'Women',
    desc: 'Structured layers with effortless silhouettes.',
    to: '/shop?category=shoes&sort=newest',
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900',
  },
  {
    name: 'Accessories',
    desc: 'Details that complete a modern wardrobe.',
    to: '/shop?category=accessories&sort=newest',
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900',
  },
]

export default function Home() {
  const { products, loading } = useProducts()
  const collectionsReveal = useScrollReveal()
  const arrivalsReveal = useScrollReveal()
  const lifestyleReveal = useScrollReveal()
  const aboutReveal = useScrollReveal()
  const featuredReveal = useScrollReveal()

  const featured = products.filter(p => p.featured).slice(0, 6)
  const newArrivals = [...products].sort((a, b) => b.id - a.id).slice(0, 10)

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>VAUX Atelier</p>
          <h1 className={styles.heroTitle}>Crafted for <em>Quiet Confidence</em></h1>
          <p className={styles.heroSub}>A modern fashion house balancing utility, restraint, and expressive tailoring.</p>
          <div className={styles.heroActions}>
            <Link to="/shop?sort=newest" className="btn btn-primary">Shop New</Link>
            <Link to="/lookbook" className="btn btn-outline">View Lookbook</Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section
        className={`${styles.section} reveal ${collectionsReveal.isVisible ? 'reveal-in' : ''}`}
        ref={collectionsReveal.ref}
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Featured Collections</h2>
            <Link to="/collections" className={styles.viewAll}>Explore Collections -&gt;</Link>
          </div>
          <div className={styles.collectionGrid}>
            {FEATURED_COLLECTIONS.map((collection) => (
              <Link key={collection.name} to={collection.to} className={styles.collectionCard}>
                <AppImage src={collection.img} alt={collection.name} className={styles.collectionImg} />
                <div className={styles.collectionOverlay}>
                  <h3>{collection.name}</h3>
                  <p>{collection.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Carousel */}
      <section
        className={`${styles.section} reveal ${arrivalsReveal.isVisible ? 'reveal-in' : ''}`}
        ref={arrivalsReveal.ref}
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <Link to="/shop?sort=newest" className={styles.viewAll}>Shop Latest -&gt;</Link>
          </div>
          <div className={styles.arrivalRail}>
            {newArrivals.map((item) => (
              <article key={item.id} className={styles.arrivalCard}>
                <Link to={`/product/${item.id}`} className={styles.arrivalImageWrap}>
                  <AppImage src={item.images[0]} alt={item.name} className={styles.arrivalImage} loading="lazy" />
                </Link>
                <div className={styles.arrivalInfo}>
                  <p>{item.brand}</p>
                  <Link to={`/product/${item.id}`}>{item.name}</Link>
                  <span>{formatCurrency(item.salePrice ?? item.price)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Banner */}
      <section
        className={`${styles.section} ${styles.lifestyleSection} reveal ${lifestyleReveal.isVisible ? 'reveal-in' : ''}`}
        ref={lifestyleReveal.ref}
      >
        <div className="container">
          <div className={styles.lifestyleCard}>
            <AppImage
              src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1400"
              alt="Lifestyle editorial"
              className={styles.lifestyleImg}
            />
            <div className={styles.lifestyleCopy}>
              <p className={styles.lifestyleEyebrow}>Campaign Journal</p>
              <h2>Built for city rhythm and weekend quiet</h2>
              <p>From early commutes to midnight streets, each piece is made to layer, move, and endure.</p>
              <Link to="/lookbook" className="btn btn-outline">Read the Story</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial About */}
      <section
        className={`${styles.section} reveal ${aboutReveal.isVisible ? 'reveal-in' : ''}`}
        ref={aboutReveal.ref}
      >
        <div className="container">
          <div className={styles.aboutBlock}>
            <p className={styles.aboutEyebrow}>About The Brand</p>
            <h2 className={styles.sectionTitle}>A wardrobe philosophy, not fast trends</h2>
            <p>
              VAUX designs seasonless staples with durable fabrics, thoughtful proportions, and versatile styling.
              Every release focuses on longevity, so your wardrobe grows intentionally.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        className={`${styles.section} reveal ${featuredReveal.isVisible ? 'reveal-in' : ''}`}
        ref={featuredReveal.ref}
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Featured</h2>
            <Link to="/shop" className={styles.viewAll}>View All -&gt;</Link>
          </div>
          {loading ? (
            <div className={styles.loading}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * .06}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className={styles.banner}>
        <div className="container">
          <p className={styles.bannerText}>Free shipping on orders over $150</p>
          <p className={styles.bannerSub}>Worldwide delivery | 30-day returns</p>
        </div>
      </section>

      {/* Home Footer Signature */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerLogo}>VAUX</p>
          <p className={styles.footerSub}>(c) 2024 VAUX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

```

#### src/pages/Lookbook.jsx
```jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LOOKBOOK_ENTRIES } from '../data/lookbook'
import BackToTop from '../components/BackToTop'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Lookbook.module.css'

export default function Lookbook() {
  const { products, loading } = useProducts()
  const gridReveal = useScrollReveal()
  const [activeId, setActiveId] = useState(null)

  const activeEntry = useMemo(
    () => LOOKBOOK_ENTRIES.find(entry => entry.id === activeId) || null,
    [activeId]
  )

  const linkedProducts = useMemo(() => {
    if (!activeEntry) return []
    return activeEntry.productIds
      .map(id => products.find(product => product.id === id))
      .filter(Boolean)
  }, [activeEntry, products])

  useEffect(() => {
    if (!activeEntry) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveId(null)
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeEntry])

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Editorial</p>
        <h1>Lookbook</h1>
        <p className={styles.sub}>A visual journal pairing garments, accessories, and atmosphere.</p>
      </header>

      {loading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <div
          className={`${styles.grid} reveal ${gridReveal.isVisible ? 'reveal-in' : ''}`}
          ref={gridReveal.ref}
        >
          {LOOKBOOK_ENTRIES.map((entry, i) => (
            <button
              key={entry.id}
              className={`${styles.frame} ${i % 2 === 0 ? styles.tall : styles.wide}`}
              onClick={() => setActiveId(entry.id)}
              aria-label={`Open lookbook story ${entry.title}`}
            >
              <AppImage src={entry.image} alt={entry.title} className={styles.image} />
              <div className={styles.overlay}>
                <p>{entry.title}</p>
                <span>{entry.caption}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeEntry && (
        <div className={styles.modalOverlay} onClick={() => setActiveId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Lookbook details">
            <button className={styles.closeBtn} onClick={() => setActiveId(null)} aria-label="Close lookbook modal">Close</button>
            <div className={styles.modalImageWrap}>
              <AppImage src={activeEntry.image} alt={activeEntry.title} className={styles.modalImage} />
            </div>
            <div className={styles.modalInfo}>
              <h2>{activeEntry.title}</h2>
              <p>{activeEntry.caption}</p>

              <div className={styles.productLinks}>
                {linkedProducts.map(product => (
                  <Link key={product.id} to={`/product/${product.id}`} onClick={() => setActiveId(null)} className={styles.productLink}>
                    <AppImage src={product.images[0]} alt="" />
                    <span>
                      <strong>{product.name}</strong>
                      <small>{formatCurrency(product.salePrice ?? product.price)}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <BackToTop />
    </div>
  )
}

```

#### src/pages/Lookbook.module.css
```css
.header {
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--sand-dark);
  margin-bottom: 2rem;
}

.eyebrow {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .16em;
  color: var(--ink-muted);
  margin-bottom: .55rem;
}

.header h1 {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 300;
  margin-bottom: .55rem;
}

.sub {
  color: var(--ink-light);
  max-width: 58ch;
  font-size: .92rem;
}

.loadingGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 900px) {
  .loadingGrid { grid-template-columns: repeat(2, 1fr); }
}

.skeleton {
  aspect-ratio: 4/3;
  border-radius: var(--r-md);
  background: var(--sand);
  animation: pulse 1.5s ease infinite;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 180px;
  }
}

.frame {
  position: relative;
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--sand);
  cursor: pointer;
  padding: 0;
  border: 1px solid var(--sand-dark);
}

.frame::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, .25);
  border-radius: inherit;
  pointer-events: none;
}

@media (max-width: 899px) {
  .frame { aspect-ratio: 4/3; }
}

@media (min-width: 900px) {
  .tall {
    grid-column: span 7;
    grid-row: span 2;
  }

  .wide {
    grid-column: span 5;
    grid-row: span 2;
  }
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .45s;
}

.frame:hover .image {
  transform: scale(1.04);
}

.overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(10, 10, 10, .72), rgba(10, 10, 10, .03));
  color: var(--white);
  padding: .95rem;
  text-align: left;
}

.overlay p {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 400;
  margin-bottom: .25rem;
}

.overlay span {
  font-size: .8rem;
  color: rgba(255, 255, 255, .88);
  line-height: 1.4;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: rgba(16, 16, 14, .72);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.modal {
  position: relative;
  width: min(980px, 94vw);
  max-height: 92vh;
  background: var(--cream);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
}

@media (min-width: 900px) {
  .modal {
    grid-template-columns: 1.25fr 1fr;
  }
}

.closeBtn {
  position: absolute;
  top: .75rem;
  right: .75rem;
  z-index: 3;
  border: 1px solid var(--sand-dark);
  border-radius: 999px;
  background: rgba(255, 255, 255, .9);
  padding: .35rem .8rem;
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .09em;
}

.modalImageWrap {
  min-height: 280px;
}

.modalImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modalInfo {
  padding: 1rem;
  overflow-y: auto;
}

@media (min-width: 900px) {
  .modalInfo { padding: 1.5rem; }
}

.modalInfo h2 {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: .55rem;
}

.modalInfo p {
  font-size: .9rem;
  color: var(--ink-light);
  margin-bottom: 1rem;
}

.productLinks {
  display: grid;
  gap: .55rem;
}

.productLink {
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  background: var(--white);
  padding: .45rem;
  display: flex;
  gap: .55rem;
  align-items: center;
  transition: border-color .2s;
}

.productLink:hover {
  border-color: var(--ink);
}

.productLink > span:first-child {
  width: 46px;
  height: 58px;
  border-radius: 4px;
  background: var(--sand);
  flex-shrink: 0;
}

.productLink > span:last-child {
  display: grid;
  gap: .12rem;
}

.productLink strong {
  font-size: .83rem;
  line-height: 1.25;
}

.productLink small {
  font-size: .78rem;
  color: var(--ink-muted);
}

@keyframes pulse {
  0% { opacity: .5; }
  50% { opacity: .86; }
  100% { opacity: .5; }
}

```

#### src/pages/Collections.jsx
```jsx
import { Link } from 'react-router-dom'
import BackToTop from '../components/BackToTop'
import { useScrollReveal } from '../hooks/useScrollReveal'
import AppImage from '../components/AppImage'
import styles from './Collections.module.css'

const COLLECTIONS = [
  {
    name: 'Minimal Essentials',
    desc: 'Core layers in neutral palettes for daily wear.',
    to: '/shop?category=clothing&sort=newest',
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000',
  },
  {
    name: 'Street Utility',
    desc: 'Practical silhouettes and workwear references.',
    to: '/shop?tag=utility&sort=newest',
    img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1000',
  },
  {
    name: 'Office Core',
    desc: 'Polished textures and refined accessories.',
    to: '/shop?category=accessories&sort=price-desc',
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000',
  },
  {
    name: 'Weekend Fit',
    desc: 'Relaxed staples built for movement and comfort.',
    to: '/shop?tag=casual&sort=newest',
    img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000',
  },
]

export default function Collections() {
  const gridReveal = useScrollReveal()

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Curated Edit</p>
        <h1>Collections</h1>
        <p className={styles.sub}>Explore signature wardrobes designed around everyday rhythm and seasonal mood.</p>
      </header>

      <div
        className={`${styles.grid} reveal ${gridReveal.isVisible ? 'reveal-in' : ''}`}
        ref={gridReveal.ref}
      >
        {COLLECTIONS.map((collection, i) => (
          <article key={collection.name} className={styles.card} style={{ animationDelay: `${i * .05}s` }}>
            <Link to={collection.to} className={styles.imageWrap}>
              <AppImage src={collection.img} alt={collection.name} className={styles.image} />
            </Link>
            <div className={styles.info}>
              <h2>{collection.name}</h2>
              <p>{collection.desc}</p>
              <Link to={collection.to} className={styles.link}>Shop this Collection -&gt;</Link>
            </div>
          </article>
        ))}
      </div>

      <BackToTop />
    </div>
  )
}

```

#### src/pages/Cart.jsx
```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Cart.module.css'

const SHIPPING = 12
const PROMO_CODES = {
  SAVE10: { code: 'SAVE10', type: 'percent', value: 0.1, label: '10% off items' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 0, label: 'Free shipping' },
}

export default function Cart() {
  const { state, dispatch, toast } = useStore()
  const { cart } = state
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')

  const subtotal = cart.reduce((s, i) => {
    const price = i.product.salePrice ?? i.product.price
    return s + price * i.qty
  }, 0)

  useEffect(() => {
    if (cart.length === 0) {
      setPromoInput('')
      setAppliedPromo(null)
      setPromoError('')
    }
  }, [cart.length])

  const qualifiesForFreeShipping = subtotal >= 150
  const baseShipping = cart.length === 0 ? 0 : qualifiesForFreeShipping ? 0 : SHIPPING
  const discount = appliedPromo?.type === 'percent' ? subtotal * appliedPromo.value : 0
  const shipping = appliedPromo?.type === 'shipping' ? 0 : baseShipping
  const total = Math.max(0, subtotal - discount + shipping)

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

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()

    if (!code) {
      setPromoError('Enter a promo code first.')
      toast('Enter a promo code first', 'error')
      return
    }

    const promo = PROMO_CODES[code]
    if (!promo) {
      setPromoError('Invalid promo code. Try SAVE10 or FREESHIP.')
      toast('Invalid promo code', 'error')
      return
    }

    if (appliedPromo?.code === promo.code) {
      setPromoError(`${promo.code} is already applied.`)
      toast(`${promo.code} is already applied`, 'info')
      return
    }

    const replacingCode = appliedPromo?.code
    setAppliedPromo(promo)
    setPromoInput('')
    setPromoError('')
    if (replacingCode) {
      toast(`${replacingCode} replaced with ${promo.code}`, 'info')
      return
    }
    toast(`${promo.code} applied`)
  }

  const removePromo = () => {
    if (!appliedPromo) return
    setAppliedPromo(null)
    setPromoError('')
    toast('Promo removed', 'info')
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
                  <AppImage src={item.product.images[0]} alt={item.product.name} className={styles.img} />
                </Link>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTop}>
                    <div>
                      <p className={styles.itemBrand}>{item.product.brand}</p>
                      <Link to={`/product/${item.product.id}`} className={styles.itemName}>{item.product.name}</Link>
                      <p className={styles.itemMeta}>{item.color} | {item.size}</p>
                    </div>
                    <p className={styles.itemPrice}>{formatCurrency(price * item.qty)}</p>
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

          <div className={styles.promoWrap}>
            <p className={styles.promoLabel}>Promo Code</p>
            <form
              className={styles.promoRow}
              onSubmit={(e) => {
                e.preventDefault()
                applyPromo()
              }}
            >
              <input
                value={promoInput}
                onChange={e => {
                  setPromoInput(e.target.value)
                  if (promoError) setPromoError('')
                }}
                placeholder="SAVE10 or FREESHIP"
                className={styles.promoInput}
                aria-label="Promo code"
              />
              <button
                type="submit"
                className={`btn btn-primary ${styles.applyBtn}`}
              >
                Apply
              </button>
            </form>
            {promoError && <p className={styles.promoError}>{promoError}</p>}
            {appliedPromo && (
              <div className={styles.appliedPromo}>
                <span>{appliedPromo.code}: {appliedPromo.label}</span>
                <button className={styles.removePromoBtn} onClick={removePromo}>Remove</button>
              </div>
            )}
          </div>

          <div className={styles.summaryRows}>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className={styles.row}>
              <span>Discount</span>
              <span style={{ color: discount > 0 ? 'var(--success)' : 'inherit' }}>
                {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
              </span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : formatCurrency(SHIPPING)}</span>
            </div>
            {appliedPromo?.type === 'shipping' && baseShipping > 0 && (
              <p className={styles.shippingNote}>
                FREESHIP applied
              </p>
            )}
            {shipping > 0 && subtotal > 0 && (
              <p className={styles.shippingNote}>
                Add {formatCurrency(150 - subtotal)} more for free shipping
              </p>
            )}
            <hr />
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button className={`btn btn-primary ${styles.checkoutBtn}`}>
            Proceed to Checkout
          </button>
          <Link to="/shop" className={styles.continueShopping}>
            &lt;- Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

```

#### src/pages/Wishlist.jsx
```jsx
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Wishlist.module.css'

export default function Wishlist() {
  const { products } = useProducts()
  const { state, dispatch, toast } = useStore()
  const { wishlist } = state

  const wishedProducts = products.filter(p => wishlist.includes(p.id))

  const getFirstAvailableVariant = (product) => {
    if (!product?.variants?.length) return null
    return product.variants.find(v => v.stock > 0 && v.color && v.size) || null
  }

  const removeFromWishlist = (id) => {
    dispatch({ type: 'REMOVE_WISHLIST', payload: id })
    toast('Removed from wishlist', 'info')
  }

  const moveToCart = (product) => {
    const firstVariant = getFirstAvailableVariant(product)
    if (!firstVariant) {
      toast('No purchasable variant in stock', 'error')
      return
    }
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, color: firstVariant.color, size: firstVariant.size, qty: 1 }
    })
    dispatch({ type: 'REMOVE_WISHLIST', payload: product.id })
    toast(`${product.name} moved to cart`)
  }

  if (wishedProducts.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <svg width="48" height="48" fill="none" stroke="var(--ink-muted)" strokeWidth="1" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
        <p className={styles.emptySub}>Save items you love to come back to them later.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Discover Products</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className={styles.header}>
        <h1>Wishlist <span className={styles.count}>({wishedProducts.length})</span></h1>
      </div>

      <div className={styles.grid}>
        {wishedProducts.map((product, i) => {
          const price = product.salePrice ?? product.price
          const hasStock = product.variants.some(v => v.stock > 0)
          return (
            <article key={product.id} className={styles.card} style={{ animationDelay: `${i * .06}s` }}>
              <Link to={`/product/${product.id}`} className={styles.imgWrap}>
                <AppImage src={product.images[0]} alt={product.name} className={styles.img} />
                {product.salePrice && <span className="tag tag-sale" style={{ position: 'absolute', top: '.75rem', left: '.75rem' }}>Sale</span>}
              </Link>
              <div className={styles.info}>
                <div>
                  <p className={styles.brand}>{product.brand}</p>
                  <Link to={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
                  <p className={styles.price}>
                    <span>{formatCurrency(price)}</span>
                    {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
                  </p>
                </div>
                <div className={styles.btnRow}>
                  <button
                    className={`btn btn-primary ${styles.cartBtn}`}
                    onClick={() => moveToCart(product)}
                    disabled={!hasStock}
                    title={hasStock ? 'Move to cart' : 'Out of stock'}
                  >
                    {hasStock ? 'Move to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

```

#### src/components/ProductCard.jsx
```jsx
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import AppImage from './AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { state, dispatch, toast } = useStore()
  const inWishlist = state.wishlist.includes(product.id)
  const firstAvailableVariant = product.variants.find(v => v.stock > 0)
  const totalStock = product.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock || 0), 0)
  const outOfStock = totalStock < 1
  const showRating = Number.isFinite(product.rating) && Number.isFinite(product.reviewCount) && product.reviewCount > 0

  const toggleWishlist = (e) => {
    e.preventDefault()
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', inWishlist ? 'info' : 'success')
  }

  const displayPrice = product.salePrice ?? product.price

  const quickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!firstAvailableVariant) {
      toast('No stock available', 'error')
      return
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        color: firstAvailableVariant.color,
        size: firstAvailableVariant.size,
        qty: 1,
      },
    })
    toast(`${product.name} added to cart`)
  }

  return (
    <article className={styles.card}>
      <Link to={`/product/${product.id}`} className={styles.imgWrap}>
        <AppImage
          src={product.images[0]}
          alt={product.name}
          className={styles.img}
          wrapperClassName={styles.imgLayer}
          loading="lazy"
        />
        {product.images[1] && (
          <AppImage
            src={product.images[1]}
            alt=""
            className={styles.imgHover}
            wrapperClassName={styles.imgHoverLayer}
            loading="lazy"
          />
        )}
        <div className={styles.tags}>
          {product.salePrice && <span className="tag tag-sale">Sale</span>}
          {outOfStock && <span className={styles.stockTag}>Out of stock</span>}
        </div>

        {!outOfStock && firstAvailableVariant && (
          <button
            className={styles.quickAdd}
            onClick={quickAdd}
            aria-label={`Quick add ${product.name}`}
          >
            Quick Add
          </button>
        )}

        <button
          className={`${styles.wishBtn} ${inWishlist ? styles.wished : ''}`}
          onClick={toggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </Link>

      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <Link to={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
        {showRating && (
          <p className={styles.rating}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.77 5.61L21 8.53l-4.5 4.39 1.06 6.2L12 16.77 6.44 19.12l1.06-6.2L3 8.53l6.23-.92L12 2z" />
            </svg>
            <span>{product.rating.toFixed(1)}</span>
            <span className={styles.reviews}>({product.reviewCount})</span>
          </p>
        )}
        <p className={styles.price}>
          <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
          {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
        </p>
      </div>
    </article>
  )
}

```

#### src/components/ProductCard.module.css
```css
.card {
  display: flex;
  flex-direction: column;
  animation: fadeUp .4s ease both;
  transition: transform .22s ease, box-shadow .22s ease;
  border-radius: var(--r-sm);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.imgWrap {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  background: var(--sand);
  border-radius: var(--r-sm);
}

.imgLayer,
.imgHoverLayer {
  position: absolute;
  inset: 0;
}

.img,
.imgHover {
  transition: opacity .4s ease, transform .5s ease;
}

.imgHoverLayer .imgHover { opacity: 0; }

.imgWrap:hover .imgLayer .img { opacity: 0; }
.imgWrap:hover .imgHoverLayer .imgHover { opacity: 1; }
.imgWrap:hover .img { transform: scale(1.04); }
.imgWrap:hover .imgHover { transform: scale(1.04); }

.tags {
  position: absolute;
  top: .75rem;
  left: .75rem;
  display: flex;
  gap: .35rem;
  flex-wrap: wrap;
  max-width: calc(100% - 3.3rem);
}

.stockTag {
  display: inline-block;
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: .2rem .45rem;
  border-radius: 2px;
  background: rgba(26, 26, 24, .86);
  color: var(--white);
}

.quickAdd {
  position: absolute;
  left: .75rem;
  right: .75rem;
  bottom: .75rem;
  height: 34px;
  border-radius: 4px;
  border: 1px solid var(--ink);
  background: rgba(255, 255, 255, .96);
  color: var(--ink);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .2s, transform .2s;
}

.imgWrap:hover .quickAdd,
.imgWrap:focus-within .quickAdd {
  opacity: 1;
  transform: translateY(0);
}

.wishBtn {
  position: absolute;
  top: .75rem;
  right: .75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(250,248,245,.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-muted);
  transition: all .2s;
  opacity: 0;
}

.imgWrap:hover .wishBtn,
.wishBtn.wished { opacity: 1; }

.wishBtn.wished { color: var(--ink); }
.wishBtn:hover { color: var(--ink); transform: scale(1.1); }

.info {
  padding: .75rem 0 0;
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.brand {
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.name {
  font-size: .9rem;
  color: var(--ink);
  line-height: 1.3;
  transition: opacity .2s;
}
.name:hover { opacity: .7; }

.price { font-size: .875rem; display: flex; gap: .5rem; align-items: baseline; }
.sale { color: var(--ink); }
.original { color: var(--ink-muted); text-decoration: line-through; font-size: .8rem; }

.rating {
  display: flex;
  align-items: center;
  gap: .22rem;
  font-size: .76rem;
  color: var(--ink-light);
}

.rating svg {
  color: var(--accent-dark);
}

.reviews {
  color: var(--ink-muted);
}

@media (prefers-reduced-motion: reduce) {
  .card:hover { transform: none; }
  .quickAdd {
    transform: none;
    transition: opacity .2s;
  }
}

```

#### src/pages/ProductDetail.jsx
```jsx
import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard'
import BackToTop from '../components/BackToTop'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './ProductDetail.module.css'

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts'
const RECENTLY_VIEWED_LIMIT = 6

const loadRecentIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(x => Number.isInteger(x)) : []
  } catch {
    return []
  }
}

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const { state, dispatch, toast } = useStore()

  const product = products.find(p => p.id === Number(id))

  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [recentIds, setRecentIds] = useState(loadRecentIds)

  const inWishlist = product ? state.wishlist.includes(product.id) : false

  const getVariant = (color, size) =>
    product?.variants.find(v => v.color === color && v.size === size)

  const currentVariant = selectedColor && selectedSize
    ? getVariant(selectedColor, selectedSize)
    : null

  useEffect(() => {
    setActiveImg(0)
    setSelectedColor('')
    setSelectedSize('')
    setQty(1)
  }, [product?.id])

  useEffect(() => {
    if (!product) return

    setRecentIds(prev => {
      const next = [product.id, ...prev.filter(pid => pid !== product.id)].slice(0, RECENTLY_VIEWED_LIMIT)
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
      return next
    })
  }, [product])

  const recentlyViewedProducts = useMemo(() => {
    if (!product) return []

    return recentIds
      .filter(pid => pid !== product.id)
      .map(pid => products.find(p => p.id === pid))
      .filter(Boolean)
      .slice(0, RECENTLY_VIEWED_LIMIT)
  }, [recentIds, products, product])

  const relatedProducts = useMemo(() => {
    if (!product) return []

    return products
      .filter(p => p.id !== product.id)
      .map(candidate => {
        const sharedTags = candidate.tags.filter(tag => product.tags.includes(tag)).length
        const score = (candidate.category === product.category ? 2 : 0) + sharedTags
        return { candidate, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.candidate.id - a.candidate.id)
      .slice(0, 4)
      .map(item => item.candidate)
  }, [products, product])

  const maxQty = currentVariant?.stock || 1
  const selectionMissing = !selectedColor || !selectedSize
  const variantOutOfStock = selectedColor && selectedSize && (!currentVariant || currentVariant.stock < 1)
  const canAdd = !selectionMissing && !variantOutOfStock && currentVariant

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    setSelectedSize('')
    setQty(1)
  }

  const handleSizeSelect = (size) => {
    const v = getVariant(selectedColor, size)
    if (!v || v.stock === 0) return
    setSelectedSize(size)
    setQty(1)
  }

  const addToCart = () => {
    if (selectionMissing) {
      toast('Select both color and size before adding to cart', 'info')
      return
    }

    if (!currentVariant || currentVariant.stock < 1) {
      toast('Selected variant is out of stock', 'error')
      return
    }

    dispatch({ type: 'ADD_TO_CART', payload: { product, color: selectedColor, size: selectedSize, qty } })
    toast(`${product.name} added to cart`)
  }

  const toggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist', inWishlist ? 'info' : 'success')
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '1rem' }}>Product not found</h2>
        <Link to="/shop" className="btn btn-outline">Back to Shop</Link>
      </div>
    )
  }

  const displayPrice = product.salePrice ?? product.price

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <Link to="/shop">Shop</Link>
        <span>&gt;</span>
        <Link to={`/shop?category=${product.category}`} className={styles.breadcrumbCategory}>{product.category}</Link>
        <span>&gt;</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <AppImage
              src={product.images[activeImg]}
              alt={product.name}
              className={styles.img}
              wrapperClassName={styles.mainImageMedia}
            />
            {product.salePrice && <span className="tag tag-sale" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Sale</span>}
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <AppImage src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>

          <p className={styles.price}>
            <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
            {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
          </p>

          <hr style={{ margin: '1.5rem 0' }} />

          {/* Color */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Color <span className={styles.selected}>{selectedColor}</span>
            </p>
            <div className={styles.colorBtns}>
              {product.colors.map(color => {
                const hasStock = product.variants.some(v => v.color === color && v.stock > 0)
                return (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${selectedColor === color ? styles.colorActive : ''} ${!hasStock ? styles.outOfStock : ''}`}
                    onClick={() => handleColorSelect(color)}
                    disabled={!hasStock}
                    title={color}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Size <span className={styles.selected}>{selectedSize}</span>
            </p>
            <div className={styles.sizeBtns}>
              {product.sizes.map(size => {
                const v = selectedColor ? getVariant(selectedColor, size) : null
                const isAvail = !selectedColor || (v && v.stock > 0)
                return (
                  <button
                    key={size}
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeActive : ''} ${!isAvail ? styles.outOfStock : ''}`}
                    onClick={() => handleSizeSelect(size)}
                    disabled={!isAvail || !selectedColor}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {!selectedColor && <p className={styles.hint}>Select a color first</p>}
          </div>

          {currentVariant && (
            <p className={styles.stockNote}>
              {currentVariant.stock <= 3
                ? <span style={{ color: 'var(--error)' }}>Only {currentVariant.stock} left!</span>
                : <span style={{ color: 'var(--success)' }}>In stock</span>}
            </p>
          )}

          {/* Qty + CTA */}
          <div className={styles.actions}>
            <QuantitySelector qty={qty} onChange={setQty} max={maxQty} />
            <button
              className={`btn btn-primary ${styles.addBtn}`}
              onClick={addToCart}
              disabled={variantOutOfStock}
              aria-disabled={selectionMissing ? 'true' : undefined}
            >
              {variantOutOfStock ? 'Out of Stock' : canAdd ? 'Add to Cart' : 'Select Options'}
            </button>
          </div>
          {selectionMissing && (
            <p className={styles.addHint}>Pick color and size to continue.</p>
          )}

          <button
            className={`btn ${styles.wishBtn}`}
            onClick={toggleWishlist}
          >
            <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>

          <hr style={{ margin: '1.5rem 0' }} />

          <p className={styles.description}>{product.description}</p>

          <div className={styles.tags}>
            {product.tags.map(tag => (
              <span key={tag} className={styles.tagChip}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Recently Viewed</h2>
            <Link to="/shop" className={styles.sectionLink}>Back to Shop</Link>
          </div>

          {recentlyViewedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No recently viewed products yet.</p>
              <p>Browse products and they will appear here.</p>
            </div>
          ) : (
            <div className="products-grid">
              {recentlyViewedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Related Products</h2>
          </div>

          {relatedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No related products found for this item.</p>
              <p>Try exploring other categories in the shop.</p>
            </div>
          ) : (
            <div className="products-grid">
              {relatedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>
      </div>
      <BackToTop />
    </div>
  )
}

```

#### src/pages/ProductDetail.module.css
```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  color: var(--ink-muted);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.breadcrumb a:hover { color: var(--ink); }
.breadcrumb span { color: var(--ink-muted); }

.breadcrumbCategory {
  text-transform: capitalize;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .layout { grid-template-columns: 1fr 1fr; gap: 3.5rem; }
}

@media (min-width: 1024px) {
  .layout { grid-template-columns: 1.1fr 1fr; }
}

.gallery {
  display: grid;
  gap: .75rem;
}

@media (min-width: 980px) {
  .gallery {
    grid-template-columns: 84px 1fr;
    align-items: start;
  }

  .mainImg {
    grid-column: 2;
    grid-row: 1;
  }

  .thumbs {
    grid-column: 1;
    grid-row: 1;
    flex-direction: column;
  }
}

.mainImg {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  border-radius: var(--r-md);
  background: var(--sand);
}

.mainImageMedia {
  width: 100%;
  height: 100%;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fadeIn .3s ease;
}

.thumbs { display: flex; gap: .6rem; }

.thumb {
  width: 72px;
  height: 88px;
  flex-shrink: 0;
  border-radius: var(--r-sm);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color .2s;
  background: var(--sand);
  padding: 0;
}

.thumb span { width: 100%; height: 100%; }
.thumbActive { border-color: var(--ink); }

.info { display: flex; flex-direction: column; }

.brand {
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: .4rem;
}

.name {
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 300;
  line-height: 1.15;
  margin-bottom: .75rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 500;
  display: flex;
  gap: .75rem;
  align-items: baseline;
}

.sale { color: var(--ink); }
.original { color: var(--ink-muted); text-decoration: line-through; font-size: 1rem; font-weight: 400; }

.optionGroup { margin-bottom: 1.25rem; }

.optionLabel {
  font-size: .72rem;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: .6rem;
  display: flex;
  gap: .5rem;
  align-items: center;
}

.selected {
  font-size: .8rem;
  color: var(--ink);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.colorBtns, .sizeBtns {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}

.colorBtn {
  font-size: .75rem;
  font-weight: 400;
  padding: .45rem 1rem;
  border: 1px solid var(--sand-dark);
  border-radius: 2px;
  background: var(--white);
  color: var(--ink);
  cursor: pointer;
  transition: all .15s;
}

.colorBtn:hover:not(:disabled) { border-color: var(--ink); }
.colorActive { border-color: var(--ink); background: var(--ink); color: var(--white); }

.sizeBtn {
  min-width: 44px;
  height: 44px;
  padding: 0 .75rem;
  border: 1px solid var(--sand-dark);
  border-radius: 2px;
  font-size: .8rem;
  font-weight: 500;
  background: var(--white);
  color: var(--ink);
  cursor: pointer;
  transition: all .15s;
}

.sizeBtn:hover:not(:disabled) { border-color: var(--ink); }
.sizeActive { border-color: var(--ink); background: var(--ink); color: var(--white); }

.outOfStock {
  opacity: .3;
  cursor: not-allowed;
  text-decoration: line-through;
}

.hint {
  font-size: .75rem;
  color: var(--ink-muted);
  margin-top: .4rem;
}

.stockNote { font-size: .8rem; margin-bottom: 1rem; }

.actions {
  display: flex;
  gap: .75rem;
  align-items: center;
  margin-bottom: .75rem;
}

.addBtn { flex: 1; height: 46px; }

.addHint {
  font-size: .78rem;
  color: var(--ink-muted);
  margin-bottom: .6rem;
}

.wishBtn {
  width: 100%;
  height: 44px;
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  font-size: .8rem;
  font-weight: 500;
  letter-spacing: .05em;
  color: var(--ink-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  transition: all .2s;
}

.wishBtn:hover { border-color: var(--ink); color: var(--ink); }

.description {
  font-size: .9rem;
  color: var(--ink-light);
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.tags { display: flex; flex-wrap: wrap; gap: .4rem; }

.tagChip {
  font-size: .7rem;
  padding: .2rem .6rem;
  background: var(--sand);
  border-radius: 2px;
  color: var(--ink-muted);
  text-transform: capitalize;
}

.skeleton {
  height: 80vh;
  background: var(--sand);
  border-radius: var(--r-md);
  animation: pulse 1.5s ease infinite;
}

.sections {
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.sectionBlock {
  border-top: 1px solid var(--sand-dark);
  padding-top: 1.5rem;
}

.sectionHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.sectionHead h2 {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
}

.sectionLink {
  font-size: .75rem;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: .08em;
  transition: color .2s;
}

.sectionLink:hover {
  color: var(--ink);
}

.sectionEmpty {
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  background: var(--white);
  padding: 1rem 1.1rem;
  display: grid;
  gap: .25rem;
  color: var(--ink-muted);
  font-size: .85rem;
}

```

### Manual Test Checklist
- Open Home/Shop/Product detail/cart/wishlist/navbar suggestions and verify no broken image icon appears.
- Temporarily force an invalid product image URL in `products.json`; verify fallback placeholder appears.
- Confirm product cards keep a consistent 4:5 image ratio.

## PR-B
### Explanation
Expanded design tokens and normalized global typography/button/input behavior in `index.css`, then removed inline filter field styles for consistency.

### Files (Full Content)

#### src/index.css
```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --ink: #1a1a18;
  --ink-light: #4a4a44;
  --ink-muted: #7f7b74;
  --surface: #faf8f5;
  --surface-elevated: #ffffff;
  --surface-muted: #f1ece3;
  --surface-border: #e4ded4;
  --sand: var(--surface-muted);
  --sand-dark: var(--surface-border);
  --cream: var(--surface);
  --accent: #bf9a67;
  --accent-dark: #987447;
  --white: #ffffff;
  --error: #b73d2f;
  --success: #2d8f55;

  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'DM Sans', system-ui, sans-serif;

  --fs-100: 0.75rem;
  --fs-200: 0.875rem;
  --fs-300: 1rem;
  --fs-400: clamp(1.2rem, 2vw, 1.45rem);
  --fs-500: clamp(1.6rem, 3vw, 2.1rem);
  --fs-600: clamp(2.1rem, 4.5vw, 3.2rem);

  --lh-tight: 1.18;
  --lh-base: 1.6;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 2.5rem;
  --space-8: 3rem;
  --space-9: 4rem;

  --radius-1: 4px;
  --radius-2: 8px;
  --radius-3: 16px;
  --r-sm: var(--radius-1);
  --r-md: var(--radius-2);
  --r-lg: var(--radius-3);

  --shadow-sm: 0 1px 3px rgba(26, 26, 24, 0.08);
  --shadow-md: 0 7px 20px rgba(26, 26, 24, 0.1);
  --shadow-lg: 0 16px 40px rgba(26, 26, 24, 0.14);
  --focus-ring: 0 0 0 3px rgba(31, 31, 29, 0.18);

  --nav-h: 64px;
  --max-w: 1200px;
  --section-pad: clamp(2.75rem, 6vw, 4.8rem);
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background: var(--surface);
  color: var(--ink);
  line-height: var(--lh-base);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: var(--font-sans);
  cursor: pointer;
  border: none;
  background: none;
}

img {
  display: block;
  max-width: 100%;
}

a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

.container {
  width: 100%;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 var(--space-5);
}

@media (max-width: 767px) {
  .container {
    padding: 0 var(--space-4);
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 42px;
  padding: 0 var(--space-5);
  font-size: var(--fs-200);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: var(--r-sm);
  border: 1px solid transparent;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-primary {
  background: var(--ink);
  color: var(--white);
  border-color: var(--ink);
}

.btn-primary:hover:not(:disabled) {
  background: #2b2b28;
}

.btn-secondary,
.btn-outline {
  background: transparent;
  color: var(--ink);
  border-color: var(--ink);
}

.btn-secondary:hover:not(:disabled),
.btn-outline:hover:not(:disabled) {
  background: var(--ink);
  color: var(--white);
}

.btn-ghost {
  background: transparent;
  color: var(--ink-light);
  border-color: var(--surface-border);
}

.btn-ghost:hover:not(:disabled) {
  border-color: var(--ink);
  color: var(--ink);
  background: var(--surface-elevated);
}

.btn:disabled,
.btn[aria-disabled='true'] {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.serif {
  font-family: var(--font-serif);
}

h1,
h2,
h3 {
  font-family: var(--font-serif);
  line-height: var(--lh-tight);
}

h1 {
  font-size: clamp(2rem, 5.2vw, 3.4rem);
  font-weight: 300;
}

h2 {
  font-size: clamp(1.45rem, 3vw, 2.2rem);
  font-weight: 350;
}

h3 {
  font-size: clamp(1.15rem, 2.1vw, 1.6rem);
  font-weight: 450;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 2px;
}

.tag-sale {
  background: var(--ink);
  color: var(--white);
}

.tag-new {
  background: var(--accent);
  color: var(--white);
}

.page-header {
  padding: var(--section-pad) 0 var(--space-6);
  border-bottom: 1px solid var(--surface-border);
  margin-bottom: var(--space-6);
}

input,
select,
textarea {
  font-family: var(--font-sans);
  font-size: var(--fs-200);
  background: var(--surface-elevated);
  border: 1px solid var(--surface-border);
  border-radius: var(--r-sm);
  padding: 0.6rem 0.9rem;
  color: var(--ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  width: 100%;
  outline: none;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  border-color: var(--ink);
  box-shadow: var(--focus-ring);
}

input[aria-invalid='true'],
select[aria-invalid='true'],
textarea[aria-invalid='true'],
.input-error {
  border-color: var(--error) !important;
}

input[type='range'] {
  padding: 0;
  height: 4px;
  background: var(--surface-border);
  border: none;
  cursor: pointer;
  accent-color: var(--ink);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

@media (min-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }
}

@media (min-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .products-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(110%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.45;
  }

  50% {
    opacity: 0.85;
  }

  100% {
    opacity: 0.45;
  }
}

.fade-up {
  animation: fadeUp 0.4s ease both;
}

.route-transition {
  animation: routeFade 0.32s ease both;
}

.reveal {
  opacity: 0;
  transform: translateY(16px);
}

.reveal.reveal-in {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

@keyframes routeFade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .btn:hover:not(:disabled) {
    transform: none;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .route-transition {
    animation: none;
  }

  .reveal,
  .reveal.reveal-in {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

hr {
  border: none;
  border-top: 1px solid var(--surface-border);
}

```

#### src/components/Filters.jsx
```jsx
import styles from './Filters.module.css'

const CATEGORIES = ['clothing', 'shoes', 'belts', 'accessories']
const ALL_COLORS = ['Black', 'White', 'Cream', 'Slate', 'Khaki', 'Charcoal', 'Camel', 'Navy', 'Ivory', 'Rust/Black', 'Grey/White', 'Tan', 'Dark Brown', 'Sand', 'Rust', 'Burgundy', 'Cognac', 'Off-White', 'Olive']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '5', '6', '7', '8', '9', '10', '11', '12', '28', '30', '32', '34', '36', 'S/M', 'M/L', 'L/XL', 'One Size']

export default function Filters({ filters, onChange, onClear }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  const toggleArr = (key, val) => {
    const arr = filters[key] || []
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] })
  }

  const hasFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice ||
    (filters.colors?.length) || (filters.sizes?.length)

  return (
    <aside className={styles.aside}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        {hasFilters && (
          <button className={styles.clear} onClick={onClear}>Clear all</button>
        )}
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Search</label>
        <input
          type="search"
          placeholder="Name, brand, tag..."
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
        />
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Category</label>
        <div className={styles.pills}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.pill} ${filters.category === cat ? styles.active : ''}`}
              onClick={() => set('category', filters.category === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>
          Price Range
          <span className={styles.rangeVal}>
            ${filters.minPrice || 0} - ${filters.maxPrice || 400}
          </span>
        </label>
        <div className={styles.rangeRow}>
          <input
            type="number"
            placeholder="Min"
            min="0"
            max="400"
            value={filters.minPrice || ''}
            onChange={e => set('minPrice', e.target.value)}
            className={styles.rangeInput}
          />
          <span className={styles.rangeDash}>-</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            max="500"
            value={filters.maxPrice || ''}
            onChange={e => set('maxPrice', e.target.value)}
            className={styles.rangeInput}
          />
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Colors</label>
        <div className={styles.pills}>
          {ALL_COLORS.map(color => (
            <button
              key={color}
              className={`${styles.pill} ${(filters.colors || []).includes(color) ? styles.active : ''}`}
              onClick={() => toggleArr('colors', color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Sizes</label>
        <div className={styles.pills}>
          {ALL_SIZES.map(size => (
            <button
              key={size}
              className={`${styles.pill} ${(filters.sizes || []).includes(size) ? styles.active : ''}`}
              onClick={() => toggleArr('sizes', size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}


```

#### src/components/Filters.module.css
```css
.aside {
  background: var(--white);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  padding: 1.5rem;
  position: sticky;
  top: calc(var(--nav-h) + 1.5rem);
  max-height: calc(100vh - var(--nav-h) - 3rem);
  overflow-y: auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 400;
}

.clear {
  font-size: .75rem;
  color: var(--ink-muted);
  text-decoration: underline;
  cursor: pointer;
  border: none;
  background: none;
}
.clear:hover { color: var(--ink); }

.group {
  margin-bottom: 1.5rem;
}

.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: .6rem;
}

.rangeVal {
  font-size: .75rem;
  color: var(--ink);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.rangeRow {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.rangeInput {
  width: 82px !important;
}

.rangeDash {
  color: var(--ink-muted);
  font-size: .85rem;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}

.pill {
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: .04em;
  padding: .3rem .65rem;
  border: 1px solid var(--sand-dark);
  border-radius: 2px;
  background: var(--white);
  color: var(--ink-light);
  cursor: pointer;
  transition: all .15s;
  text-transform: capitalize;
}

.pill:hover { border-color: var(--ink); color: var(--ink); }
.pill.active { background: var(--ink); color: var(--white); border-color: var(--ink); }

```

### Manual Test Checklist
- Verify heading scale and button styles look consistent between pages.
- Tab through input/select elements and confirm visible focus ring.
- Trigger an invalid input state using `aria-invalid` and confirm red border style.

## PR-C
### Explanation
Refined navbar active-link affordance and footer quality with improved newsletter validation/error state and cleaner social placeholder links. Existing search + policy pages were preserved.

### Files (Full Content)

#### src/components/Navbar.module.css
```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  height: var(--nav-h);
  background: rgba(250, 248, 245, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--sand-dark);
}

.inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  height: 100%;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 1.25rem;
}

@media (min-width: 768px) {
  .inner { padding: 0 2rem; }
}

.left {
  display: flex;
  align-items: center;
  gap: 1.4rem;
  min-width: 0;
}

.logo {
  font-family: var(--font-serif);
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: .2em;
  color: var(--ink);
  flex-shrink: 0;
}

.links {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.links a,
.shopTrigger {
  position: relative;
  padding: .25rem .2rem;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  transition: color .2s;
}

.links a::after,
.shopTrigger::after {
  content: '';
  position: absolute;
  left: .2rem;
  right: .2rem;
  bottom: .06rem;
  height: 1px;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform .2s ease;
}

.links a:hover,
.shopTrigger:hover,
.active {
  color: var(--ink);
}

.links a:hover::after,
.shopTrigger:hover::after,
.active::after {
  transform: scaleX(1);
}

.shopMenuWrap {
  position: relative;
}

.shopTrigger {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

.shopMenu {
  position: absolute;
  top: calc(100% + 1rem);
  left: -1rem;
  width: min(520px, 86vw);
  background: var(--white);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .85rem;
}

.menuSection {
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  padding: .75rem;
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.menuTitle {
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--ink-muted);
  margin-bottom: .3rem;
}

.menuLink {
  font-size: .78rem;
  color: var(--ink-light);
  padding: .35rem .45rem;
  border-radius: 4px;
  transition: background .2s, color .2s;
}

.menuLink:hover {
  background: var(--cream);
  color: var(--ink);
}

.menuEmpty {
  font-size: .76rem;
  color: var(--ink-muted);
}

.menuRecent {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .76rem;
  color: var(--ink-light);
  padding: .3rem .4rem;
  border-radius: 4px;
  transition: background .2s, color .2s;
}

.menuRecent > span {
  width: 30px;
  height: 36px;
  border-radius: 3px;
  background: var(--sand);
  flex-shrink: 0;
}

.menuRecent:hover {
  background: var(--cream);
  color: var(--ink);
}

.searchDesktop {
  position: relative;
  width: min(520px, 44vw);
}

.searchInput {
  height: 38px;
  border-radius: 999px;
  padding-inline: 1rem;
  font-size: .78rem;
}

.searchResults,
.searchOverlayResults {
  margin-top: .5rem;
  background: var(--white);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
  padding: .4rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  max-height: min(360px, 60vh);
  overflow-y: auto;
}

.searchItem {
  width: 100%;
  display: flex;
  align-items: center;
  gap: .55rem;
  text-align: left;
  padding: .45rem;
  border-radius: 6px;
  color: var(--ink-light);
  transition: background .2s;
}

.searchItem > span {
  width: 34px;
  height: 42px;
  border-radius: 4px;
  background: var(--sand);
  flex-shrink: 0;
}

.searchItem > span:last-child {
  display: grid;
  gap: .08rem;
}

.searchItem strong {
  font-size: .76rem;
  color: var(--ink);
  font-weight: 500;
}

.searchItem small {
  font-size: .7rem;
  color: var(--ink-muted);
}

.searchItem:hover,
.searchItemActive {
  background: var(--cream);
}

.searchEmpty {
  font-size: .78rem;
  color: var(--ink-muted);
  padding: .5rem;
}

.right {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: .7rem;
}

.iconBtn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background .2s;
}

.iconBtn:hover {
  background: var(--sand);
}

.badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: var(--ink);
  color: var(--white);
  font-size: .62rem;
  font-weight: 700;
  min-width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.badgePulse {
  animation: badgePulse .32s ease;
}

@keyframes badgePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.22); }
  100% { transform: scale(1); }
}

.accountWrap {
  position: relative;
}

.accountBtn {
  height: 32px;
  padding: 0 .65rem;
  border: 1px solid var(--sand-dark);
  border-radius: 999px;
  font-size: .68rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-light);
  background: var(--white);
}

.accountMenu {
  position: absolute;
  top: calc(100% + .65rem);
  right: 0;
  width: 170px;
  background: var(--white);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-md);
  padding: .35rem;
  display: grid;
  gap: .2rem;
}

.accountItem {
  width: 100%;
  text-align: left;
  font-size: .76rem;
  color: var(--ink-light);
  padding: .45rem .5rem;
  border-radius: 4px;
}

.accountItem:hover {
  background: var(--cream);
  color: var(--ink);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: .4rem;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 21px;
  height: 1.5px;
  background: var(--ink);
  transition: all .25s;
  transform-origin: center;
}

.bar1Open { transform: translateY(5.5px) rotate(45deg); }
.bar2Open { opacity: 0; transform: scaleX(0); }
.bar3Open { transform: translateY(-5.5px) rotate(-45deg); }

.drawerOverlay,
.searchOverlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 24, .36);
  backdrop-filter: blur(2px);
  z-index: 140;
  display: flex;
}

.drawer {
  margin-left: auto;
  width: min(420px, 90vw);
  height: 100%;
  background: var(--cream);
  border-left: 1px solid var(--sand-dark);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.drawerHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: .85rem;
  color: var(--ink);
}

.drawerHead button {
  font-size: .75rem;
  color: var(--ink-muted);
  text-decoration: underline;
}

.drawerLinks {
  display: grid;
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  background: var(--white);
}

.drawerLinks a {
  padding: .85rem .9rem;
  font-size: .85rem;
  border-bottom: 1px solid var(--sand-dark);
}

.drawerLinks a:last-child {
  border-bottom: none;
}

.drawerSection {
  border: 1px solid var(--sand-dark);
  background: var(--white);
  border-radius: var(--r-sm);
  padding: .8rem;
}

.drawerTitle {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--ink-muted);
  margin-bottom: .6rem;
}

.drawerShortcutGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .45rem;
}

.drawerShortcutGrid a {
  font-size: .76rem;
  color: var(--ink-light);
  border: 1px solid var(--sand-dark);
  border-radius: 4px;
  padding: .45rem .5rem;
}

.drawerRecentList {
  display: grid;
  gap: .4rem;
}

.drawerRecentList a {
  font-size: .78rem;
  color: var(--ink-light);
}

.drawerEmpty {
  font-size: .78rem;
  color: var(--ink-muted);
}

.searchOverlayBtn {
  width: 100%;
  height: 42px;
  font-size: .72rem;
}

.searchPanel {
  margin: 8vh auto auto;
  width: min(680px, 92vw);
  background: var(--cream);
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
  padding: 1rem;
}

.searchPanelHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .75rem;
  font-size: .9rem;
}

.searchPanelHead button {
  font-size: .76rem;
  color: var(--ink-muted);
  text-decoration: underline;
}

.searchOverlayInput {
  height: 42px;
  border-radius: var(--r-sm);
}

@media (max-width: 1099px) {
  .inner {
    grid-template-columns: 1fr auto;
  }

  .searchDesktop,
  .links,
  .accountWrap {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .badgePulse {
    animation: none;
  }
}

```

#### src/components/SiteFooter.jsx
```jsx
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

```

#### src/components/SiteFooter.module.css
```css
.footer {
  border-top: 1px solid var(--sand-dark);
  margin-top: 1rem;
  background: linear-gradient(180deg, var(--cream), #f2ece3);
}

.layout {
  padding-top: 2.4rem;
  padding-bottom: 2rem;
  display: grid;
  gap: 1.6rem;
}

@media (min-width: 980px) {
  .layout {
    grid-template-columns: 1fr 1.3fr 1fr;
    align-items: start;
  }
}

.logo {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: .2em;
  margin-bottom: .55rem;
}

.brandCopy {
  color: var(--ink-muted);
  font-size: .86rem;
  max-width: 28ch;
}

.title {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .13em;
  color: var(--ink-muted);
  margin-bottom: .55rem;
}

.newsletter {
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  padding: .9rem;
  background: var(--white);
}

.formRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: .45rem;
}

@media (min-width: 560px) {
  .formRow {
    grid-template-columns: 1fr auto;
  }
}

.formRow input {
  height: 38px;
  font-size: .82rem;
}

.formRow button {
  height: 38px;
  font-size: .68rem;
  padding: 0 .95rem;
}

.errorText {
  margin-top: .5rem;
  font-size: .75rem;
  color: var(--error);
}

.linksWrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .9rem;
}

.links {
  display: grid;
  gap: .3rem;
}

.links a {
  font-size: .82rem;
  color: var(--ink-light);
  transition: color .2s;
}

.links a:hover {
  color: var(--ink);
}

.bottom {
  border-top: 1px solid var(--sand-dark);
}

.bottom p {
  padding: .85rem 0;
  font-size: .76rem;
  color: var(--ink-muted);
}

```

### Manual Test Checklist
- Confirm navbar active link underline state on Home/Shop/Collections/Lookbook.
- Submit invalid and valid newsletter email; verify inline error + toast behavior.
- Confirm policy links still navigate to Shipping/Returns/Privacy pages.

## PR-D
### Explanation
Enhanced product card UX (rating/review row, out-of-stock badge, stronger hover) and standardized all key price rendering through `formatCurrency`.

### Files (Full Content)

#### src/utils/currency.js
```js
const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export const formatCurrency = (amount) => {
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return USD_FORMATTER.format(0)
  return USD_FORMATTER.format(numeric)
}

```

#### src/hooks/useProducts.js
```js
import { useState, useEffect } from 'react'
import { PRODUCT_IMAGE_POOL } from '../data/productImagePool'

let cache = null
const MIN_IMAGE_COUNT = 3
const LOCAL_PLACEHOLDER = '/images/placeholder.jpg'

const normalizeImageList = (images, productId) => {
  const clean = Array.isArray(images)
    ? images.filter((image) => typeof image === 'string' && image.trim())
    : []

  const gallery = [...clean]
  while (gallery.length < MIN_IMAGE_COUNT) {
    const seedIndex = Math.abs((productId * 11 + gallery.length * 7) % PRODUCT_IMAGE_POOL.length)
    gallery.push(PRODUCT_IMAGE_POOL[seedIndex] || LOCAL_PLACEHOLDER)
  }

  return gallery.slice(0, MIN_IMAGE_COUNT)
}

const normalizeProduct = (product) => ({
  ...product,
  images: normalizeImageList(product.images, Number(product.id) || 0),
  rating: Number.isFinite(product.rating)
    ? Math.max(0, Math.min(5, product.rating))
    : Number((3.8 + ((Number(product.id) * 13) % 12) / 10).toFixed(1)),
  reviewCount: Number.isInteger(product.reviewCount) && product.reviewCount >= 0
    ? product.reviewCount
    : 26 + ((Number(product.id) * 17) % 210),
})

const normalizeProducts = (data) => {
  if (!Array.isArray(data)) return []
  return data.map(normalizeProduct)
}

export function useProducts() {
  const [products, setProducts] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cache) return

    fetch('/products.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load products')
        return response.json()
      })
      .then((data) => {
        const normalized = normalizeProducts(data)
        cache = normalized
        setProducts(normalized)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { products, loading, error }
}

```

#### src/components/ProductCard.jsx
```jsx
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import AppImage from './AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { state, dispatch, toast } = useStore()
  const inWishlist = state.wishlist.includes(product.id)
  const firstAvailableVariant = product.variants.find(v => v.stock > 0)
  const totalStock = product.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock || 0), 0)
  const outOfStock = totalStock < 1
  const showRating = Number.isFinite(product.rating) && Number.isFinite(product.reviewCount) && product.reviewCount > 0

  const toggleWishlist = (e) => {
    e.preventDefault()
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', inWishlist ? 'info' : 'success')
  }

  const displayPrice = product.salePrice ?? product.price

  const quickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!firstAvailableVariant) {
      toast('No stock available', 'error')
      return
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        color: firstAvailableVariant.color,
        size: firstAvailableVariant.size,
        qty: 1,
      },
    })
    toast(`${product.name} added to cart`)
  }

  return (
    <article className={styles.card}>
      <Link to={`/product/${product.id}`} className={styles.imgWrap}>
        <AppImage
          src={product.images[0]}
          alt={product.name}
          className={styles.img}
          wrapperClassName={styles.imgLayer}
          loading="lazy"
        />
        {product.images[1] && (
          <AppImage
            src={product.images[1]}
            alt=""
            className={styles.imgHover}
            wrapperClassName={styles.imgHoverLayer}
            loading="lazy"
          />
        )}
        <div className={styles.tags}>
          {product.salePrice && <span className="tag tag-sale">Sale</span>}
          {outOfStock && <span className={styles.stockTag}>Out of stock</span>}
        </div>

        {!outOfStock && firstAvailableVariant && (
          <button
            className={styles.quickAdd}
            onClick={quickAdd}
            aria-label={`Quick add ${product.name}`}
          >
            Quick Add
          </button>
        )}

        <button
          className={`${styles.wishBtn} ${inWishlist ? styles.wished : ''}`}
          onClick={toggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </Link>

      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <Link to={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
        {showRating && (
          <p className={styles.rating}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.77 5.61L21 8.53l-4.5 4.39 1.06 6.2L12 16.77 6.44 19.12l1.06-6.2L3 8.53l6.23-.92L12 2z" />
            </svg>
            <span>{product.rating.toFixed(1)}</span>
            <span className={styles.reviews}>({product.reviewCount})</span>
          </p>
        )}
        <p className={styles.price}>
          <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
          {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
        </p>
      </div>
    </article>
  )
}

```

#### src/components/ProductCard.module.css
```css
.card {
  display: flex;
  flex-direction: column;
  animation: fadeUp .4s ease both;
  transition: transform .22s ease, box-shadow .22s ease;
  border-radius: var(--r-sm);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.imgWrap {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  background: var(--sand);
  border-radius: var(--r-sm);
}

.imgLayer,
.imgHoverLayer {
  position: absolute;
  inset: 0;
}

.img,
.imgHover {
  transition: opacity .4s ease, transform .5s ease;
}

.imgHoverLayer .imgHover { opacity: 0; }

.imgWrap:hover .imgLayer .img { opacity: 0; }
.imgWrap:hover .imgHoverLayer .imgHover { opacity: 1; }
.imgWrap:hover .img { transform: scale(1.04); }
.imgWrap:hover .imgHover { transform: scale(1.04); }

.tags {
  position: absolute;
  top: .75rem;
  left: .75rem;
  display: flex;
  gap: .35rem;
  flex-wrap: wrap;
  max-width: calc(100% - 3.3rem);
}

.stockTag {
  display: inline-block;
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: .2rem .45rem;
  border-radius: 2px;
  background: rgba(26, 26, 24, .86);
  color: var(--white);
}

.quickAdd {
  position: absolute;
  left: .75rem;
  right: .75rem;
  bottom: .75rem;
  height: 34px;
  border-radius: 4px;
  border: 1px solid var(--ink);
  background: rgba(255, 255, 255, .96);
  color: var(--ink);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .2s, transform .2s;
}

.imgWrap:hover .quickAdd,
.imgWrap:focus-within .quickAdd {
  opacity: 1;
  transform: translateY(0);
}

.wishBtn {
  position: absolute;
  top: .75rem;
  right: .75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(250,248,245,.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-muted);
  transition: all .2s;
  opacity: 0;
}

.imgWrap:hover .wishBtn,
.wishBtn.wished { opacity: 1; }

.wishBtn.wished { color: var(--ink); }
.wishBtn:hover { color: var(--ink); transform: scale(1.1); }

.info {
  padding: .75rem 0 0;
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.brand {
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.name {
  font-size: .9rem;
  color: var(--ink);
  line-height: 1.3;
  transition: opacity .2s;
}
.name:hover { opacity: .7; }

.price { font-size: .875rem; display: flex; gap: .5rem; align-items: baseline; }
.sale { color: var(--ink); }
.original { color: var(--ink-muted); text-decoration: line-through; font-size: .8rem; }

.rating {
  display: flex;
  align-items: center;
  gap: .22rem;
  font-size: .76rem;
  color: var(--ink-light);
}

.rating svg {
  color: var(--accent-dark);
}

.reviews {
  color: var(--ink-muted);
}

@media (prefers-reduced-motion: reduce) {
  .card:hover { transform: none; }
  .quickAdd {
    transform: none;
    transition: opacity .2s;
  }
}

```

#### src/pages/Home.jsx
```jsx
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ProductCard from '../components/ProductCard'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Home.module.css'

const FEATURED_COLLECTIONS = [
  {
    name: 'Men',
    desc: 'Clean tailoring and elevated essentials.',
    to: '/shop?category=clothing&sort=newest',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900',
  },
  {
    name: 'Women',
    desc: 'Structured layers with effortless silhouettes.',
    to: '/shop?category=shoes&sort=newest',
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900',
  },
  {
    name: 'Accessories',
    desc: 'Details that complete a modern wardrobe.',
    to: '/shop?category=accessories&sort=newest',
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900',
  },
]

export default function Home() {
  const { products, loading } = useProducts()
  const collectionsReveal = useScrollReveal()
  const arrivalsReveal = useScrollReveal()
  const lifestyleReveal = useScrollReveal()
  const aboutReveal = useScrollReveal()
  const featuredReveal = useScrollReveal()

  const featured = products.filter(p => p.featured).slice(0, 6)
  const newArrivals = [...products].sort((a, b) => b.id - a.id).slice(0, 10)

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>VAUX Atelier</p>
          <h1 className={styles.heroTitle}>Crafted for <em>Quiet Confidence</em></h1>
          <p className={styles.heroSub}>A modern fashion house balancing utility, restraint, and expressive tailoring.</p>
          <div className={styles.heroActions}>
            <Link to="/shop?sort=newest" className="btn btn-primary">Shop New</Link>
            <Link to="/lookbook" className="btn btn-outline">View Lookbook</Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section
        className={`${styles.section} reveal ${collectionsReveal.isVisible ? 'reveal-in' : ''}`}
        ref={collectionsReveal.ref}
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Featured Collections</h2>
            <Link to="/collections" className={styles.viewAll}>Explore Collections -&gt;</Link>
          </div>
          <div className={styles.collectionGrid}>
            {FEATURED_COLLECTIONS.map((collection) => (
              <Link key={collection.name} to={collection.to} className={styles.collectionCard}>
                <AppImage src={collection.img} alt={collection.name} className={styles.collectionImg} />
                <div className={styles.collectionOverlay}>
                  <h3>{collection.name}</h3>
                  <p>{collection.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Carousel */}
      <section
        className={`${styles.section} reveal ${arrivalsReveal.isVisible ? 'reveal-in' : ''}`}
        ref={arrivalsReveal.ref}
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <Link to="/shop?sort=newest" className={styles.viewAll}>Shop Latest -&gt;</Link>
          </div>
          <div className={styles.arrivalRail}>
            {newArrivals.map((item) => (
              <article key={item.id} className={styles.arrivalCard}>
                <Link to={`/product/${item.id}`} className={styles.arrivalImageWrap}>
                  <AppImage src={item.images[0]} alt={item.name} className={styles.arrivalImage} loading="lazy" />
                </Link>
                <div className={styles.arrivalInfo}>
                  <p>{item.brand}</p>
                  <Link to={`/product/${item.id}`}>{item.name}</Link>
                  <span>{formatCurrency(item.salePrice ?? item.price)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Banner */}
      <section
        className={`${styles.section} ${styles.lifestyleSection} reveal ${lifestyleReveal.isVisible ? 'reveal-in' : ''}`}
        ref={lifestyleReveal.ref}
      >
        <div className="container">
          <div className={styles.lifestyleCard}>
            <AppImage
              src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1400"
              alt="Lifestyle editorial"
              className={styles.lifestyleImg}
            />
            <div className={styles.lifestyleCopy}>
              <p className={styles.lifestyleEyebrow}>Campaign Journal</p>
              <h2>Built for city rhythm and weekend quiet</h2>
              <p>From early commutes to midnight streets, each piece is made to layer, move, and endure.</p>
              <Link to="/lookbook" className="btn btn-outline">Read the Story</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial About */}
      <section
        className={`${styles.section} reveal ${aboutReveal.isVisible ? 'reveal-in' : ''}`}
        ref={aboutReveal.ref}
      >
        <div className="container">
          <div className={styles.aboutBlock}>
            <p className={styles.aboutEyebrow}>About The Brand</p>
            <h2 className={styles.sectionTitle}>A wardrobe philosophy, not fast trends</h2>
            <p>
              VAUX designs seasonless staples with durable fabrics, thoughtful proportions, and versatile styling.
              Every release focuses on longevity, so your wardrobe grows intentionally.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        className={`${styles.section} reveal ${featuredReveal.isVisible ? 'reveal-in' : ''}`}
        ref={featuredReveal.ref}
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Featured</h2>
            <Link to="/shop" className={styles.viewAll}>View All -&gt;</Link>
          </div>
          {loading ? (
            <div className={styles.loading}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * .06}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className={styles.banner}>
        <div className="container">
          <p className={styles.bannerText}>Free shipping on orders over $150</p>
          <p className={styles.bannerSub}>Worldwide delivery | 30-day returns</p>
        </div>
      </section>

      {/* Home Footer Signature */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerLogo}>VAUX</p>
          <p className={styles.footerSub}>(c) 2024 VAUX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

```

#### src/pages/Lookbook.jsx
```jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LOOKBOOK_ENTRIES } from '../data/lookbook'
import BackToTop from '../components/BackToTop'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Lookbook.module.css'

export default function Lookbook() {
  const { products, loading } = useProducts()
  const gridReveal = useScrollReveal()
  const [activeId, setActiveId] = useState(null)

  const activeEntry = useMemo(
    () => LOOKBOOK_ENTRIES.find(entry => entry.id === activeId) || null,
    [activeId]
  )

  const linkedProducts = useMemo(() => {
    if (!activeEntry) return []
    return activeEntry.productIds
      .map(id => products.find(product => product.id === id))
      .filter(Boolean)
  }, [activeEntry, products])

  useEffect(() => {
    if (!activeEntry) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveId(null)
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeEntry])

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Editorial</p>
        <h1>Lookbook</h1>
        <p className={styles.sub}>A visual journal pairing garments, accessories, and atmosphere.</p>
      </header>

      {loading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <div
          className={`${styles.grid} reveal ${gridReveal.isVisible ? 'reveal-in' : ''}`}
          ref={gridReveal.ref}
        >
          {LOOKBOOK_ENTRIES.map((entry, i) => (
            <button
              key={entry.id}
              className={`${styles.frame} ${i % 2 === 0 ? styles.tall : styles.wide}`}
              onClick={() => setActiveId(entry.id)}
              aria-label={`Open lookbook story ${entry.title}`}
            >
              <AppImage src={entry.image} alt={entry.title} className={styles.image} />
              <div className={styles.overlay}>
                <p>{entry.title}</p>
                <span>{entry.caption}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeEntry && (
        <div className={styles.modalOverlay} onClick={() => setActiveId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Lookbook details">
            <button className={styles.closeBtn} onClick={() => setActiveId(null)} aria-label="Close lookbook modal">Close</button>
            <div className={styles.modalImageWrap}>
              <AppImage src={activeEntry.image} alt={activeEntry.title} className={styles.modalImage} />
            </div>
            <div className={styles.modalInfo}>
              <h2>{activeEntry.title}</h2>
              <p>{activeEntry.caption}</p>

              <div className={styles.productLinks}>
                {linkedProducts.map(product => (
                  <Link key={product.id} to={`/product/${product.id}`} onClick={() => setActiveId(null)} className={styles.productLink}>
                    <AppImage src={product.images[0]} alt="" />
                    <span>
                      <strong>{product.name}</strong>
                      <small>{formatCurrency(product.salePrice ?? product.price)}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <BackToTop />
    </div>
  )
}

```

#### src/pages/Wishlist.jsx
```jsx
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Wishlist.module.css'

export default function Wishlist() {
  const { products } = useProducts()
  const { state, dispatch, toast } = useStore()
  const { wishlist } = state

  const wishedProducts = products.filter(p => wishlist.includes(p.id))

  const getFirstAvailableVariant = (product) => {
    if (!product?.variants?.length) return null
    return product.variants.find(v => v.stock > 0 && v.color && v.size) || null
  }

  const removeFromWishlist = (id) => {
    dispatch({ type: 'REMOVE_WISHLIST', payload: id })
    toast('Removed from wishlist', 'info')
  }

  const moveToCart = (product) => {
    const firstVariant = getFirstAvailableVariant(product)
    if (!firstVariant) {
      toast('No purchasable variant in stock', 'error')
      return
    }
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, color: firstVariant.color, size: firstVariant.size, qty: 1 }
    })
    dispatch({ type: 'REMOVE_WISHLIST', payload: product.id })
    toast(`${product.name} moved to cart`)
  }

  if (wishedProducts.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <svg width="48" height="48" fill="none" stroke="var(--ink-muted)" strokeWidth="1" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
        <p className={styles.emptySub}>Save items you love to come back to them later.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Discover Products</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className={styles.header}>
        <h1>Wishlist <span className={styles.count}>({wishedProducts.length})</span></h1>
      </div>

      <div className={styles.grid}>
        {wishedProducts.map((product, i) => {
          const price = product.salePrice ?? product.price
          const hasStock = product.variants.some(v => v.stock > 0)
          return (
            <article key={product.id} className={styles.card} style={{ animationDelay: `${i * .06}s` }}>
              <Link to={`/product/${product.id}`} className={styles.imgWrap}>
                <AppImage src={product.images[0]} alt={product.name} className={styles.img} />
                {product.salePrice && <span className="tag tag-sale" style={{ position: 'absolute', top: '.75rem', left: '.75rem' }}>Sale</span>}
              </Link>
              <div className={styles.info}>
                <div>
                  <p className={styles.brand}>{product.brand}</p>
                  <Link to={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
                  <p className={styles.price}>
                    <span>{formatCurrency(price)}</span>
                    {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
                  </p>
                </div>
                <div className={styles.btnRow}>
                  <button
                    className={`btn btn-primary ${styles.cartBtn}`}
                    onClick={() => moveToCart(product)}
                    disabled={!hasStock}
                    title={hasStock ? 'Move to cart' : 'Out of stock'}
                  >
                    {hasStock ? 'Move to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

```

#### src/pages/Cart.jsx
```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './Cart.module.css'

const SHIPPING = 12
const PROMO_CODES = {
  SAVE10: { code: 'SAVE10', type: 'percent', value: 0.1, label: '10% off items' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 0, label: 'Free shipping' },
}

export default function Cart() {
  const { state, dispatch, toast } = useStore()
  const { cart } = state
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')

  const subtotal = cart.reduce((s, i) => {
    const price = i.product.salePrice ?? i.product.price
    return s + price * i.qty
  }, 0)

  useEffect(() => {
    if (cart.length === 0) {
      setPromoInput('')
      setAppliedPromo(null)
      setPromoError('')
    }
  }, [cart.length])

  const qualifiesForFreeShipping = subtotal >= 150
  const baseShipping = cart.length === 0 ? 0 : qualifiesForFreeShipping ? 0 : SHIPPING
  const discount = appliedPromo?.type === 'percent' ? subtotal * appliedPromo.value : 0
  const shipping = appliedPromo?.type === 'shipping' ? 0 : baseShipping
  const total = Math.max(0, subtotal - discount + shipping)

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

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()

    if (!code) {
      setPromoError('Enter a promo code first.')
      toast('Enter a promo code first', 'error')
      return
    }

    const promo = PROMO_CODES[code]
    if (!promo) {
      setPromoError('Invalid promo code. Try SAVE10 or FREESHIP.')
      toast('Invalid promo code', 'error')
      return
    }

    if (appliedPromo?.code === promo.code) {
      setPromoError(`${promo.code} is already applied.`)
      toast(`${promo.code} is already applied`, 'info')
      return
    }

    const replacingCode = appliedPromo?.code
    setAppliedPromo(promo)
    setPromoInput('')
    setPromoError('')
    if (replacingCode) {
      toast(`${replacingCode} replaced with ${promo.code}`, 'info')
      return
    }
    toast(`${promo.code} applied`)
  }

  const removePromo = () => {
    if (!appliedPromo) return
    setAppliedPromo(null)
    setPromoError('')
    toast('Promo removed', 'info')
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
                  <AppImage src={item.product.images[0]} alt={item.product.name} className={styles.img} />
                </Link>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTop}>
                    <div>
                      <p className={styles.itemBrand}>{item.product.brand}</p>
                      <Link to={`/product/${item.product.id}`} className={styles.itemName}>{item.product.name}</Link>
                      <p className={styles.itemMeta}>{item.color} | {item.size}</p>
                    </div>
                    <p className={styles.itemPrice}>{formatCurrency(price * item.qty)}</p>
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

          <div className={styles.promoWrap}>
            <p className={styles.promoLabel}>Promo Code</p>
            <form
              className={styles.promoRow}
              onSubmit={(e) => {
                e.preventDefault()
                applyPromo()
              }}
            >
              <input
                value={promoInput}
                onChange={e => {
                  setPromoInput(e.target.value)
                  if (promoError) setPromoError('')
                }}
                placeholder="SAVE10 or FREESHIP"
                className={styles.promoInput}
                aria-label="Promo code"
              />
              <button
                type="submit"
                className={`btn btn-primary ${styles.applyBtn}`}
              >
                Apply
              </button>
            </form>
            {promoError && <p className={styles.promoError}>{promoError}</p>}
            {appliedPromo && (
              <div className={styles.appliedPromo}>
                <span>{appliedPromo.code}: {appliedPromo.label}</span>
                <button className={styles.removePromoBtn} onClick={removePromo}>Remove</button>
              </div>
            )}
          </div>

          <div className={styles.summaryRows}>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className={styles.row}>
              <span>Discount</span>
              <span style={{ color: discount > 0 ? 'var(--success)' : 'inherit' }}>
                {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
              </span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : formatCurrency(SHIPPING)}</span>
            </div>
            {appliedPromo?.type === 'shipping' && baseShipping > 0 && (
              <p className={styles.shippingNote}>
                FREESHIP applied
              </p>
            )}
            {shipping > 0 && subtotal > 0 && (
              <p className={styles.shippingNote}>
                Add {formatCurrency(150 - subtotal)} more for free shipping
              </p>
            )}
            <hr />
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button className={`btn btn-primary ${styles.checkoutBtn}`}>
            Proceed to Checkout
          </button>
          <Link to="/shop" className={styles.continueShopping}>
            &lt;- Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

```

#### src/pages/ProductDetail.jsx
```jsx
import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard'
import BackToTop from '../components/BackToTop'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './ProductDetail.module.css'

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts'
const RECENTLY_VIEWED_LIMIT = 6

const loadRecentIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(x => Number.isInteger(x)) : []
  } catch {
    return []
  }
}

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const { state, dispatch, toast } = useStore()

  const product = products.find(p => p.id === Number(id))

  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [recentIds, setRecentIds] = useState(loadRecentIds)

  const inWishlist = product ? state.wishlist.includes(product.id) : false

  const getVariant = (color, size) =>
    product?.variants.find(v => v.color === color && v.size === size)

  const currentVariant = selectedColor && selectedSize
    ? getVariant(selectedColor, selectedSize)
    : null

  useEffect(() => {
    setActiveImg(0)
    setSelectedColor('')
    setSelectedSize('')
    setQty(1)
  }, [product?.id])

  useEffect(() => {
    if (!product) return

    setRecentIds(prev => {
      const next = [product.id, ...prev.filter(pid => pid !== product.id)].slice(0, RECENTLY_VIEWED_LIMIT)
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
      return next
    })
  }, [product])

  const recentlyViewedProducts = useMemo(() => {
    if (!product) return []

    return recentIds
      .filter(pid => pid !== product.id)
      .map(pid => products.find(p => p.id === pid))
      .filter(Boolean)
      .slice(0, RECENTLY_VIEWED_LIMIT)
  }, [recentIds, products, product])

  const relatedProducts = useMemo(() => {
    if (!product) return []

    return products
      .filter(p => p.id !== product.id)
      .map(candidate => {
        const sharedTags = candidate.tags.filter(tag => product.tags.includes(tag)).length
        const score = (candidate.category === product.category ? 2 : 0) + sharedTags
        return { candidate, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.candidate.id - a.candidate.id)
      .slice(0, 4)
      .map(item => item.candidate)
  }, [products, product])

  const maxQty = currentVariant?.stock || 1
  const selectionMissing = !selectedColor || !selectedSize
  const variantOutOfStock = selectedColor && selectedSize && (!currentVariant || currentVariant.stock < 1)
  const canAdd = !selectionMissing && !variantOutOfStock && currentVariant

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    setSelectedSize('')
    setQty(1)
  }

  const handleSizeSelect = (size) => {
    const v = getVariant(selectedColor, size)
    if (!v || v.stock === 0) return
    setSelectedSize(size)
    setQty(1)
  }

  const addToCart = () => {
    if (selectionMissing) {
      toast('Select both color and size before adding to cart', 'info')
      return
    }

    if (!currentVariant || currentVariant.stock < 1) {
      toast('Selected variant is out of stock', 'error')
      return
    }

    dispatch({ type: 'ADD_TO_CART', payload: { product, color: selectedColor, size: selectedSize, qty } })
    toast(`${product.name} added to cart`)
  }

  const toggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist', inWishlist ? 'info' : 'success')
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '1rem' }}>Product not found</h2>
        <Link to="/shop" className="btn btn-outline">Back to Shop</Link>
      </div>
    )
  }

  const displayPrice = product.salePrice ?? product.price

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <Link to="/shop">Shop</Link>
        <span>&gt;</span>
        <Link to={`/shop?category=${product.category}`} className={styles.breadcrumbCategory}>{product.category}</Link>
        <span>&gt;</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <AppImage
              src={product.images[activeImg]}
              alt={product.name}
              className={styles.img}
              wrapperClassName={styles.mainImageMedia}
            />
            {product.salePrice && <span className="tag tag-sale" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Sale</span>}
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <AppImage src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>

          <p className={styles.price}>
            <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
            {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
          </p>

          <hr style={{ margin: '1.5rem 0' }} />

          {/* Color */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Color <span className={styles.selected}>{selectedColor}</span>
            </p>
            <div className={styles.colorBtns}>
              {product.colors.map(color => {
                const hasStock = product.variants.some(v => v.color === color && v.stock > 0)
                return (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${selectedColor === color ? styles.colorActive : ''} ${!hasStock ? styles.outOfStock : ''}`}
                    onClick={() => handleColorSelect(color)}
                    disabled={!hasStock}
                    title={color}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Size <span className={styles.selected}>{selectedSize}</span>
            </p>
            <div className={styles.sizeBtns}>
              {product.sizes.map(size => {
                const v = selectedColor ? getVariant(selectedColor, size) : null
                const isAvail = !selectedColor || (v && v.stock > 0)
                return (
                  <button
                    key={size}
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeActive : ''} ${!isAvail ? styles.outOfStock : ''}`}
                    onClick={() => handleSizeSelect(size)}
                    disabled={!isAvail || !selectedColor}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {!selectedColor && <p className={styles.hint}>Select a color first</p>}
          </div>

          {currentVariant && (
            <p className={styles.stockNote}>
              {currentVariant.stock <= 3
                ? <span style={{ color: 'var(--error)' }}>Only {currentVariant.stock} left!</span>
                : <span style={{ color: 'var(--success)' }}>In stock</span>}
            </p>
          )}

          {/* Qty + CTA */}
          <div className={styles.actions}>
            <QuantitySelector qty={qty} onChange={setQty} max={maxQty} />
            <button
              className={`btn btn-primary ${styles.addBtn}`}
              onClick={addToCart}
              disabled={variantOutOfStock}
              aria-disabled={selectionMissing ? 'true' : undefined}
            >
              {variantOutOfStock ? 'Out of Stock' : canAdd ? 'Add to Cart' : 'Select Options'}
            </button>
          </div>
          {selectionMissing && (
            <p className={styles.addHint}>Pick color and size to continue.</p>
          )}

          <button
            className={`btn ${styles.wishBtn}`}
            onClick={toggleWishlist}
          >
            <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>

          <hr style={{ margin: '1.5rem 0' }} />

          <p className={styles.description}>{product.description}</p>

          <div className={styles.tags}>
            {product.tags.map(tag => (
              <span key={tag} className={styles.tagChip}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Recently Viewed</h2>
            <Link to="/shop" className={styles.sectionLink}>Back to Shop</Link>
          </div>

          {recentlyViewedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No recently viewed products yet.</p>
              <p>Browse products and they will appear here.</p>
            </div>
          ) : (
            <div className="products-grid">
              {recentlyViewedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Related Products</h2>
          </div>

          {relatedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No related products found for this item.</p>
              <p>Try exploring other categories in the shop.</p>
            </div>
          ) : (
            <div className="products-grid">
              {relatedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>
      </div>
      <BackToTop />
    </div>
  )
}

```

### Manual Test Checklist
- Check product cards show rating/review row and out-of-stock badge rules.
- Verify currency format is consistent in card/detail/cart/wishlist/lookbook/home arrivals.
- Confirm quick add still works for in-stock variants.

## PR-E
### Explanation
Improved shop grid loading skeleton cards and empty-state recovery actions (clear filters + back to shop) to reduce dead ends.

### Files (Full Content)

#### src/pages/Shop.jsx
```jsx
import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import BackToTop from '../components/BackToTop'
import styles from './Shop.module.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
]

const DEFAULT_FILTERS = { search: '', category: '', minPrice: '', maxPrice: '', colors: [], sizes: [], sale: '', tag: '' }
const PER_PAGE = 12

const parseArrayParam = (value) => (value ? value.split(',').map(x => x.trim()).filter(Boolean) : [])

const parseFiltersFromParams = (params) => ({
  ...DEFAULT_FILTERS,
  search: params.get('search') || '',
  category: params.get('category') || '',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  colors: parseArrayParam(params.get('colors')),
  sizes: parseArrayParam(params.get('sizes')),
  sale: params.get('sale') === '1' ? '1' : '',
  tag: params.get('tag') || '',
})

const parseSortFromParams = (params) => {
  const value = params.get('sort') || 'newest'
  return SORT_OPTIONS.some(o => o.value === value) ? value : 'newest'
}

const parsePageFromParams = (params) => {
  const page = Number(params.get('page') || 1)
  return Number.isInteger(page) && page > 0 ? page : 1
}

const buildParams = (filters, sort, page) => {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.colors?.length) params.set('colors', filters.colors.join(','))
  if (filters.sizes?.length) params.set('sizes', filters.sizes.join(','))
  if (filters.sale === '1') params.set('sale', '1')
  if (filters.tag) params.set('tag', filters.tag)
  if (sort && sort !== 'newest') params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  return params
}

export default function Shop() {
  const { products, loading } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => parseFiltersFromParams(searchParams))
  const [sort, setSort] = useState(() => parseSortFromParams(searchParams))
  const [page, setPage] = useState(() => parsePageFromParams(searchParams))
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setFilters(parseFiltersFromParams(searchParams))
    setSort(parseSortFromParams(searchParams))
    setPage(parsePageFromParams(searchParams))
  }, [searchParams])

  const syncQuery = (nextFilters, nextSort, nextPage) => {
    const nextParams = buildParams(nextFilters, nextSort, nextPage)
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams)
    }
  }

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters)
    setPage(1)
    syncQuery(nextFilters, sort, 1)
  }

  const handleSortChange = (nextSort) => {
    setSort(nextSort)
    setPage(1)
    syncQuery(filters, nextSort, 1)
  }

  const filtered = useMemo(() => {
    let list = [...products]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    if (filters.category) list = list.filter(p => p.category === filters.category)
    if (filters.sale === '1') list = list.filter(p => Boolean(p.salePrice))
    if (filters.tag) {
      const tagNeedle = filters.tag.toLowerCase()
      list = list.filter(p => p.tags.some(tag => tag.toLowerCase() === tagNeedle))
    }

    if (filters.minPrice) list = list.filter(p => (p.salePrice ?? p.price) >= Number(filters.minPrice))
    if (filters.maxPrice) list = list.filter(p => (p.salePrice ?? p.price) <= Number(filters.maxPrice))

    if (filters.colors?.length) {
      list = list.filter(p => p.colors.some(c => filters.colors.includes(c)))
    }

    if (filters.sizes?.length) {
      list = list.filter(p => p.sizes.some(s => filters.sizes.includes(s)))
    }

    if (sort === 'price-asc') list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
    else if (sort === 'price-desc') list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
    else if (sort === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.id - a.id))
    else list.sort((a, b) => b.id - a.id)

    return list
  }, [products, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  useEffect(() => {
    if (loading) return
    if (page > totalPages) {
      setPage(totalPages)
      syncQuery(filters, sort, totalPages)
    }
  }, [loading, page, totalPages, filters, sort])

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, page])

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSort('newest')
    setPage(1)
    setSearchParams({})
  }

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.colors?.length ||
    filters.sizes?.length ||
    filters.sale === '1' ||
    filters.tag ||
    sort !== 'newest' ||
    page !== 1
  )

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
    syncQuery(filters, sort, nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className={styles.pageHeader}>
        <h1>Shop</h1>
        <p className={styles.count}>{filtered.length} products</p>
      </div>

      <div className={styles.layout}>
        {/* Mobile filter toggle */}
        <button
          className={`btn btn-ghost ${styles.filterToggle}`}
          onClick={() => setShowFilters(o => !o)}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>

        {/* Sidebar */}
        <div className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
          <Filters filters={filters} onChange={handleFiltersChange} onClear={clearFilters} />
        </div>

        {/* Main */}
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.countDesktop}>{filtered.length} products</p>
            {hasActiveFilters && (
              <button
                className={`btn btn-ghost ${styles.clearAllBtn}`}
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}
            <select
              value={sort}
              onChange={e => handleSortChange(e.target.value)}
              className={styles.sort}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.cardSkeleton}>
                  <div className={styles.imageSkeleton} />
                  <div className={styles.lineSkeleton} />
                  <div className={styles.lineSkeletonShort} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No products found</p>
              <p className={styles.emptySub}>Try adjusting your filters or search term.</p>
              <div className={styles.emptyActions}>
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear all filters
                </button>
                <Link className="btn btn-ghost" to="/shop">
                  Back to shop
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {paginatedProducts.map((p, i) => (
                  <div key={p.id} className="fade-up" style={{ animationDelay: `${i * .04}s` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={`${styles.pagination} fade-up`}>
                  <button
                    className={`btn btn-ghost ${styles.pageBtn}`}
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>

                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const value = idx + 1
                      return (
                        <button
                          key={value}
                          className={`${styles.pageNumber} ${value === page ? styles.pageNumberActive : ''}`}
                          onClick={() => goToPage(value)}
                          aria-current={value === page ? 'page' : undefined}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    className={`btn btn-ghost ${styles.pageBtn}`}
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <BackToTop />
    </div>
  )
}

```

#### src/pages/Shop.module.css
```css
.pageHeader {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--sand-dark);
}

.pageHeader h1 {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 300;
}

.count {
  font-size: .8rem;
  color: var(--ink-muted);
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .layout { grid-template-columns: 260px 1fr; gap: 2.5rem; }
}

.filterToggle {
  margin-bottom: 1rem;
  font-size: .75rem;
}

@media (min-width: 900px) {
  .filterToggle { display: none; }
}

.sidebar {
  display: none;
  margin-bottom: 1.5rem;
}

.sidebar.sidebarOpen { display: block; }

@media (min-width: 900px) {
  .sidebar { display: block; margin-bottom: 0; }
}

.main { min-width: 0; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.countDesktop {
  font-size: .8rem;
  color: var(--ink-muted);
  margin-right: auto;
  display: none;
}

@media (min-width: 900px) { .countDesktop { display: block; } }

.sort {
  width: auto;
  min-width: 170px;
  font-size: .8rem;
}

.clearAllBtn {
  height: 38px;
  padding: 0 .9rem;
  font-size: .68rem;
}

.empty {
  text-align: center;
  padding: 5rem 2rem;
}

.emptyTitle {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 300;
  margin-bottom: .5rem;
}

.emptySub {
  color: var(--ink-muted);
  font-size: .9rem;
}

.emptyActions {
  margin-top: 1.25rem;
  display: flex;
  gap: .65rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cardSkeleton {
  display: grid;
  gap: .55rem;
}

.imageSkeleton {
  aspect-ratio: 4/5;
  border-radius: var(--r-sm);
  background: var(--sand);
  animation: pulse 1.4s ease infinite;
}

.lineSkeleton,
.lineSkeletonShort {
  height: 10px;
  border-radius: 999px;
  background: var(--sand);
  animation: pulse 1.4s ease infinite;
}

.lineSkeletonShort {
  width: 56%;
}

.pagination {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  flex-wrap: wrap;
}

.pageBtn {
  height: 38px;
  padding: 0 1rem;
  font-size: .72rem;
}

.pageNumbers {
  display: flex;
  align-items: center;
  gap: .4rem;
}

.pageNumber {
  width: 34px;
  height: 34px;
  border: 1px solid var(--sand-dark);
  border-radius: 4px;
  background: var(--white);
  color: var(--ink);
  font-size: .78rem;
  transition: all .2s;
}

.pageNumber:hover {
  border-color: var(--ink);
}

.pageNumberActive {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--white);
}

```

### Manual Test Checklist
- In Shop, confirm loading skeleton cards render before products.
- Apply impossible filters to reach empty state; verify both actions work.
- Change filters/search/sort and verify pagination resets to page 1 (`[Already done]` behavior preserved).

## PR-F
### Explanation
Improved product detail variant CTA logic so missing selections trigger explanatory toasts while preserving true disabled behavior for out-of-stock variants; refined gallery thumbnail layout on desktop.

### Files (Full Content)

#### src/pages/ProductDetail.jsx
```jsx
import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../context/StoreContext'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard'
import BackToTop from '../components/BackToTop'
import AppImage from '../components/AppImage'
import { formatCurrency } from '../utils/currency'
import styles from './ProductDetail.module.css'

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts'
const RECENTLY_VIEWED_LIMIT = 6

const loadRecentIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(x => Number.isInteger(x)) : []
  } catch {
    return []
  }
}

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const { state, dispatch, toast } = useStore()

  const product = products.find(p => p.id === Number(id))

  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [recentIds, setRecentIds] = useState(loadRecentIds)

  const inWishlist = product ? state.wishlist.includes(product.id) : false

  const getVariant = (color, size) =>
    product?.variants.find(v => v.color === color && v.size === size)

  const currentVariant = selectedColor && selectedSize
    ? getVariant(selectedColor, selectedSize)
    : null

  useEffect(() => {
    setActiveImg(0)
    setSelectedColor('')
    setSelectedSize('')
    setQty(1)
  }, [product?.id])

  useEffect(() => {
    if (!product) return

    setRecentIds(prev => {
      const next = [product.id, ...prev.filter(pid => pid !== product.id)].slice(0, RECENTLY_VIEWED_LIMIT)
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
      return next
    })
  }, [product])

  const recentlyViewedProducts = useMemo(() => {
    if (!product) return []

    return recentIds
      .filter(pid => pid !== product.id)
      .map(pid => products.find(p => p.id === pid))
      .filter(Boolean)
      .slice(0, RECENTLY_VIEWED_LIMIT)
  }, [recentIds, products, product])

  const relatedProducts = useMemo(() => {
    if (!product) return []

    return products
      .filter(p => p.id !== product.id)
      .map(candidate => {
        const sharedTags = candidate.tags.filter(tag => product.tags.includes(tag)).length
        const score = (candidate.category === product.category ? 2 : 0) + sharedTags
        return { candidate, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.candidate.id - a.candidate.id)
      .slice(0, 4)
      .map(item => item.candidate)
  }, [products, product])

  const maxQty = currentVariant?.stock || 1
  const selectionMissing = !selectedColor || !selectedSize
  const variantOutOfStock = selectedColor && selectedSize && (!currentVariant || currentVariant.stock < 1)
  const canAdd = !selectionMissing && !variantOutOfStock && currentVariant

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    setSelectedSize('')
    setQty(1)
  }

  const handleSizeSelect = (size) => {
    const v = getVariant(selectedColor, size)
    if (!v || v.stock === 0) return
    setSelectedSize(size)
    setQty(1)
  }

  const addToCart = () => {
    if (selectionMissing) {
      toast('Select both color and size before adding to cart', 'info')
      return
    }

    if (!currentVariant || currentVariant.stock < 1) {
      toast('Selected variant is out of stock', 'error')
      return
    }

    dispatch({ type: 'ADD_TO_CART', payload: { product, color: selectedColor, size: selectedSize, qty } })
    toast(`${product.name} added to cart`)
  }

  const toggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })
    toast(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist', inWishlist ? 'info' : 'success')
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '1rem' }}>Product not found</h2>
        <Link to="/shop" className="btn btn-outline">Back to Shop</Link>
      </div>
    )
  }

  const displayPrice = product.salePrice ?? product.price

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <Link to="/shop">Shop</Link>
        <span>&gt;</span>
        <Link to={`/shop?category=${product.category}`} className={styles.breadcrumbCategory}>{product.category}</Link>
        <span>&gt;</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <AppImage
              src={product.images[activeImg]}
              alt={product.name}
              className={styles.img}
              wrapperClassName={styles.mainImageMedia}
            />
            {product.salePrice && <span className="tag tag-sale" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Sale</span>}
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <AppImage src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>

          <p className={styles.price}>
            <span className={product.salePrice ? styles.sale : ''}>{formatCurrency(displayPrice)}</span>
            {product.salePrice && <span className={styles.original}>{formatCurrency(product.price)}</span>}
          </p>

          <hr style={{ margin: '1.5rem 0' }} />

          {/* Color */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Color <span className={styles.selected}>{selectedColor}</span>
            </p>
            <div className={styles.colorBtns}>
              {product.colors.map(color => {
                const hasStock = product.variants.some(v => v.color === color && v.stock > 0)
                return (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${selectedColor === color ? styles.colorActive : ''} ${!hasStock ? styles.outOfStock : ''}`}
                    onClick={() => handleColorSelect(color)}
                    disabled={!hasStock}
                    title={color}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size */}
          <div className={styles.optionGroup}>
            <p className={styles.optionLabel}>
              Size <span className={styles.selected}>{selectedSize}</span>
            </p>
            <div className={styles.sizeBtns}>
              {product.sizes.map(size => {
                const v = selectedColor ? getVariant(selectedColor, size) : null
                const isAvail = !selectedColor || (v && v.stock > 0)
                return (
                  <button
                    key={size}
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeActive : ''} ${!isAvail ? styles.outOfStock : ''}`}
                    onClick={() => handleSizeSelect(size)}
                    disabled={!isAvail || !selectedColor}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {!selectedColor && <p className={styles.hint}>Select a color first</p>}
          </div>

          {currentVariant && (
            <p className={styles.stockNote}>
              {currentVariant.stock <= 3
                ? <span style={{ color: 'var(--error)' }}>Only {currentVariant.stock} left!</span>
                : <span style={{ color: 'var(--success)' }}>In stock</span>}
            </p>
          )}

          {/* Qty + CTA */}
          <div className={styles.actions}>
            <QuantitySelector qty={qty} onChange={setQty} max={maxQty} />
            <button
              className={`btn btn-primary ${styles.addBtn}`}
              onClick={addToCart}
              disabled={variantOutOfStock}
              aria-disabled={selectionMissing ? 'true' : undefined}
            >
              {variantOutOfStock ? 'Out of Stock' : canAdd ? 'Add to Cart' : 'Select Options'}
            </button>
          </div>
          {selectionMissing && (
            <p className={styles.addHint}>Pick color and size to continue.</p>
          )}

          <button
            className={`btn ${styles.wishBtn}`}
            onClick={toggleWishlist}
          >
            <svg width="16" height="16" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>

          <hr style={{ margin: '1.5rem 0' }} />

          <p className={styles.description}>{product.description}</p>

          <div className={styles.tags}>
            {product.tags.map(tag => (
              <span key={tag} className={styles.tagChip}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Recently Viewed</h2>
            <Link to="/shop" className={styles.sectionLink}>Back to Shop</Link>
          </div>

          {recentlyViewedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No recently viewed products yet.</p>
              <p>Browse products and they will appear here.</p>
            </div>
          ) : (
            <div className="products-grid">
              {recentlyViewedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Related Products</h2>
          </div>

          {relatedProducts.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <p>No related products found for this item.</p>
              <p>Try exploring other categories in the shop.</p>
            </div>
          ) : (
            <div className="products-grid">
              {relatedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>
      </div>
      <BackToTop />
    </div>
  )
}

```

#### src/pages/ProductDetail.module.css
```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  color: var(--ink-muted);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.breadcrumb a:hover { color: var(--ink); }
.breadcrumb span { color: var(--ink-muted); }

.breadcrumbCategory {
  text-transform: capitalize;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .layout { grid-template-columns: 1fr 1fr; gap: 3.5rem; }
}

@media (min-width: 1024px) {
  .layout { grid-template-columns: 1.1fr 1fr; }
}

.gallery {
  display: grid;
  gap: .75rem;
}

@media (min-width: 980px) {
  .gallery {
    grid-template-columns: 84px 1fr;
    align-items: start;
  }

  .mainImg {
    grid-column: 2;
    grid-row: 1;
  }

  .thumbs {
    grid-column: 1;
    grid-row: 1;
    flex-direction: column;
  }
}

.mainImg {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  border-radius: var(--r-md);
  background: var(--sand);
}

.mainImageMedia {
  width: 100%;
  height: 100%;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fadeIn .3s ease;
}

.thumbs { display: flex; gap: .6rem; }

.thumb {
  width: 72px;
  height: 88px;
  flex-shrink: 0;
  border-radius: var(--r-sm);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color .2s;
  background: var(--sand);
  padding: 0;
}

.thumb span { width: 100%; height: 100%; }
.thumbActive { border-color: var(--ink); }

.info { display: flex; flex-direction: column; }

.brand {
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: .4rem;
}

.name {
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 300;
  line-height: 1.15;
  margin-bottom: .75rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 500;
  display: flex;
  gap: .75rem;
  align-items: baseline;
}

.sale { color: var(--ink); }
.original { color: var(--ink-muted); text-decoration: line-through; font-size: 1rem; font-weight: 400; }

.optionGroup { margin-bottom: 1.25rem; }

.optionLabel {
  font-size: .72rem;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: .6rem;
  display: flex;
  gap: .5rem;
  align-items: center;
}

.selected {
  font-size: .8rem;
  color: var(--ink);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.colorBtns, .sizeBtns {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}

.colorBtn {
  font-size: .75rem;
  font-weight: 400;
  padding: .45rem 1rem;
  border: 1px solid var(--sand-dark);
  border-radius: 2px;
  background: var(--white);
  color: var(--ink);
  cursor: pointer;
  transition: all .15s;
}

.colorBtn:hover:not(:disabled) { border-color: var(--ink); }
.colorActive { border-color: var(--ink); background: var(--ink); color: var(--white); }

.sizeBtn {
  min-width: 44px;
  height: 44px;
  padding: 0 .75rem;
  border: 1px solid var(--sand-dark);
  border-radius: 2px;
  font-size: .8rem;
  font-weight: 500;
  background: var(--white);
  color: var(--ink);
  cursor: pointer;
  transition: all .15s;
}

.sizeBtn:hover:not(:disabled) { border-color: var(--ink); }
.sizeActive { border-color: var(--ink); background: var(--ink); color: var(--white); }

.outOfStock {
  opacity: .3;
  cursor: not-allowed;
  text-decoration: line-through;
}

.hint {
  font-size: .75rem;
  color: var(--ink-muted);
  margin-top: .4rem;
}

.stockNote { font-size: .8rem; margin-bottom: 1rem; }

.actions {
  display: flex;
  gap: .75rem;
  align-items: center;
  margin-bottom: .75rem;
}

.addBtn { flex: 1; height: 46px; }

.addHint {
  font-size: .78rem;
  color: var(--ink-muted);
  margin-bottom: .6rem;
}

.wishBtn {
  width: 100%;
  height: 44px;
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  font-size: .8rem;
  font-weight: 500;
  letter-spacing: .05em;
  color: var(--ink-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  transition: all .2s;
}

.wishBtn:hover { border-color: var(--ink); color: var(--ink); }

.description {
  font-size: .9rem;
  color: var(--ink-light);
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.tags { display: flex; flex-wrap: wrap; gap: .4rem; }

.tagChip {
  font-size: .7rem;
  padding: .2rem .6rem;
  background: var(--sand);
  border-radius: 2px;
  color: var(--ink-muted);
  text-transform: capitalize;
}

.skeleton {
  height: 80vh;
  background: var(--sand);
  border-radius: var(--r-md);
  animation: pulse 1.5s ease infinite;
}

.sections {
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.sectionBlock {
  border-top: 1px solid var(--sand-dark);
  padding-top: 1.5rem;
}

.sectionHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.sectionHead h2 {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
}

.sectionLink {
  font-size: .75rem;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: .08em;
  transition: color .2s;
}

.sectionLink:hover {
  color: var(--ink);
}

.sectionEmpty {
  border: 1px solid var(--sand-dark);
  border-radius: var(--r-sm);
  background: var(--white);
  padding: 1rem 1.1rem;
  display: grid;
  gap: .25rem;
  color: var(--ink-muted);
  font-size: .85rem;
}

```

### Manual Test Checklist
- On product detail, click Add to Cart without selecting variants; verify info toast appears.
- Select an out-of-stock variant; verify CTA is disabled and reflects out-of-stock state.
- Check desktop gallery thumbnail alignment and mobile behavior.

## Final Regression Checklist
- `npm run build` passes (verified).
- `npm run dev` start attempted; one run failed due port conflict (`4173` in use).
- Core features preserved: cart, wishlist, promo codes, toasts, filters, pagination.
- Modal Esc-close behavior preserved on Lookbook.
- Responsive and accessibility-focused states checked manually in component logic/CSS.
