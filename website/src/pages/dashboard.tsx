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
                <div className={styles.featureIcon}>📊</div>
                <h3>Live Streaming</h3>
                <p>Watch your logs flow in real-time with beautiful visualizations</p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🎨</div>
                <h3>Style Preservation</h3>
                <p>See your styled logs exactly as they appear in the terminal</p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🔍</div>
                <h3>Smart Search</h3>
                <p>AI-powered log analysis and pattern recognition</p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>⚡</div>
                <h3>Performance Metrics</h3>
                <p>Track throughput, latency, and system health in real-time</p>
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
                Expected Launch: Q2 2025
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}