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
