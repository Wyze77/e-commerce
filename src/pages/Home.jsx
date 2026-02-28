import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import styles from './Home.module.css'

const CATEGORIES = [
  { name: 'Clothing', slug: 'clothing', img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500' },
  { name: 'Shoes', slug: 'shoes', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
  { name: 'Belts', slug: 'belts', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500' },
  { name: 'Accessories', slug: 'accessories', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
]

export default function Home() {
  const { products, loading } = useProducts()
  const featured = products.filter(p => p.featured).slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>New Season</p>
          <h1 className={styles.heroTitle}>Refined<br /><em>Essentials</em></h1>
          <p className={styles.heroSub}>Considered pieces for the everyday.</p>
          <Link to="/shop" className={`btn btn-primary ${styles.heroCta}`}>
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className={styles.catCard}
              >
                <img src={cat.img} alt={cat.name} className={styles.catImg} />
                <div className={styles.catOverlay}>
                  <span className={styles.catName}>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.featHeader}>
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

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerLogo}>VAUX</p>
          <p className={styles.footerSub}>(c) 2024 VAUX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

