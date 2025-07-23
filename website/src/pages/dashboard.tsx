// File: website/src/pages/dashboard.tsx

import React, { type JSX } from 'react';
import Layout from '@theme/Layout';
import DashboardHero from '@site/src/components/DashboardHero';
import styles from './dashboard.module.css';

/**
 * MagicLogger Dashboard Marketing Page
 * Full page showcasing the dashboard features and benefits
 */

export default function Dashboard(): JSX.Element {
  const features = [
    {
      icon: '🔍',
      title: 'Powerful Search',
      description: 'Search millions of logs in milliseconds with our advanced query engine',
      image: '/img/dashboard/search.png'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Visualize trends, patterns, and anomalies as they happen',
      image: '/img/dashboard/analytics.png'
    },
    {
      icon: '🤖',
      title: 'AI Insights',
      description: 'Let AI detect anomalies and suggest optimizations automatically',
      image: '/img/dashboard/ai.png'
    },
    {
      icon: '⚡',
      title: 'Smart Alerts',
      description: 'Get notified about critical issues before they impact users',
      image: '/img/dashboard/alerts.png'
    },
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Share dashboards, annotate logs, and debug together',
      image: '/img/dashboard/collaboration.png'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'SOC2 compliant with encryption, SSO, and audit logs',
      image: '/img/dashboard/security.png'
    }
  ];

  const testimonials = [
    {
      quote: "MagicLogger Dashboard transformed how we handle production debugging. What used to take hours now takes minutes.",
      author: "Sarah Chen",
      role: "CTO at TechCorp",
      avatar: "👩‍💻"
    },
    {
      quote: "The AI insights caught a memory leak we didn't even know existed. It paid for itself in the first week.",
      author: "Mike Rodriguez",
      role: "DevOps Lead at CloudScale",
      avatar: "👨‍💻"
    },
    {
      quote: "Finally, a logging dashboard that developers actually want to use. The UX is incredible.",
      author: "Emily Watson",
      role: "Engineering Manager at StartupXYZ",
      avatar: "👩‍💼"
    }
  ];

  const integrations = [
    { name: 'Slack', icon: '💬' },
    { name: 'PagerDuty', icon: '📟' },
    { name: 'Jira', icon: '🎯' },
    { name: 'GitHub', icon: '🐙' },
    { name: 'Datadog', icon: '📈' },
    { name: 'Webhooks', icon: '🔗' }
  ];

  return (
    <Layout
      title="Dashboard - MagicLogger"
      description="Centralized log management and analytics dashboard for MagicLogger">
      
      <DashboardHero />
      
      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Everything you need to understand your logs
            </h2>
            <p className={styles.sectionSubtitle}>
              Powerful features designed for modern development teams
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, idx) => (
              <div key={idx} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className={styles.integrationSection}>
        <div className="container">
          <div className={styles.integrationContent}>
            <div className={styles.integrationText}>
              <h2 className={styles.integrationTitle}>
                Integrates with your existing tools
              </h2>
              <p className={styles.integrationDescription}>
                Connect MagicLogger Dashboard to your favorite development tools 
                and get alerts where your team already works.
              </p>
              <div className={styles.integrationLogos}>
                {integrations.map((integration, idx) => (
                  <div key={idx} className={styles.integrationItem}>
                    <span className={styles.integrationIcon}>{integration.icon}</span>
                    <span className={styles.integrationName}>{integration.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.integrationVisual}>
              <div className={styles.connectionDiagram}>
                <div className={styles.centralHub}>
                  <span>🎯</span>
                  <span>MagicLogger</span>
                </div>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={styles.connectionLine}
                    style={{ transform: `rotate(${i * 60}deg)` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className="container">
          <h2 className={styles.testimonialsTitle}>
            Loved by developers worldwide
          </h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className={styles.testimonialCard}>
                <blockquote className={styles.testimonialQuote}>
                  "{testimonial.quote}"
                </blockquote>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.authorAvatar}>{testimonial.avatar}</span>
                  <div>
                    <div className={styles.authorName}>{testimonial.author}</div>
                    <div className={styles.authorRole}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to level up your logging?
            </h2>
            <p className={styles.ctaSubtitle}>
              Start your free trial today. No credit card required.
            </p>
            <div className={styles.ctaActions}>
              <a 
                href="https://magiclog.io/signup"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}>
                Start Free Trial
                <span className={styles.ctaArrow}>→</span>
              </a>
              <a 
                href="https://magiclog.io/demo"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}>
                Book a Demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}