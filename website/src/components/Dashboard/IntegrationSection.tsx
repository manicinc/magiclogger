import React from 'react';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

export default function IntegrationSection() {
  return (
    <section className={styles.integrationSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2" className={styles.sectionTitle}>
            🔌 Seamless Integration
          </Heading>
          <p className={styles.sectionSubtitle}>
            Works with any application using MagicLogger
          </p>
        </div>

        <div className={styles.integrationDemo}>
          <div className={styles.codeExample}>
            <Heading as="h3">📝 Simple Setup</Heading>
            <CodeBlock language="typescript">
{`import { Logger } from 'magiclogger';

const logger = new Logger({
  // Enable dashboard integration
  dashboard: {
    enabled: true,
    apiKey: process.env.MAGICLOGGER_API_KEY,
    projectId: 'my-awesome-app'
  }
});

// All your existing logs automatically appear in the dashboard
logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });
logger.error('Payment failed', { orderId: 456, error: 'Card declined' });
logger.performance('API Response', { endpoint: '/api/users', duration: 245 });

// That's it! Your logs are now centralized and analyzed`}
            </CodeBlock>
          </div>

          <div className={styles.dashboardPreview}>
            <div className={styles.mockDashboard}>
              <div className={styles.dashboardHeader}>
                <h4>📊 Live Dashboard Preview</h4>
                <div className={styles.statusIndicators}>
                  <span className={styles.statusGreen}>● 12 Apps Online</span>
                  <span className={styles.statusYellow}>● 3 Warnings</span>
                  <span className={styles.statusRed}>● 1 Error</span>
                </div>
              </div>
              <div className={styles.dashboardContent}>
                <div className={styles.logStream}>
                  <div className={styles.logEntry}>
                    <span className={styles.timestamp}>14:32:15</span>
                    <span className={styles.levelInfo}>INFO</span>
                    <span className={styles.message}>User authentication successful</span>
                    <span className={styles.app}>web-app</span>
                  </div>
                  <div className={styles.logEntry}>
                    <span className={styles.timestamp}>14:32:18</span>
                    <span className={styles.levelWarn}>WARN</span>
                    <span className={styles.message}>High memory usage detected</span>
                    <span className={styles.app}>api-server</span>
                  </div>
                  <div className={styles.logEntry}>
                    <span className={styles.timestamp}>14:32:22</span>
                    <span className={styles.levelError}>ERROR</span>
                    <span className={styles.message}>Database connection timeout</span>
                    <span className={styles.app}>background-worker</span>
                  </div>
                </div>
                <div className={styles.charts}>
                  <div className={styles.chart}>📈 Request Volume</div>
                  <div className={styles.chart}>🔥 Error Rate</div>
                  <div className={styles.chart}>⚡ Performance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}