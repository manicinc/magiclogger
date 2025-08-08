// File: website/src/components/Landing/IntegrationSection/index.tsx

import React from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const integrations = [
  {
    id: 'express',
    name: 'Express',
    icon: '🚂',
    description: 'Automatic request logging with correlation IDs',
    code: `app.use(magicLogger.express());`
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    icon: '⚡',
    description: 'Full-stack logging for pages and API routes',
    code: `export default withLogger(handler);`
  },
  {
    id: 'react',
    name: 'React',
    icon: '⚛️',
    description: 'Error boundaries and performance tracking',
    code: `<LogProvider logger={logger}>`
  },
  {
    id: 'aws',
    name: 'AWS Lambda',
    icon: '☁️',
    description: 'Structured logs for CloudWatch',
    code: `exports.handler = withLogger(handler);`
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    icon: '☸️',
    description: 'JSON logs with pod metadata',
    code: `logger.k8s({ pod, namespace });`
  },
  {
    id: 'docker',
    name: 'Docker',
    icon: '🐳',
    description: 'Container-aware logging',
    code: `logger.docker({ containerId });`
  }
];

const ecosystem = [
  {
    name: 'Grafana',
    icon: '📊',
    description: 'Visualize logs with Loki',
    status: 'available'
  },
  {
    name: 'Elasticsearch',
    icon: '🔍',
    description: 'Full-text search and analytics',
    status: 'available'
  },
  {
    name: 'Datadog',
    icon: '📈',
    description: 'APM and log correlation',
    status: 'available'
  },
  {
    name: 'Sentry',
    icon: '🛡️',
    description: 'Error tracking integration',
    status: 'coming-soon'
  },
  {
    name: 'New Relic',
    icon: '📡',
    description: 'Application monitoring',
    status: 'coming-soon'
  },
  {
    name: 'Splunk',
    icon: '💹',
    description: 'Enterprise log management',
    status: 'coming-soon'
  }
];

export default function IntegrationSection() {
  return (
    <section className={styles.integrationsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Works with everything you use
          </Heading>
          <p className={styles.sectionSubtitle}>
            Drop-in integrations for your favorite frameworks and tools
          </p>
        </div>

        {/* Framework integrations */}
        <div className={styles.integrationsGrid}>
          {integrations.map((integration) => (
            <div key={integration.id} className={styles.integrationCard}>
              <div className={styles.integrationHeader}>
                <span className={styles.integrationLogo}>{integration.icon}</span>
                <h3 className={styles.integrationName}>{integration.name}</h3>
              </div>
              <p className={styles.integrationDescription}>
                {integration.description}
              </p>
              <div className={styles.integrationCode}>
                <code>{integration.code}</code>
              </div>
            </div>
          ))}
        </div>

        {/* Ecosystem */}
        {/* <div className={styles.ecosystem}>
          <h3 className={styles.ecosystemTitle}>Part of a larger ecosystem</h3>
          <div className={styles.ecosystemGrid}>
            {ecosystem.map((item) => (
              <div key={item.name} className={styles.ecosystemItem}>
                {item.status === 'coming-soon' && (
                  <span className={styles.comingSoon}>Coming Soon</span>
                )}
                <span className={styles.ecosystemIcon}>{item.icon}</span>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}