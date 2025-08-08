// File: website/src/components/Landing/InteractiveDemo/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

const demoScenarios = [
  {
    title: 'Real-time Monitoring',
    description: 'Watch your application come alive',
    code: `// Real-time application monitoring
logger.info('🚀 Application started', {
  version: '2.1.0',
  environment: 'production',
  node: process.version
});

logger.metric('memory.usage', process.memoryUsage());
logger.metric('cpu.load', os.loadavg());

// Track user activity
logger.info('👤 User logged in', {
  userId: 'user-123',
  method: 'oauth',
  ip: '192.168.1.1'
});`,
    logs: [
      { time: '10:30:45.123', level: 'info', icon: '🚀', message: 'Application started', meta: 'v2.1.0 production node-v18' },
      { time: '10:30:45.234', level: 'metric', icon: '📊', message: 'memory.usage', meta: 'heap=42MB rss=128MB' },
      { time: '10:30:45.345', level: 'metric', icon: '📊', message: 'cpu.load', meta: '[0.92, 1.03, 0.87]' },
      { time: '10:30:46.456', level: 'info', icon: '👤', message: 'User logged in', meta: 'user-123 oauth' }
    ]
  },
  {
    title: 'Error Tracking',
    description: 'Catch and analyze errors instantly',
    code: `// Comprehensive error tracking
try {
  await processPayment(order);
  logger.success('💳 Payment processed', {
    orderId: order.id,
    amount: order.total,
    method: 'stripe'
  });
} catch (error) {
  logger.error('💔 Payment failed', {
    error,
    orderId: order.id,
    retryCount: 3,
    customerImpact: 'high'
  });
  
  // Track error patterns
  logger.metric('errors.payment', 1, {
    type: error.code,
    gateway: 'stripe'
  });
}`,
    logs: [
      { time: '10:31:12.567', level: 'error', icon: '💔', message: 'Payment failed', meta: 'CARD_DECLINED order-789' },
      { time: '10:31:12.678', level: 'error', icon: '🔍', message: 'Error details', meta: 'retryCount=3 impact=high' },
      { time: '10:31:12.789', level: 'metric', icon: '📈', message: 'errors.payment', meta: 'type=CARD_DECLINED gateway=stripe' },
      { time: '10:31:13.890', level: 'warn', icon: '⚠️', message: 'Fallback to PayPal', meta: 'order-789' }
    ]
  },
  {
    title: 'Performance Analytics',
    description: 'Track every millisecond that matters',
    code: `// Performance monitoring
logger.time('api-request');

const response = await fetch('/api/users');
const data = await response.json();

logger.timeEnd('api-request');

// Track detailed metrics
logger.performance('API Performance', {
  endpoint: '/api/users',
  method: 'GET',
  status: response.status,
  size: data.length,
  cache: response.headers.get('x-cache')
});`,
    logs: [
      { time: '10:32:01.012', level: 'time', icon: '⏱️', message: 'api-request started', meta: '' },
      { time: '10:32:01.234', level: 'time', icon: '⏱️', message: 'api-request completed', meta: '222ms' },
      { time: '10:32:01.345', level: 'perf', icon: '🚀', message: 'API Performance', meta: 'GET /api/users 200' },
      { time: '10:32:01.456', level: 'info', icon: '💾', message: 'Cache hit', meta: 'saved 180ms' }
    ]
  }
];

export default function InteractiveDemo() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const consoleRef = useRef(null);
  
  const currentScenario = demoScenarios[activeScenario];

  useEffect(() => {
    if (isPlaying) {
      setLogs([]);
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < currentScenario.logs.length) {
          setLogs(prev => [...prev, currentScenario.logs[index]]);
          index++;
          
          // Auto-scroll
          if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
          }
        } else {
          setIsPlaying(false);
          clearInterval(interval);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, activeScenario]);

  // Auto-cycle through scenarios
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPlaying) {
        setActiveScenario((prev) => (prev + 1) % demoScenarios.length);
        setIsPlaying(true);
      }
    }, 8000);
    
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className={styles.demoCard}>
      {/* Terminal-style header */}
      <div className={styles.terminalHeader}>
        <div className={styles.terminalDots}>
          <span className={clsx(styles.dot, styles.red)} />
          <span className={clsx(styles.dot, styles.yellow)} />
          <span className={clsx(styles.dot, styles.green)} />
        </div>
        <div className={styles.terminalTitle}>
          <ServerIcon />
          <span>MagicLogger Live Demo</span>
        </div>
        <div className={styles.terminalActions}>
          <button 
            className={styles.playButton}
            onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      {/* Demo tabs */}
      <div className={styles.demoTabs}>
        {demoScenarios.map((scenario, idx) => (
          <button
            key={idx}
            className={clsx(styles.demoTab, activeScenario === idx && styles.active)}
            onClick={() => {
              setActiveScenario(idx);
              setIsPlaying(true);
            }}>
            {scenario.title}
          </button>
        ))}
      </div>

      {/* Demo content */}
      <div className={styles.demoContent}>
        <div className={styles.demoDescription}>
          {currentScenario.description}
        </div>

        {/* Code section */}
        <div className={styles.codeSection}>
          <div className={styles.codeHeader}>
            <span className={styles.codeLabel}>TypeScript</span>
            <div className={styles.codeActions}>
              <button className={styles.codeAction}>
                <CopyIcon />
              </button>
            </div>
          </div>
          <CodeBlock language="typescript" className={styles.codeBlock}>
            {currentScenario.code}
          </CodeBlock>
        </div>

        {/* Console output */}
        <div className={styles.consoleSection}>
          <div className={styles.consoleHeader}>
            <span className={styles.consoleLabel}>Console Output</span>
            <span className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              LIVE
            </span>
          </div>
          <div className={styles.console} ref={consoleRef}>
            {logs.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Click play to see the magic ✨</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={clsx(styles.logLine, styles[log.level])}
                  style={{ animationDelay: `${idx * 0.1}s` }}>
                  <span className={styles.logTime}>{log.time}</span>
                  <span className={styles.logLevel}>{log.level.toUpperCase()}</span>
                  <span className={styles.logIcon}>{log.icon}</span>
                  <span className={styles.logMessage}>{log.message}</span>
                  {log.meta && (
                    <span className={styles.logMeta}>{log.meta}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function ServerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="4" rx="1"/>
      <rect x="4" y="10" width="16" height="4" rx="1"/>
      <rect x="4" y="16" width="16" height="4" rx="1"/>
      <circle cx="7" cy="6" r="1" fill="#00ff88"/>
      <circle cx="7" cy="12" r="1" fill="#00d4ff"/>
      <circle cx="7" cy="18" r="1" fill="#9945ff"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  );
}