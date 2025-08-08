// File: website/src/components/Landing/FeaturesSection/index.tsx

import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const features = [
  {
    icon: '🎨',
    title: 'Beautiful by Default',
    description: 'Turn your console into a work of art. Automatic colors, emojis, tables, and formatting that makes debugging a joy.',
    demo: `logger.rainbow('🌈 Colorful logging');
logger.table(data);
logger.progress(0.75);`,
    gradient: 'rainbow',
    highlights: ['256 Colors', 'Smart Tables', 'Progress Bars', 'Emoji Support']
  },
  {
    icon: '⚡',
    title: 'Insanely Fast',
    description: 'Faster than console.log with zero overhead. Handle millions of logs without breaking a sweat.',
    stats: ['850k ops/sec sync', '2.5M ops/sec async', 'Zero dependencies', 'Tree-shakeable'],
    gradient: 'lightning'
  },
  {
    icon: '🧠',
    title: 'Intelligent Context',
    description: 'Automatically capture and organize metadata. Track requests, trace errors, and understand your app\'s behavior.',
    features: ['Auto Request IDs', 'Error Stack Traces', 'Performance Metrics', 'User Context'],
    gradient: 'brain'
  },
  {
    icon: '🔄',
    title: '100% Compatible',
    description: 'Drop-in replacement for Winston, Bunyan, or Pino. Switch in seconds, not hours.',
    compatibility: ['Winston API', 'Bunyan Streams', 'Pino Speed', 'Console Fallback'],
    gradient: 'compatibility'
  },
  {
    icon: '🚀',
    title: 'Ship Anywhere',
    description: 'One logger, infinite destinations. Console, files, HTTP, S3, databases - we\'ve got you covered.',
    transports: ['Console', 'File', 'HTTP/S', 'S3', 'MongoDB', 'WebSocket', 'Custom'],
    gradient: 'rocket'
  },
  {
    icon: '🛡️',
    title: 'Production Ready',
    description: 'Battle-tested in production with built-in error handling, retries, and graceful degradation.',
    features: ['Error Boundaries', 'Auto Retry', 'Circuit Breaker', 'Dead Letter Queue'],
    gradient: 'shield'
  },
  {
    icon: '🌐',
    title: 'Works Everywhere',
    description: 'Node.js, browsers, workers, serverless - if it runs JavaScript, MagicLogger runs on it.',
    platforms: ['Node.js', 'Browser', 'Deno', 'Workers', 'React Native', 'Electron'],
    gradient: 'universal'
  },
  {
    icon: '📊',
    title: 'Built-in Analytics',
    description: 'Track performance, monitor errors, and visualize patterns without external tools.',
    analytics: ['Performance Tracking', 'Error Rates', 'Log Volume', 'Custom Metrics'],
    gradient: 'analytics'
  },
  {
    icon: '🔍',
    title: 'Powerful Search',
    description: 'Find any log instantly with our built-in search and filtering capabilities.',
    search: ['Full Text Search', 'Structured Queries', 'Time Ranges', 'Saved Filters'],
    gradient: 'search'
  }
];

export default function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Why developers <span className={styles.love}>love</span> MagicLogger
          </Heading>
          <p className={styles.sectionSubtitle}>
            Everything you need to debug faster, understand deeper, and ship with confidence
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }) {
  return (
    <div
      className={clsx(styles.featureCard, styles[`gradient${feature.gradient}`])}
      style={{ animationDelay: `${index * 0.1}s` }}>
      
      <div className={styles.featureHeader}>
        <span className={styles.featureIcon}>{feature.icon}</span>
        <h3 className={styles.featureTitle}>{feature.title}</h3>
      </div>
      
      <p className={styles.featureDescription}>{feature.description}</p>

      {feature.demo && (
        <div className={styles.featureDemo}>
          <code>{feature.demo}</code>
        </div>
      )}

      {feature.highlights && (
        <div className={styles.featureHighlights}>
          {feature.highlights.map((highlight, i) => (
            <span key={i} className={styles.highlight}>{highlight}</span>
          ))}
        </div>
      )}

      {feature.stats && (
        <div className={styles.featureStats}>
          {feature.stats.map((stat, i) => (
            <span key={i} className={styles.statBadge}>{stat}</span>
          ))}
        </div>
      )}

      {feature.features && (
        <div className={styles.featureList}>
          {feature.features.map((item, i) => (
            <div key={i} className={styles.featureItem}>
              <span className={styles.checkmark}>✓</span>
              {item}
            </div>
          ))}
        </div>
      )}

      {feature.compatibility && (
        <div className={styles.compatList}>
          {feature.compatibility.map((item, i) => (
            <div key={i} className={styles.compatItem}>
              <CompatIcon />
              {item}
            </div>
          ))}
        </div>
      )}

      {feature.transports && (
        <div className={styles.transportList}>
          {feature.transports.map((transport, i) => (
            <span key={i} className={styles.transportBadge}>
              <TransportIcon />
              {transport}
            </span>
          ))}
        </div>
      )}

      {feature.platforms && (
        <div className={styles.platformGrid}>
          {feature.platforms.map((platform, i) => (
            <div key={i} className={styles.platformItem}>
              <PlatformIcon />
              {platform}
            </div>
          ))}
        </div>
      )}

      {feature.analytics && (
        <div className={styles.analyticsList}>
          {feature.analytics.map((item, i) => (
            <div key={i} className={styles.analyticsItem}>
              <ChartIcon />
              {item}
            </div>
          ))}
        </div>
      )}

      {feature.search && (
        <div className={styles.searchList}>
          {feature.search.map((item, i) => (
            <div key={i} className={styles.searchItem}>
              <SearchIcon />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Icon components
function CompatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

function TransportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l-5.5 9h11z"/>
      <circle cx="17.5" cy="17.5" r="4.5"/>
      <path d="M3 13.5h8v8H3z"/>
    </svg>
  );
}

function PlatformIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2"/>
      <line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}