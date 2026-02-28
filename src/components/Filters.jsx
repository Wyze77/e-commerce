import styles from './Filters.module.css'

const CATEGORIES = ['clothing', 'shoes', 'belts', 'accessories']
const ALL_COLORS = [
  'Ash', 'Black', 'Black/Black', 'Black/Cognac', 'Black/Red', 'Bone', 'Burgundy',
  'Charcoal', 'Chestnut', 'Clay', 'Cognac', 'Cream', 'Dark Brown', 'Graphite', 'Grey',
  'Ink', 'Ivory', 'Ivory/Gold', 'Khaki', 'Matte Black', 'Moss', 'Navy', 'Navy/Grey',
  'Off-White', 'Olive', 'Oxblood', 'Sand', 'Silver', 'Silver/White', 'Slate', 'Smoke',
  'Stone', 'Tan', 'Taupe', 'Tortoise', 'White',
]
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '7', '8', '9', '10', '11', '12', 'One Size']

export default function Filters({ filters, onChange, onClear, sticky = true }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  const toggleArr = (key, val) => {
    const arr = filters[key] || []
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] })
  }

  const hasFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice ||
    (filters.colors?.length) || (filters.sizes?.length) || filters.sale === '1' ||
    filters.newArrival === '1' || filters.tag

  return (
    <aside className={`${styles.aside} ${sticky ? '' : styles.asideStatic}`}>
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
        <label className={styles.label}>Quick Filters</label>
        <div className={styles.pills}>
          <button
            className={`${styles.pill} ${filters.newArrival === '1' ? styles.active : ''}`}
            onClick={() => set('newArrival', filters.newArrival === '1' ? '' : '1')}
          >
            New Arrivals
          </button>
          <button
            className={`${styles.pill} ${filters.sale === '1' ? styles.active : ''}`}
            onClick={() => set('sale', filters.sale === '1' ? '' : '1')}
          >
            On Sale
          </button>
        </div>
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

