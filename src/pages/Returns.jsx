import styles from './PolicyPage.module.css'

export default function Returns() {
  return (
    <div className={`container ${styles.wrap}`}>
      <article className={styles.card}>
        <p className={styles.eyebrow}>Policy</p>
        <h1>Returns</h1>
        <p className={styles.lead}>If something is not right, you can request a return within 30 days of delivery.</p>

        <div className={styles.content}>
          <section>
            <h2>Return eligibility</h2>
            <p>Items must be unworn, unwashed, and returned in original packaging with tags attached.</p>
          </section>

          <section>
            <h2>How to start a return</h2>
            <ul>
              <li>Use your order confirmation email to begin a request</li>
              <li>Select the item and reason</li>
              <li>Print the provided return label</li>
            </ul>
          </section>

          <section>
            <h2>Refund timing</h2>
            <p>Refunds are issued to the original payment method within 5-7 business days after inspection.</p>
          </section>
        </div>
      </article>
    </div>
  )
}
