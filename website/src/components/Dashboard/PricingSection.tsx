import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Open Source',
    price: 'Free',
    description: 'Perfect for personal projects and small teams',
    features: [
      '✅ Basic log aggregation',
      '✅ Real-time monitoring',
      '✅ Simple analytics',
      '✅ Up to 3 applications',
      '✅ 30-day log retention',
      '✅ Community support'
    ],
    cta: 'Get Started',
    ctaLink: '/docs',
    popular: false
  },
  {
    name: 'Premium',
    price: '$29/month',
    description: 'Advanced features for growing businesses',
    features: [
      '✅ Everything in Open Source',
      '🤖 AI anomaly detection',
      '🧠 Intelligent log analysis',
      '⚡ Smart alerting',
      '📊 Advanced analytics',
      '🔍 Custom dashboards',
      '📱 Mobile app access',
      '💬 Priority support'
    ],
    cta: 'Join Waitlist',
    ctaLink: '#waitlist',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Full-scale solution for large organizations',
    features: [
      '✅ Everything in Premium',
      '🔐 Advanced security & compliance',
      '🏢 Multi-tenant architecture',
      '🔗 Custom integrations',
      '📞 Dedicated support',
      '🎯 SLA guarantees',
      '🏗️ On-premise deployment',
      '🎓 Training & onboarding'
    ],
    cta: 'Contact Sales',
    ctaLink: 'mailto:sales@manic.agency',
    popular: false
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2" className={styles.sectionTitle}>
            💎 Simple, Transparent Pricing
          </Heading>
          <p className={styles.sectionSubtitle}>
            Start free, scale as you grow
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {plans.map((plan, idx) => (
            <div key={idx} className={clsx(styles.pricingCard, plan.popular && styles.popularCard)}>
              {plan.popular && <div className={styles.popularBadge}>🌟 Most Popular</div>}
              <div className={styles.pricingHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>{plan.price}</div>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>
              <div className={styles.pricingFeatures}>
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className={styles.feature}>
                    {feature}
                  </div>
                ))}
              </div>
              <div className={styles.pricingFooter}>
                <Link
                  className={clsx(
                    'button',
                    plan.popular ? 'button--primary' : 'button--outline',
                    'button--lg'
                  )}
                  to={plan.ctaLink}>
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}