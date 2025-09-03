import React, { useEffect, useRef } from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function WaitlistSection() {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the newsletter widget script
    if (formRef.current && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://eocampaign1.com/form/9262a386-6ef3-11f0-bd78-dff98cfe1a02.js';
      script.async = true;
      script.setAttribute('data-form', '9262a386-6ef3-11f0-bd78-dff98cfe1a02');
      formRef.current.appendChild(script);

      return () => {
        // Cleanup on unmount
        if (formRef.current && formRef.current.contains(script)) {
          formRef.current.removeChild(script);
        }
      };
    }
  }, []);

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

          <div ref={formRef} className={styles.waitlistForm}>
            {/* Newsletter widget will be injected here */}
          </div>
        </div>
      </div>
    </section>
  );
}