import styles from './PolicyPage.module.css'

export default function Privacy() {
  return (
    <div className={`container ${styles.wrap}`}>
      <article className={styles.card}>
        <p className={styles.eyebrow}>Policy</p>
        <h1>Privacy</h1>
        <p className={styles.lead}>We respect your privacy and only use your data to fulfill orders and improve your experience.</p>

        <div className={styles.content}>
          <section>
            <h2>Information we collect</h2>
            <p>We collect order, contact, and payment details needed to process purchases and provide customer support.</p>
          </section>

          <section>
            <h2>How information is used</h2>
            <ul>
              <li>Order fulfillment and delivery notifications</li>
              <li>Customer service and return handling</li>
              <li>Optional marketing communications if subscribed</li>
            </ul>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>You may unsubscribe from marketing emails at any time and request data updates through support.</p>
          </section>
        </div>
      </article>
    </div>
  )
}
