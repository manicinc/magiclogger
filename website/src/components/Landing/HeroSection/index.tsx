// File: website/src/components/Landing/HeroSection/index.tsx

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import AnimatedBackground from '@site/src/components/Landing/AnimatedBackground';
import InteractiveDemo from '@site/src/components/Landing/InteractiveDemo';
import { useTypingEffect, useCounter } from '@site/src/hooks/animations';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

export default function HeroSection() {
  const { displayedText } = useTypingEffect('Stop squinting at ugly console logs', 40);
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  const heroLogoSrc = isDarkTheme
    ? '/img/magiclogger-primary-no-subtitle-dark-4x.png'
    : '/img/magiclogger-primary-no-subtitle-transparent-4x.png';
  
  return (
    <header className={styles.heroSection}>
      <AnimatedBackground variant="datacenter" />
      
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            {/* Logo with proper MagicLog branding */}
            <div className={styles.logoContainer}>
              <div className={styles.logoWrapper}>
                <img
                  src={heroLogoSrc}
                  alt="MagicLogger"
                  className={styles.heroLogo}
                />
                <div className={styles.logoGlow} />
                <div className={styles.dataStream} />
              </div>
            </div>

            <Heading as="h1" className={styles.heroTitle}>
              <span className={styles.magicText}>MagicLog</span>
            </Heading>

            <p className={styles.heroTagline}>
              The command center for <span className={styles.logText}>MagicLogger</span>
            </p>

            <p className={styles.heroDescription}>
              {displayedText}
              <span className={styles.cursor}>|</span>
            </p>

            <p className={styles.heroSubDescription}>
              Transform your debugging experience with <span className={styles.highlight}>intelligent logging</span> that actually{' '}
              <span className={styles.highlight}>makes sense</span>. See patterns, track performance, and{' '}
              <span className={styles.highlight}>ship faster</span> with confidence.
            </p>

            {/* CTA Buttons */}
            <div className={styles.heroActions}>
              <Link
                className={clsx('button', styles.primaryButton)}
                to="/docs/intro">
                <ServerIcon />
                <span>Start Logging</span>
                <span className={styles.buttonGlow} />
              </Link>
              
              <a
                className={clsx('button', styles.dashboardButton)}
                href="https://app.magiclog.io"
                target="_blank"
                rel="noopener noreferrer">
                <DashboardIcon />
                <span>Open Dashboard</span>
                <span className={styles.newBadge}>
                  <span className={styles.pulseRing} />
                  NEW
                </span>
              </a>
              
              <a
                className={clsx('button', styles.landingButton)}
                href="https://magiclog.io"
                target="_blank"
                rel="noopener noreferrer">
                <span>About MagicLog</span>
                <ExternalIcon />
              </a>
            </div>

            {/* Terminal Install */}
            <div className={styles.terminal}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalDots}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
                <span className={styles.terminalTitle}>Terminal</span>
              </div>
              <div className={styles.terminalBody}>
                <span className={styles.prompt}>$</span>
                <code className={styles.installCommand}>npm install magiclogger</code>
                <button 
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText('npm install magiclogger')}>
                  <CopyIcon />
                </button>
              </div>
            </div>

            {/* Live Stats */}
            <div className={styles.heroStats}>
              <StatCard 
                value={12} 
                unit="KB" 
                label="Tiny Bundle" 
                icon={<PackageIcon />}
                color="purple" 
              />
              <StatCard 
                value={850} 
                unit="K/s" 
                label="Logs Per Sec" 
                icon={<SpeedIcon />}
                color="cyan" 
              />
              <StatCard 
                value={0} 
                label="Dependencies" 
                icon={<ZeroIcon />}
                color="green" 
              />
              <StatCard 
                value={5} 
                unit="★" 
                label="Developer Joy" 
                icon={<StarIcon />}
                color="yellow" 
              />
            </div>
          </div>

          {/* Interactive Demo */}
          <div className={styles.demoContainer}>
            <InteractiveDemo />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollArrow} />
        <span className={styles.scrollText}>Explore Features</span>
      </div>
    </header>
  );
}

// Sub-components
function StatCard({ value, unit = '', label, icon, color }) {
  const count = useCounter(value, 2000);
  return (
    <div className={clsx(styles.stat, styles[`stat${color}`])}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <div className={styles.statValue}>
          {count}{unit}
        </div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// Icon Components
function ServerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/>
      <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zM13 4v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z"/>
      <circle cx="8" cy="8" r="1" fill="#00ff88"/>
      <circle cx="8" cy="18" r="1" fill="#00d4ff"/>
      <circle cx="18" cy="8" r="1" fill="#9945ff"/>
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/>
      <polyline points="2.32 6.16 12 11 21.68 6.16" stroke="white" strokeWidth="2" fill="none"/>
      <line x1="12" y1="22.76" x2="12" y2="11" stroke="white" strokeWidth="2"/>
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.103 1.324a1 1 0 00-2.206 0l-1.437 7.186-5.896 5.896a1 1 0 000 1.414l4.243 4.243a1 1 0 001.414 0l5.896-5.896 7.186-1.437a1 1 0 000-2.206L13.103 1.324z"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  );
}

function ZeroIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );
}