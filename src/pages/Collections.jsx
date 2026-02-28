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
