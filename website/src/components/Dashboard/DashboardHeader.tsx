import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function DashboardHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.logoContainer}>
          <img 
            src="/img/magiclogger-primary-no-subtitle-transparent-4x.png" 
            alt="MagicLogger" 
            className={styles.manicLogo}
          />
        </div>
        <Heading as="h1" className="hero__title">
          📊 MagicLogger Dashboard
        </Heading>
        <p className="hero__subtitle">
          Centralized log analysis and monitoring for all your MagicLogger-powered applications
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="#features">
            Explore Features 🔍
          </Link>
          <Link
            className="button button--outline button--lg"
            to="#pricing"
            style={{marginLeft: '1rem'}}>
            View Pricing 💎
          </Link>
        </div>
        
        <div className={styles.comingSoon}>
          <span className={styles.badge}>🚧 Coming Soon</span>
          <p>Currently in development - Join our waitlist for early access!</p>
        </div>
      </div>
    </header>
  );
}