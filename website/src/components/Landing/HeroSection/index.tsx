// File: website/src/components/Landing/HeroSection/index.tsx

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import InteractiveDemo from '@site/src/components/Landing/InteractiveDemo';
import { useTypingEffect, useCounter } from '@site/src/hooks/animations';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

export default function HeroSection() {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText('npm install magiclogger');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <header className={styles.heroSection}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            {/* Rainbow gradient title */}
            <div className={styles.titleContainer}>
              <p className={styles.homeText}>Home of</p>
              <h1 className={styles.rainbowTitle}>
                <span className={styles.magicText}>Magic</span>
                <span className={styles.loggerText}>Logger</span>
              </h1>
              <p className={styles.magicSchema}>MAGIC Schema</p>
            </div>

            {/* Mobile Demo - shows only on mobile, right after title */}
            <div className={styles.mobileDemoContainer}>
              <InteractiveDemo />
            </div>

            <p className={styles.heroTagline}>
              Visual Dashboard for Beautiful Logs End-to-End
            </p>

            <p className={styles.heroSubDescription}>
              We built MagicLogger because we believe logs should be as <span className={styles.highlight}>visually informative and beautiful</span> in production as they are during development.{' '}
              The <a href="https://github.com/manicinc/magiclogger/blob/master/docs/magic-schema.md" target="_blank" rel="noopener noreferrer" className={styles.schemaLink}><span className={styles.highlight}>MAGIC Schema</span></a> preserves your styled logs across any transport or platform.{' '}
              Focused on <span className={styles.highlight}>visual clarity</span> and developer experience, not just raw performance.
            </p>

            {/* CTA Buttons */}
            <div className={styles.heroActions}>
              <Link
                className={clsx('button button--primary', styles.primaryButton)}
                to="/docs/">
                <ServerIcon />
                <span>Get Started</span>
              </Link>
              
              <a
                className={clsx('button button--secondary', styles.secondaryButton)}
                href="/api/"
                target="_self">
                <ApiIcon />
                <span>API Documentation</span>
              </a>
              
              <a
                className={clsx('button button--secondary', styles.githubButton)}
                href="https://github.com/manicinc/magiclogger"
                target="_blank"
                rel="noopener noreferrer">
                <GithubIcon />
                <span>View on GitHub</span>
              </a>
              
              <Link
                to="/dashboard"
                className={clsx('button', styles.dashboardButton)}
                title="Magic Dashboard - Coming Soon">
                <span className={styles.dashboardButtonInner}>
                  <DashboardIcon />
                  <span>Magic Dashboard</span>
                </span>
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              </Link>
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
                  onClick={handleCopy}
                  title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>

            {/* Updated Stats with correct performance numbers */}
            <div className={styles.heroStats}>
              <StatCard 
                value={43.3} 
                unit="KB" 
                label="Core (gzip)" 
                icon={<PackageIcon />}
                color="purple" 
              />
              <StatCard 
                value={203.4} 
                unit="K ops/s" 
                label="Async Plain" 
                icon={<SpeedIcon />}
                color="cyan" 
              />
              <StatCard 
                value={31.1} 
                unit="K ops/s" 
                label="Async Styled" 
                icon={<SyncIcon />}
                color="green" 
              />
              <StatCard 
                value="Minimal" 
                label="Dependencies" 
                icon={<ZeroIcon />}
                color="yellow" 
              />
            </div>

          </div>

          {/* Desktop Demo - hidden on mobile */}
          <div className={styles.desktopDemoContainer}>
            <InteractiveDemo />
          </div>
        </div>
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

function ApiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h6l1 -2h6l1 2h6"/>
      <rect x="3" y="7" width="18" height="13" rx="2"/>
      <path d="M8 12h.01M12 12h.01M16 12h.01M8 16h8"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
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

function SyncIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
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

function DashboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  );
}