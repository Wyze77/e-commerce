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
