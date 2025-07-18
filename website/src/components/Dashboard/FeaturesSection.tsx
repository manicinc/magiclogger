import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

interface Feature {
  title: string;
  description: string;
  icon: string;
  category: 'Core' | 'Premium' | 'Enterprise';
}

const features: Feature[] = [
  {
    title: '🌐 Unified Log Management',
    description: 'Collect and organize logs from all your MagicLogger-enabled applications in one centralized dashboard.',
    icon: '🌐',
    category: 'Core'
  },
  {
    title: '🔍 Real-time Monitoring',
    description: 'Live log streaming with instant alerts and notifications for critical events across your infrastructure.',
    icon: '🔍',
    category: 'Core'
  },
  {
    title: '📈 Analytics & Insights',
    description: 'Powerful analytics with custom dashboards, trends analysis, and performance metrics visualization.',
    icon: '📈',
    category: 'Core'
  },
  {
    title: '🤖 AI Anomaly Detection',
    description: 'Advanced machine learning algorithms detect unusual patterns and potential issues before they become problems.',
    icon: '🤖',
    category: 'Premium'
  },
  {
    title: '🧠 Intelligent Log Analysis',
    description: 'AI-powered log parsing and categorization with natural language insights and automated root cause analysis.',
    icon: '🧠',
    category: 'Premium'
  },
  {
    title: '⚡ Smart Alerting',
    description: 'Context-aware alerts with AI-driven severity assessment and intelligent noise reduction.',
    icon: '⚡',
    category: 'Premium'
  },
  {
    title: '🔐 Enterprise Security',
    description: 'Advanced security features including audit trails, compliance reporting, and data encryption.',
    icon: '🔐',
    category: 'Enterprise'
  },
  {
    title: '🏢 Team Collaboration',
    description: 'Multi-user support with role-based access control, shared dashboards, and collaborative incident management.',
    icon: '🏢',
    category: 'Enterprise'
  },
  {
    title: '🔗 API & Integrations',
    description: 'Comprehensive REST API and integrations with popular tools like Slack, PagerDuty, and Jira.',
    icon: '🔗',
    category: 'Enterprise'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2" className={styles.sectionTitle}>
            🚀 Powerful Features for Modern Development
          </Heading>
          <p className={styles.sectionSubtitle}>
            From basic log aggregation to advanced AI-powered analysis
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={clsx(styles.featureCard, styles[`category${feature.category}`])}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>
                  {feature.title}
                  <span className={clsx(styles.categoryBadge, styles[`badge${feature.category}`])}>
                    {feature.category}
                  </span>
                </h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}