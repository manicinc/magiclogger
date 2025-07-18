import React, { useState } from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    console.log('Waitlist signup:', email);
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className={styles.waitlistSection}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2" className={styles.sectionTitle}>
            🚀 Join the Waitlist
          </Heading>
          <p className={styles.sectionSubtitle}>
            Be the first to access the MagicLogger Dashboard when it launches
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className={styles.waitlistForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.emailInput}
                />
                <button type="submit" className={styles.submitButton}>
                  Join Waitlist 🎯
                </button>
              </div>
              <p className={styles.privacyNote}>
                We'll only email you about the dashboard launch. No spam, ever.
              </p>
            </form>
          ) : (
            <div className={styles.successMessage}>
              <h3>🎉 You're on the list!</h3>
              <p>We'll notify you as soon as the dashboard is ready.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}