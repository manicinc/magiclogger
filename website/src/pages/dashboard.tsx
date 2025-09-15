import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import styles from './dashboard.module.css';

export default function Dashboard(): JSX.Element {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the newsletter widget script
    if (formRef.current && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://eocampaign1.com/form/9262a386-6ef3-11f0-bd78-dff98cfe1a02.js';
      script.async = true;
      script.setAttribute('data-form', '9262a386-6ef3-11f0-bd78-dff98cfe1a02');
      formRef.current.appendChild(script);

      return () => {
        // Cleanup on unmount
        if (formRef.current && formRef.current.contains(script)) {
          formRef.current.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <Layout
      title="Magic Dashboard - Coming Soon"
      description="Real-time log visualization and analytics dashboard for MagicLogger">
      <main className={styles.dashboardPage}>
        <div className={styles.container}>
          <div className={styles.glowOrb} />
          <div className={styles.glowOrb2} />
          
          <div className={styles.content}>
            <div className={styles.badge}>COMING SOON</div>
            
            <h1 className={styles.title}>
              <span className={styles.magicText}>Magic</span>
              <span className={styles.dashboardText}>Dashboard</span>
            </h1>
            
            <p className={styles.subtitle}>
              Real-time log visualization meets intelligent analytics
            </p>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                    <rect className={styles.bar1} x="15" y="60" width="12" height="30" fill="url(#chartGrad)" rx="2" />
                    <rect className={styles.bar2} x="35" y="40" width="12" height="50" fill="url(#chartGrad)" rx="2" />
                    <rect className={styles.bar3} x="55" y="25" width="12" height="65" fill="url(#chartGrad)" rx="2" />
                    <rect className={styles.bar4} x="75" y="45" width="12" height="45" fill="url(#chartGrad)" rx="2" />
                    <path className={styles.chartLine} d="M 21 55 L 41 35 L 61 20 L 81 40" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle className={styles.chartDot1} cx="21" cy="55" r="4" fill="#fbbf24" />
                    <circle className={styles.chartDot2} cx="41" cy="35" r="4" fill="#fbbf24" />
                    <circle className={styles.chartDot3} cx="61" cy="20" r="4" fill="#fbbf24" />
                    <circle className={styles.chartDot4} cx="81" cy="40" r="4" fill="#fbbf24" />
                  </svg>
                </div>
                <h3>Live Streaming</h3>
                <p>Watch your logs flow in real-time with beautiful visualizations</p>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="brushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    <g className={styles.paintBrush}>
                      <rect x="42" y="20" width="16" height="40" fill="#8b5cf6" rx="2" />
                      <path d="M 42 60 L 42 70 L 50 80 L 58 70 L 58 60 Z" fill="url(#brushGrad)" />
                      <rect x="42" y="18" width="16" height="6" fill="#a78bfa" rx="1" />
                    </g>
                    <circle className={styles.paint1} cx="25" cy="75" r="6" fill="#10b981" opacity="0.8" />
                    <circle className={styles.paint2} cx="75" cy="75" r="6" fill="#3b82f6" opacity="0.8" />
                    <circle className={styles.paint3} cx="50" cy="85" r="6" fill="#ec4899" opacity="0.8" />
                  </svg>
                </div>
                <h3>Style Preservation</h3>
                <p>See your styled logs exactly as they appear in the terminal</p>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <circle className={styles.magnifier} cx="40" cy="40" r="22" fill="none" stroke="url(#searchGrad)" strokeWidth="4" />
                    <line x1="55" y1="55" x2="70" y2="70" stroke="url(#searchGrad)" strokeWidth="4" strokeLinecap="round" />
                    <g className={styles.sparkles}>
                      <circle cx="30" cy="30" r="2" fill="#fbbf24" />
                      <circle cx="40" cy="35" r="2" fill="#fbbf24" />
                      <circle cx="35" cy="45" r="2" fill="#fbbf24" />
                      <circle cx="45" cy="40" r="2" fill="#fbbf24" />
                    </g>
                    <path className={styles.aiGlow} d="M 75 20 L 80 15 L 85 20 L 80 25 Z" fill="#a855f7" />
                    <path className={styles.aiGlow2} d="M 20 70 L 25 65 L 30 70 L 25 75 Z" fill="#ec4899" />
                  </svg>
                </div>
                <h3>Smart Search</h3>
                <p>AI-powered log analysis and pattern recognition</p>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <path className={styles.lightning} d="M 55 10 L 35 45 L 45 45 L 40 90 L 65 40 L 50 40 Z" fill="url(#boltGrad)" filter="url(#glow)" />
                    <circle className={styles.pulse1} cx="50" cy="50" r="35" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />
                    <circle className={styles.pulse2} cx="50" cy="50" r="25" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />
                  </svg>
                </div>
                <h3>Performance Metrics</h3>
                <p>Track throughput, latency, and system health in real-time</p>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="filterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <g className={styles.filterGroup}>
                      <rect x="20" y="15" width="60" height="8" rx="4" fill="#e5e7eb" />
                      <rect className={styles.filterBar1} x="20" y="15" width="35" height="8" rx="4" fill="url(#filterGrad)" />

                      <rect x="20" y="30" width="60" height="8" rx="4" fill="#e5e7eb" />
                      <rect className={styles.filterBar2} x="20" y="30" width="45" height="8" rx="4" fill="#3b82f6" />

                      <rect x="20" y="45" width="60" height="8" rx="4" fill="#e5e7eb" />
                      <rect className={styles.filterBar3} x="20" y="45" width="25" height="8" rx="4" fill="#ef4444" />

                      <rect x="20" y="60" width="60" height="8" rx="4" fill="#e5e7eb" />
                      <rect className={styles.filterBar4} x="20" y="60" width="50" height="8" rx="4" fill="#f59e0b" />

                      <rect x="20" y="75" width="60" height="8" rx="4" fill="#e5e7eb" />
                      <rect className={styles.filterBar5} x="20" y="75" width="40" height="8" rx="4" fill="#8b5cf6" />
                    </g>
                    <circle className={styles.filterDot} cx="85" cy="50" r="8" fill="url(#filterGrad)" />
                    <path className={styles.checkMark} d="M 81 50 L 84 53 L 90 47" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Smart Filtering</h3>
                <p>Advanced log filtering by level, transport, tags, and custom metadata</p>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="transportGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <g className={styles.transportGroup}>
                      <circle cx="50" cy="30" r="12" fill="url(#transportGrad)" opacity="0.9" />
                      <circle cx="30" cy="60" r="10" fill="#3b82f6" opacity="0.9" />
                      <circle cx="50" cy="60" r="10" fill="#10b981" opacity="0.9" />
                      <circle cx="70" cy="60" r="10" fill="#f59e0b" opacity="0.9" />

                      <line className={styles.transportLine1} x1="50" y1="42" x2="30" y2="50" stroke="url(#transportGrad)" strokeWidth="2" opacity="0.6" />
                      <line className={styles.transportLine2} x1="50" y1="42" x2="50" y2="50" stroke="url(#transportGrad)" strokeWidth="2" opacity="0.6" />
                      <line className={styles.transportLine3} x1="50" y1="42" x2="70" y2="50" stroke="url(#transportGrad)" strokeWidth="2" opacity="0.6" />

                      <circle className={styles.dataPoint1} cx="50" cy="30" r="3" fill="white" />
                      <circle className={styles.dataPoint2} cx="30" cy="60" r="2" fill="white" />
                      <circle className={styles.dataPoint3} cx="50" cy="60" r="2" fill="white" />
                      <circle className={styles.dataPoint4} cx="70" cy="60" r="2" fill="white" />
                    </g>
                    <text x="50" y="85" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">TRANSPORTS</text>
                  </svg>
                </div>
                <h3>Multi-Transport</h3>
                <p>Route logs to files, HTTP endpoints, MongoDB, and custom destinations</p>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="contextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </linearGradient>
                    </defs>
                    <g className={styles.contextGroup}>
                      <rect x="25" y="25" width="50" height="50" rx="8" fill="none" stroke="url(#contextGrad)" strokeWidth="2" opacity="0.3" />
                      <rect className={styles.contextLayer1} x="30" y="30" width="40" height="40" rx="6" fill="none" stroke="url(#contextGrad)" strokeWidth="2" opacity="0.5" />
                      <rect className={styles.contextLayer2} x="35" y="35" width="30" height="30" rx="4" fill="none" stroke="url(#contextGrad)" strokeWidth="2" opacity="0.7" />
                      <rect className={styles.contextCore} x="40" y="40" width="20" height="20" rx="2" fill="url(#contextGrad)" opacity="0.9" />

                      <circle className={styles.contextDot1} cx="30" cy="30" r="2" fill="#fbbf24" />
                      <circle className={styles.contextDot2} cx="70" cy="30" r="2" fill="#fbbf24" />
                      <circle className={styles.contextDot3} cx="30" cy="70" r="2" fill="#fbbf24" />
                      <circle className={styles.contextDot4} cx="70" cy="70" r="2" fill="#fbbf24" />
                    </g>
                    <text x="50" y="85" textAnchor="middle" fill="#6b7280" fontSize="9" fontWeight="600">CONTEXT</text>
                  </svg>
                </div>
                <h3>Context & Metadata</h3>
                <p>Rich contextual logging with tags, trace IDs, and OpenTelemetry compatibility by default</p>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                      <linearGradient id="rotateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    <g className={styles.rotateGroup}>
                      <circle cx="50" cy="50" r="25" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <path className={styles.rotatePath} d="M 50 25 A 25 25 0 0 1 75 50" stroke="url(#rotateGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />

                      <g className={styles.fileStack}>
                        <rect x="38" y="38" width="24" height="3" rx="1" fill="#6b7280" opacity="0.3" />
                        <rect x="38" y="43" width="24" height="3" rx="1" fill="#6b7280" opacity="0.5" />
                        <rect x="38" y="48" width="24" height="3" rx="1" fill="#6b7280" opacity="0.7" />
                        <rect x="38" y="53" width="24" height="3" rx="1" fill="#6b7280" opacity="0.9" />
                        <rect className={styles.activeFile} x="38" y="58" width="24" height="3" rx="1" fill="url(#rotateGrad)" />
                      </g>

                      <path className={styles.arrowHead} d="M 73 45 L 75 50 L 77 45" stroke="url(#rotateGrad)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <text x="50" y="85" textAnchor="middle" fill="#6b7280" fontSize="9" fontWeight="600">ROTATION</text>
                  </svg>
                </div>
                <h3>Log Rotation</h3>
                <p>Automatic file rotation by size, date, or custom rules with compression</p>
              </div>
            </div>
            
            <div className={styles.notifySection}>
              <p className={styles.notifyText}>
                The Magic Dashboard will revolutionize how you monitor and analyze logs.
                <br />
                Subscribe to get early access when it launches.
              </p>
              
              <div ref={formRef} className={styles.emailForm}>
                {/* Newsletter widget will be injected here */}
              </div>
              
              <p className={styles.launchDate}>
                Expected Launch: Q3 2026
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}