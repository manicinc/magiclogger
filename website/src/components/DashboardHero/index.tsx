// File: website/src/components/DashboardHero/index.tsx

import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

export default function DashboardHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={styles.dashboardHero}>
      {/* Animated background layers */}
      <div className={styles.backgroundLayers}>
        <div 
          className={styles.gradientOrb1} 
          style={{ 
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` 
          }} 
        />
        <div 
          className={styles.gradientOrb2} 
          style={{ 
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` 
          }} 
        />
        <div className={styles.gridPattern} />
      </div>

      <div className="container">
        <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🚀</span>
            <span className={styles.badgeText}>Now in Beta</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine1}>Your Logs,</span>
            <span className={styles.titleLine2}>
              <span className={styles.titleGradient}>Centralized</span> & 
              <span className={styles.titleGradient}> Analyzed</span>
            </span>
          </h1>

          <p className={styles.heroDescription}>
            MagicLogger Dashboard brings all your application logs into one beautiful, 
            intelligent platform. Real-time monitoring, AI-powered insights, and 
            collaborative debugging for modern development teams.
          </p>

          <div className={styles.heroActions}>
            <a 
              href="https://magiclog.io/signup" 
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryCTA}>
              <span className={styles.ctaText}>Start Free Trial</span>
              <span className={styles.ctaIcon}>→</span>
              <div className={styles.ctaShine} />
            </a>
            
            <a 
              href="https://magiclog.io/demo" 
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryCTA}>
              <span className={styles.playIcon}>▶</span>
              <span className={styles.ctaText}>Watch Demo</span>
            </a>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>50M+</div>
              <div className={styles.statLabel}>Logs Processed Daily</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>99.9%</div>
              <div className={styles.statLabel}>Uptime SLA</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>&lt; 100ms</div>
              <div className={styles.statLabel}>Query Latency</div>
            </div>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className={styles.dashboardPreview}>
          <div className={styles.browserChrome}>
            <div className={styles.browserDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <div className={styles.browserUrl}>
              <span className={styles.lockIcon}>🔒</span>
              <span>app.magiclog.io/dashboard</span>
            </div>
          </div>
          
          <div className={styles.dashboardContent}>
            <div className={styles.dashboardSidebar}>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarIcon}>📊</span>
                <span>Overview</span>
              </div>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarIcon}>📝</span>
                <span>Logs</span>
              </div>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarIcon}>🔍</span>
                <span>Search</span>
              </div>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarIcon}>⚡</span>
                <span>Alerts</span>
              </div>
            </div>
            
            <div className={styles.dashboardMain}>
              <div className={styles.metricsRow}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Total Logs</div>
                  <div className={styles.metricValue}>1.2M</div>
                  <div className={styles.metricChange}>+12.5%</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Error Rate</div>
                  <div className={styles.metricValue}>0.03%</div>
                  <div className={styles.metricChange}>-5.2%</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Avg Response</div>
                  <div className={styles.metricValue}>124ms</div>
                  <div className={styles.metricChange}>+2.1%</div>
                </div>
              </div>
              
              <div className={styles.chartArea}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Log Volume</span>
                  <span className={styles.chartPeriod}>Last 24 hours</span>
                </div>
                <svg className={styles.chart} viewBox="0 0 400 100">
                  <path 
                    d="M0,80 Q50,70 100,75 T200,60 T300,65 T400,50" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <div className={styles.logStream}>
                <div className={styles.logEntry}>
                  <span className={styles.logTime}>14:32:15</span>
                  <span className={styles.logLevelInfo}>INFO</span>
                  <span className={styles.logMessage}>User authentication successful</span>
                </div>
                <div className={styles.logEntry}>
                  <span className={styles.logTime}>14:32:18</span>
                  <span className={styles.logLevelWarn}>WARN</span>
                  <span className={styles.logMessage}>High memory usage detected (85%)</span>
                </div>
                <div className={styles.logEntry}>
                  <span className={styles.logTime}>14:32:22</span>
                  <span className={styles.logLevelError}>ERROR</span>
                  <span className={styles.logMessage}>Database connection timeout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}