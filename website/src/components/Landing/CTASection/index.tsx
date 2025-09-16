// File: website/src/components/Landing/CTASection/index.tsx

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import AnimatedBackground from '@site/src/components/Landing/AnimatedBackground';
import styles from './styles.module.css';

export default function CTASection() {
  const newsletterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the newsletter widget script
    if (newsletterRef.current && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://eocampaign1.com/form/9262a386-6ef3-11f0-bd78-dff98cfe1a02.js';
      script.async = true;
      script.setAttribute('data-form', '9262a386-6ef3-11f0-bd78-dff98cfe1a02');
      newsletterRef.current.appendChild(script);

      return () => {
        // Cleanup on unmount
        if (newsletterRef.current && newsletterRef.current.contains(script)) {
          newsletterRef.current.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <section className={styles.ctaSection}>
      <AnimatedBackground variant="gradient" />
      
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            Ready to transform your debugging experience?
          </Heading>
          <p className={styles.ctaSubtitle}>
            Join thousands of developers who've made their logs beautiful, meaningful, and actually useful.
          </p>

          <div className={styles.ctaActions}>
            <Link
              className={clsx('button', styles.ctaPrimary)}
              to="/docs/">
              <span>Start Building</span>
              <ArrowIcon />
            </Link>
            
            <a
              className={clsx('button', styles.ctaSecondary)}
              href="https://github.com/manicinc/magiclogger"
              target="_blank"
              rel="noopener noreferrer">
              <GitHubIcon />
              <span>Star on GitHub</span>
            </a>
          </div>

          {/* Stats section - commented out until we have real numbers
          <div className={styles.ctaStats}>
            <StatCard number="50M+" label="Logs Daily" icon="📊" />
            <StatCard number="10k+" label="Happy Devs" icon="😊" />
            <StatCard number="99.9%" label="Uptime" icon="✅" />
            <StatCard number="24/7" label="Support" icon="🛟" />
          </div>
          */}
        </div>

        {/* Quick start terminal */}
        <div className={styles.quickStartTerminal}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.terminalTitle}>Quick Start</span>
          </div>
          <div className={styles.terminalBody}>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>$</span>
              <span className={styles.command}>npm install magiclogger</span>
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}></span>
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.comment}>// Start logging in seconds</span>
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.keyword}>import</span> <span className={styles.variable}>Logger</span> <span className={styles.keyword}>from</span> <span className={styles.string}>'magiclogger'</span>;
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.keyword}>const</span> <span className={styles.variable}>logger</span> = <span className={styles.keyword}>new</span> <span className={styles.variable}>Logger</span>();
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.variable}>logger</span>.<span className={styles.method}>info</span>(<span className={styles.string}>'✨ Hello, MagicLogger!'</span>);
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={styles.newsletterSection}>
          <div className={styles.newsletterContent}>
            <h3 className={styles.newsletterTitle}>Stay Updated</h3>
            <p className={styles.newsletterText}>
              Development of <span className={styles.magicLoggerText}>MagicLogger</span> is sponsored by{' '}
              <a 
                href="https://manic.agency" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.manicLink}>
                Manic Agency
              </a>
            </p>
            <div ref={newsletterRef} className={styles.newsletterWidget}>
              {/* Newsletter widget will be injected here */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ number, label, icon }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statContent}>
        <div className={styles.statNumber}>{number}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// Icons
function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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