import styles from './PolicyPage.module.css'

export default function Shipping() {
  return (
    <div className={`container ${styles.wrap}`}>
      <article className={styles.card}>
        <p className={styles.eyebrow}>Policy</p>
        <h1>Shipping</h1>
        <p className={styles.lead}>We dispatch orders quickly and share tracking details once your parcel leaves our studio.</p>

        <div className={styles.content}>
          <section>
            <h2>Processing time</h2>
            <p>Orders are processed within 1-2 business days. During launches or holidays, processing may take slightly longer.</p>
          </section>

          <section>
            <h2>Delivery windows</h2>
            <ul>
              <li>Domestic: 2-5 business days</li>
              <li>International: 5-12 business days</li>
              <li>Express options are calculated at checkout</li>
            </ul>
          </section>

          <section>
            <h2>Tracking and updates</h2>
            <p>Once shipped, you receive a confirmation email with tracking and delivery updates from the carrier.</p>
          </section>
        </div>
      </article>
    </div>
  )
}
