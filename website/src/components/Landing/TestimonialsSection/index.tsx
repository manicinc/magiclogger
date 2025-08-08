// File: website/src/components/Landing/TestimonialsSection/index.tsx

import React from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// PLACEHOLDER TESTIMONIALS - Replace with real testimonials when available
// To hide this section, just comment out <TestimonialsSection /> in index.tsx
const testimonials = [
  {
    id: 1,
    quote: "MagicLogger transformed how we handle debugging in production. What used to take hours now takes minutes.",
    author: "Senior Developer",
    role: "Tech Startup",
    company: "Example Corp",
    avatar: "👨‍💻"
  },
  {
    id: 2,
    quote: "The performance is incredible. We're handling millions of logs per day without breaking a sweat.",
    author: "DevOps Lead",
    role: "SaaS Platform",
    company: "Sample Inc",
    avatar: "👩‍💻"
  },
  {
    id: 3,
    quote: "Finally, a logging library that's both powerful and doesn't bloat our bundle size. Perfect for our React apps.",
    author: "Frontend Architect",
    role: "E-commerce",
    company: "Demo LLC",
    avatar: "👨‍💼"
  }
];

// Set to false to hide testimonials section entirely
const SHOW_TESTIMONIALS = true;

export default function TestimonialsSection() {
  // Easy toggle to hide section
  if (!SHOW_TESTIMONIALS) {
    return null;
  }

  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Loved by developers worldwide
          </Heading>
          <p className={styles.sectionSubtitle}>
            See what teams are saying about MagicLogger
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <blockquote className={styles.testimonialQuote}>
                "{testimonial.quote}"
              </blockquote>
              <div className={styles.testimonialAuthor}>
                <span className={styles.authorAvatar}>{testimonial.avatar}</span>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonial.author}</div>
                  <div className={styles.authorRole}>
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional: Add logos of companies using MagicLogger */}
        {/* <div className={styles.companyLogos}>
          <p className={styles.companiesTitle}>Trusted by teams at</p>
          <div className={styles.logoGrid}>
            // Add company logos here when available
          </div>
        </div> */}
      </div>
    </section>
  );
}