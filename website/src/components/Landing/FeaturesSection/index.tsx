// File: website/src/components/Landing/FeaturesSection/index.tsx

import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const features = [
  {
    title: 'Beautiful by Default',
    description: 'Turn your console into a work of art. Automatic colors, emojis, tables, and formatting that makes debugging a joy.',
    demo: `logger.info('🌈 <rainbow>');
logger.table(data);
logger.progressBar(0.75);`,
    gradient: 'rainbow',
    highlights: ['256 Colors', 'Smart Tables', 'Progress Bars', 'Emoji Support']
  },
  {
    title: 'Async by Default',
    description: 'Non-blocking async logging for responsive applications. Optimized for visual clarity, not just speed. Sync mode available when needed.',
    stats: ['250K+ ops/s plain', '120K+ ops/s styled', 'Minimal dependencies', 'Tree-shakeable'],
    gradient: 'lightning'
  },
  {
    title: 'MAGIC Schema',
    description: 'Universal style preservation with our MAGIC schema. Maintain consistent formatting across all transports.',
    features: ['Style Preservation', 'Cross-Transport', 'Universal Format', 'Color Consistency'],
    gradient: 'brain'
  },
  {
    title: 'Ship Anywhere',
    description: 'One logger, infinite destinations. From console to cloud, we support all major transports.',
    transports: ['Console', 'File', 'HTTP/S', 'S3', 'MongoDB', 'PostgreSQL', 'WebSocket', 'OTLP', 'Stream'],
    gradient: 'rocket'
  },
  {
    title: 'Production Ready',
    description: 'Built-in extensions for rate limiting, sampling, redaction, and queue management. Focus on reliability and maintainability.',
    features: ['Rate Limiter', 'Sampler', 'Redactor', 'Queue Manager'],
    gradient: 'shield'
  },
  {
    title: 'Works Everywhere',
    description: 'Same API for Node.js, browsers, and all JavaScript environments. The only production logger with full browser support.',
    platforms: ['Node.js + Deno', 'Browser Console', 'React Native', 'Isomorphic Apps'],
    gradient: 'universal'
  },
  {
    title: 'OpenTelemetry Support',
    description: 'Native OpenTelemetry integration for distributed tracing and observability.',
    features: ['Trace Context', 'Span Integration', 'OTLP Export', 'W3C Standards'],
    gradient: 'analytics'
  },
  {
    title: 'Flexible Architecture',
    description: 'Extensible design with custom transports, formatters, and processors.',
    features: ['Custom Transports', 'Custom Formatters', 'Middleware Support', 'Plugin System'],
    gradient: 'tools'
  },
  {
    title: 'TypeScript First',
    description: '100% TypeScript with full type safety and enforced 70%+ unit test coverage in CI/CD.',
    features: ['Full Type Safety', '70%+ Test Coverage', 'Strict CI/CD Guards', 'Type Definitions'],
    gradient: 'typescript'
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
              <span className={styles.checkmark}></span>
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
    </div>
  );
}

// Icon components
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