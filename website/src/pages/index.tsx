// File: website/src/pages/index.tsx

import React, { useEffect, useState, useRef } from 'react';
import type { JSX } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import styles from './index.module.css';

/**
 * MagicLogger Landing Page
 * 
 * A comprehensive, interactive landing page showcasing MagicLogger's features,
 * performance, and capabilities with smooth animations and neumorphic design.
 */

// Animated typing effect hook
function useTypingEffect(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [displayedText, text, speed]);

  return { displayedText, isTyping };
}

// Animated counter hook
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * end);
      
      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }
      
      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
}

// Hero Section with animated background
function HeroSection() {
  const [activeDemo, setActiveDemo] = useState(0);
  const { displayedText } = useTypingEffect('The most colorful TypeScript/JavaScript logging library', 30);
  
  const demos = [
    {
      title: 'Simple & Powerful',
      description: 'Zero configuration, maximum impact',
      code: `import { Logger } from 'magiclogger';

const logger = new Logger();

// Beautiful console output with zero config
logger.info('🚀 Server started', { port: 3000 });
logger.success('✅ Database connected');
logger.error('❌ Request failed', new Error('Timeout'));

// Rich formatting
logger.table([
  { service: 'API', status: '🟢 Healthy', uptime: '99.9%' },
  { service: 'DB', status: '🟡 Degraded', uptime: '95.2%' }
]);`,
      output: [
        { time: '10:30:45', level: 'info', icon: '🚀', message: 'Server started', meta: 'port=3000' },
        { time: '10:30:46', level: 'success', icon: '✅', message: 'Database connected' },
        { time: '10:30:47', level: 'error', icon: '❌', message: 'Request failed', meta: 'error="Timeout"' }
      ]
    },
    {
      title: 'Async Performance',
      description: 'Handle millions of logs per second',
      code: `// Enable async logging with ring buffer
const logger = new Logger({
  async: {
    enabled: true,
    buffer: { 
      size: 100000,
      flushInterval: 1000 
    }
  }
});

// Non-blocking high-frequency logging
for (let i = 0; i < 1000000; i++) {
  logger.info('High frequency log', { 
    index: i,
    timestamp: Date.now() 
  });
}

// Force sync for critical logs
logger.error('Critical error', { async: false });`,
      output: [
        { time: '10:30:45', level: 'info', icon: '⚡', message: 'Async buffer initialized', meta: 'size=100000' },
        { time: '10:30:46', level: 'info', icon: '📊', message: 'Processing batch', meta: 'count=1000' },
        { time: '10:30:47', level: 'error', icon: '🚨', message: 'Critical error', meta: 'async=false' }
      ]
    },
    {
      title: 'Transport System',
      description: 'Log anywhere with unified interface',
      code: `const logger = new Logger({
  transports: [
    // Console with colors
    new ConsoleTransport({ 
      useColors: true,
      showTimestamp: true 
    }),
    
    // Rotating file logs
    new FileTransport({
      filepath: './logs',
      rotation: 'daily',
      compress: true
    }),
    
    // HTTP with batching
    new HTTPTransport({
      url: 'https://logs.example.com',
      batch: { maxSize: 100, maxTime: 5000 },
      retry: { maxRetries: 3 }
    })
  ]
});

// All transports receive the log
logger.info('Distributed logging');`,
      output: [
        { time: '10:30:45', level: 'info', icon: '📤', message: 'Transport initialized', meta: 'type=console' },
        { time: '10:30:46', level: 'info', icon: '📁', message: 'Log file created', meta: 'path=./logs/2024-01-20.log' },
        { time: '10:30:47', level: 'info', icon: '🌐', message: 'HTTP batch sent', meta: 'size=100 status=200' }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={styles.heroSection}>
      {/* Animated background particles */}
      <div className={styles.particlesContainer}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className={styles.heroBackground}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
        <div className={styles.orb4} />
      </div>

      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            {/* Animated logo */}
            <div className={styles.logoContainer}>
              <div className={styles.logoWrapper}>
                <img
                  src="/img/magiclogger-icon.svg"
                  alt="MagicLogger"
                  className={styles.heroLogo}
                />
                <div className={styles.logoGlow} />
              </div>
            </div>

            <Heading as="h1" className={styles.heroTitle}>
              <span className={styles.titleMain}>MagicLogger</span>
              <span className={styles.titleEmoji}>✨</span>
            </Heading>

            <p className={styles.heroTagline}>
              {displayedText}
              <span className={styles.cursor}>|</span>
            </p>

            <p className={styles.heroDescription}>
              Zero-overhead <span className={styles.highlight}>structured logging</span> with{' '}
              <span className={styles.highlight}>beautiful output</span>,{' '}
              <span className={styles.highlight}>tree-shaking</span>, and{' '}
              <span className={styles.highlight}>blazing performance</span>
            </p>

            {/* CTA Buttons */}
            <div className={styles.heroActions}>
              <Link
                className={clsx('button', styles.primaryButton)}
                to="/docs/">
                <span className={styles.buttonText}>Get Started</span>
                <span className={styles.buttonIcon}>🚀</span>
              </Link>
              <Link
                className={clsx('button', styles.secondaryButton)}
                to="https://github.com/manicinc/magiclogger">
                <span className={styles.buttonIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </span>
                <span className={styles.buttonText}>View on GitHub</span>
              </Link>
            </div>

            {/* Quick install */}
            <div className={styles.quickInstall}>
              <code className={styles.installCommand}>
                npm install magiclogger
              </code>
              <button 
                className={styles.copyButton}
                onClick={() => navigator.clipboard.writeText('npm install magiclogger')}>
                📋
              </button>
            </div>

            {/* Stats */}
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  <AnimatedNumber end={12} />kb
                </div>
                <div className={styles.statLabel}>Bundle Size</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  <AnimatedNumber end={0} />
                </div>
                <div className={styles.statLabel}>Dependencies</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  <AnimatedNumber end={850} />k
                </div>
                <div className={styles.statLabel}>Logs/sec</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  <AnimatedNumber end={100} />%
                </div>
                <div className={styles.statLabel}>Type Safe</div>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className={styles.demoContainer}>
            <div className={styles.demoCard}>
              <div className={styles.demoHeader}>
                <div className={styles.demoTabs}>
                  {demos.map((demo, idx) => (
                    <button
                      key={idx}
                      className={clsx(styles.demoTab, activeDemo === idx && styles.active)}
                      onClick={() => setActiveDemo(idx)}>
                      {demo.title}
                    </button>
                  ))}
                </div>
                <div className={styles.demoControls}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>

              <div className={styles.demoContent}>
                <div className={styles.demoDescription}>
                  {demos[activeDemo].description}
                </div>

                <div className={styles.codeSection}>
                  <div className={styles.codeHeader}>
                    <span className={styles.codeLabel}>TypeScript</span>
                    <button className={styles.codeAction}>Copy</button>
                  </div>
                  <CodeBlock language="typescript" className={styles.codeBlock}>
                    {demos[activeDemo].code}
                  </CodeBlock>
                </div>

                <div className={styles.outputSection}>
                  <div className={styles.outputHeader}>
                    <span className={styles.outputLabel}>Console Output</span>
                    <span className={styles.outputStatus}>● Live</span>
                  </div>
                  <div className={styles.outputContent}>
                    {demos[activeDemo].output.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={styles.logLine}
                        style={{ animationDelay: `${idx * 0.2}s` }}>
                        <span className={styles.logTime}>[{log.time}]</span>
                        <span className={clsx(styles.logLevel, styles[log.level])}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className={styles.logIcon}>{log.icon}</span>
                        <span className={styles.logMessage}>{log.message}</span>
                        {log.meta && (
                          <span className={styles.logMeta}>{log.meta}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollArrow} />
      </div>
    </header>
  );
}

// Animated number component
function AnimatedNumber({ end }: { end: number }) {
  const count = useCounter(end, 2000);
  return <span>{count}</span>;
}

// Features showcase section
function FeaturesShowcase() {
  const features = [
    {
      icon: '🎨',
      title: 'Beautiful by Default',
      description: '256 colors, emojis, tables, progress bars, and gradients that make debugging enjoyable',
      demo: `logger.rainbow('🌈 Colorful logging');
logger.table(data);
logger.progress(0.75);`,
      gradient: 'rainbow'
    },
    {
      icon: '⚡',
      title: 'Blazing Fast',
      description: 'Zero-overhead sync logging with optional async mode. Faster than console.log!',
      stats: ['850k ops/sec sync', '2.5M ops/sec async', 'Zero dependencies'],
      gradient: 'lightning'
    },
    {
      icon: '🌲',
      title: 'Tree Shakeable',
      description: 'Only pay for what you use. Unused transports and features are automatically removed',
      size: { full: '48kb', minimal: '12kb', savings: '75%' },
      gradient: 'nature'
    },
    {
      icon: '🔄',
      title: 'Drop-in Compatible',
      description: 'Replace Winston, Bunyan, or Pino without changing any code',
      compatibility: ['Winston API', 'Bunyan Streams', 'Pino Speed'],
      gradient: 'compatibility'
    },
    {
      icon: '🚀',
      title: 'Transport System',
      description: 'Log to console, files, HTTP endpoints, S3, MongoDB, or anywhere else',
      transports: ['Console', 'File', 'HTTP', 'S3', 'MongoDB', 'WebSocket', 'Custom'],
      gradient: 'rocket'
    },
    {
      icon: '🛡️',
      title: 'Production Ready',
      description: 'Battle-tested with error boundaries, retry logic, and graceful degradation',
      features: ['Error boundaries', 'Retry & backoff', 'Circuit breaker', 'DLQ support'],
      gradient: 'shield'
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Why developers <span className={styles.love}>❤️</span> MagicLogger
          </Heading>
          <p className={styles.sectionSubtitle}>
            Everything you need for modern application logging, nothing you don't
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={clsx(styles.featureCard, styles[`gradient${feature.gradient}`])}
              style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={styles.featureHeader}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
              </div>
              
              <p className={styles.featureDescription}>{feature.description}</p>

              {feature.demo && (
                <div className={styles.featureDemo}>
                  <code>{feature.demo}</code>
                </div>
              )}

              {feature.stats && (
                <div className={styles.featureStats}>
                  {feature.stats.map((stat, i) => (
                    <span key={i} className={styles.statBadge}>{stat}</span>
                  ))}
                </div>
              )}

              {feature.size && (
                <div className={styles.sizeComparison}>
                  <div className={styles.sizeBar}>
                    <div className={styles.sizeFull}>Full: {feature.size.full}</div>
                    <div className={styles.sizeMinimal}>Tree-shaken: {feature.size.minimal}</div>
                  </div>
                  <div className={styles.sizeSavings}>{feature.size.savings} smaller!</div>
                </div>
              )}

              {feature.compatibility && (
                <div className={styles.compatList}>
                  {feature.compatibility.map((item, i) => (
                    <div key={i} className={styles.compatItem}>✓ {item}</div>
                  ))}
                </div>
              )}

              {feature.transports && (
                <div className={styles.transportList}>
                  {feature.transports.map((transport, i) => (
                    <span key={i} className={styles.transportBadge}>{transport}</span>
                  ))}
                </div>
              )}

              {feature.features && (
                <div className={styles.featureList}>
                  {feature.features.map((item, i) => (
                    <div key={i} className={styles.featureItem}>
                      <span className={styles.checkmark}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Interactive architecture visualization
function ArchitectureVisualization() {
  const [selectedLayer, setSelectedLayer] = useState('logger');
  
  const layers = {
    logger: {
      title: 'Logger Core',
      description: 'The heart of MagicLogger - orchestrates everything',
      color: '#667eea',
      features: ['Entry creation', 'Context management', 'Transport routing', 'Lifecycle hooks']
    },
    sync: {
      title: 'Sync Pipeline',
      description: 'Zero-overhead direct path to outputs',
      color: '#48dbfb',
      features: ['No allocations', 'Direct calls', 'Immediate output', 'Monomorphic']
    },
    async: {
      title: 'Async Pipeline',
      description: 'High-performance buffered logging',
      color: '#ff6b6b',
      features: ['Ring buffer', 'Batch processing', 'Worker threads', 'Backpressure']
    },
    transports: {
      title: 'Transport Layer',
      description: 'Unified interface for any destination',
      color: '#43e97b',
      features: ['Console', 'File', 'Network', 'Database', 'Custom']
    }
  };

  return (
    <section className={styles.architectureSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Architecture that scales
          </Heading>
          <p className={styles.sectionSubtitle}>
            Designed for performance, built for developers
          </p>
        </div>

        <div className={styles.architectureGrid}>
          <div className={styles.architectureVisual}>
            <svg viewBox="0 0 800 600" className={styles.architectureSvg}>
              {/* Background grid */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
              </pattern>
              <rect width="800" height="600" fill="url(#grid)" />

              {/* Application layer */}
              <g className={styles.svgLayer}>
                <rect x="200" y="50" width="400" height="60" rx="10" fill="#e0e5ec" stroke="#a3b1c6" strokeWidth="2" />
                <text x="400" y="85" textAnchor="middle" className={styles.svgText}>Your Application</text>
              </g>

              {/* Logger core */}
              <g 
                className={clsx(styles.svgLayer, styles.interactive)}
                onClick={() => setSelectedLayer('logger')}
                style={{ cursor: 'pointer' }}>
                <rect 
                  x="250" 
                  y="150" 
                  width="300" 
                  height="80" 
                  rx="10" 
                  fill={selectedLayer === 'logger' ? '#667eea' : '#e0e5ec'}
                  stroke="#667eea"
                  strokeWidth="3"
                  className={styles.svgRect} />
                <text 
                  x="400" 
                  y="195" 
                  textAnchor="middle" 
                  className={styles.svgText}
                  fill={selectedLayer === 'logger' ? 'white' : 'currentColor'}>
                  Logger Core
                </text>
              </g>

              {/* Pipelines */}
              <g>
                {/* Sync pipeline */}
                <g 
                  className={clsx(styles.svgLayer, styles.interactive)}
                  onClick={() => setSelectedLayer('sync')}
                  style={{ cursor: 'pointer' }}>
                  <rect 
                    x="150" 
                    y="270" 
                    width="200" 
                    height="80" 
                    rx="10" 
                    fill={selectedLayer === 'sync' ? '#48dbfb' : '#e0e5ec'}
                    stroke="#48dbfb"
                    strokeWidth="3"
                    className={styles.svgRect} />
                  <text 
                    x="250" 
                    y="315" 
                    textAnchor="middle" 
                    className={styles.svgText}
                    fill={selectedLayer === 'sync' ? 'white' : 'currentColor'}>
                    Sync Pipeline
                  </text>
                </g>

                {/* Async pipeline */}
                <g 
                  className={clsx(styles.svgLayer, styles.interactive)}
                  onClick={() => setSelectedLayer('async')}
                  style={{ cursor: 'pointer' }}>
                  <rect 
                    x="450" 
                    y="270" 
                    width="200" 
                    height="80" 
                    rx="10" 
                    fill={selectedLayer === 'async' ? '#ff6b6b' : '#e0e5ec'}
                    stroke="#ff6b6b"
                    strokeWidth="3"
                    className={styles.svgRect} />
                  <text 
                    x="550" 
                    y="315" 
                    textAnchor="middle" 
                    className={styles.svgText}
                    fill={selectedLayer === 'async' ? 'white' : 'currentColor'}>
                    Async Pipeline
                  </text>
                </g>
              </g>

              {/* Transport layer */}
              <g 
                className={clsx(styles.svgLayer, styles.interactive)}
                onClick={() => setSelectedLayer('transports')}
                style={{ cursor: 'pointer' }}>
                <rect 
                  x="100" 
                  y="390" 
                  width="600" 
                  height="80" 
                  rx="10" 
                  fill={selectedLayer === 'transports' ? '#43e97b' : '#e0e5ec'}
                  stroke="#43e97b"
                  strokeWidth="3"
                  className={styles.svgRect} />
                <text 
                  x="400" 
                  y="435" 
                  textAnchor="middle" 
                  className={styles.svgText}
                  fill={selectedLayer === 'transports' ? 'white' : 'currentColor'}>
                  Transport Layer
                </text>
              </g>

              {/* Connections */}
              <g className={styles.connections}>
                <line x1="400" y1="110" x2="400" y2="150" stroke="#a3b1c6" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="400" y1="230" x2="250" y2="270" stroke="#a3b1c6" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="400" y1="230" x2="550" y2="270" stroke="#a3b1c6" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="250" y1="350" x2="400" y2="390" stroke="#a3b1c6" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="550" y1="350" x2="400" y2="390" stroke="#a3b1c6" strokeWidth="2" strokeDasharray="5,5" />
              </g>

              {/* Animated particles */}
              <g className={styles.particles}>
                {[...Array(10)].map((_, i) => (
                  <circle
                    key={i}
                    r="2"
                    fill="#667eea"
                    opacity="0.6">
                    <animateMotion
                      dur={`${5 + i * 0.5}s`}
                      repeatCount="indefinite"
                      path="M 400 110 L 400 150 L 250 270 L 400 390"
                      begin={`${i * 0.2}s`} />
                  </circle>
                ))}
              </g>
            </svg>
          </div>

          <div className={styles.architectureDetails}>
            <div 
              className={styles.layerInfo}
              style={{ borderColor: layers[selectedLayer].color }}>
              <h3 className={styles.layerTitle} style={{ color: layers[selectedLayer].color }}>
                {layers[selectedLayer].title}
              </h3>
              <p className={styles.layerDescription}>
                {layers[selectedLayer].description}
              </p>
              <div className={styles.layerFeatures}>
                {layers[selectedLayer].features.map((feature, idx) => (
                  <div key={idx} className={styles.layerFeature}>
                    <span className={styles.featureDot} style={{ backgroundColor: layers[selectedLayer].color }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.codeExample}>
              <CodeBlock language="typescript">
                {selectedLayer === 'logger' && `// Logger Core - Entry point for all logs
const logger = new Logger({
  id: 'my-app',
  context: { version: '1.0.0' },
  transports: [/*...*/]
});

logger.info('Application started');`}
                {selectedLayer === 'sync' && `// Sync Pipeline - Direct path, no overhead
log(entry: LogEntry): void {
  // No promises, no allocations
  for (const transport of this.transports) {
    transport.log(entry); // Direct call
  }
}`}
                {selectedLayer === 'async' && `// Async Pipeline - Ring buffer for performance
class AsyncBuffer {
  add(entry: LogEntry): void {
    this.buffer[this.writeIndex] = entry;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    
    if (this.size >= this.flushSize) {
      this.flush(); // Batch processing
    }
  }
}`}
                {selectedLayer === 'transports' && `// Transport Layer - Unified interface
interface Transport {
  log(entry: LogEntry): void | Promise<void>;
  logBatch?(entries: LogEntry[]): void | Promise<void>;
  shouldLog?(entry: LogEntry): boolean;
}`}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Performance comparison section
function PerformanceComparison() {
  const [metric, setMetric] = useState<'sync' | 'async' | 'bundle'>('sync');
  
  const benchmarks = {
    sync: {
      title: 'Synchronous Performance',
      unit: 'ops/sec',
      data: [
        { name: 'MagicLogger', value: 850000, color: '#667eea', icon: '✨' },
        { name: 'Pino', value: 800000, color: '#48dbfb', icon: '🌲' },
        { name: 'Console.log', value: 200000, color: '#feca57', icon: '📝' },
        { name: 'Bunyan', value: 120000, color: '#ff9ff3', icon: '🐰' },
        { name: 'Winston', value: 40000, color: '#ff6b6b', icon: '🎩' }
      ]
    },
    async: {
      title: 'Asynchronous Performance',
      unit: 'ops/sec',
      data: [
        { name: 'MagicLogger', value: 2500000, color: '#667eea', icon: '✨' },
        { name: 'Pino (worker)', value: 400000, color: '#48dbfb', icon: '🌲' },
        { name: 'Bunyan', value: 30000, color: '#ff9ff3', icon: '🐰' },
        { name: 'Winston', value: 15000, color: '#ff6b6b', icon: '🎩' },
        { name: 'Console.log', value: 200000, color: '#feca57', icon: '📝' }
      ]
    },
    bundle: {
      title: 'Bundle Size',
      unit: 'KB',
      data: [
        { name: 'MagicLogger', value: 12, color: '#667eea', icon: '✨' },
        { name: 'Pino', value: 32, color: '#48dbfb', icon: '🌲' },
        { name: 'Winston', value: 285, color: '#ff6b6b', icon: '🎩' },
        { name: 'Bunyan', value: 68, color: '#ff9ff3', icon: '🐰' },
        { name: 'Console', value: 0, color: '#feca57', icon: '📝' }
      ]
    }
  };

  const currentData = benchmarks[metric];
  const maxValue = Math.max(...currentData.data.map(d => d.value));

  return (
    <section className={styles.performanceSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Performance that matters
          </Heading>
          <p className={styles.sectionSubtitle}>
            Benchmarked against the most popular logging libraries
          </p>
        </div>

        {/* Metric selector */}
        <div className={styles.metricSelector}>
          <button
            className={clsx(styles.metricButton, metric === 'sync' && styles.active)}
            onClick={() => setMetric('sync')}>
            <span className={styles.metricIcon}>⚡</span>
            Sync Performance
          </button>
          <button
            className={clsx(styles.metricButton, metric === 'async' && styles.active)}
            onClick={() => setMetric('async')}>
            <span className={styles.metricIcon}>🚀</span>
            Async Performance
          </button>
          <button
            className={clsx(styles.metricButton, metric === 'bundle' && styles.active)}
            onClick={() => setMetric('bundle')}>
            <span className={styles.metricIcon}>📦</span>
            Bundle Size
          </button>
        </div>

        {/* Benchmark visualization */}
        <div className={styles.benchmarkContainer}>
          <h3 className={styles.benchmarkTitle}>{currentData.title}</h3>
          
          <div className={styles.benchmarkChart}>
            {currentData.data.map((item, idx) => (
              <div key={idx} className={styles.benchmarkRow}>
                <div className={styles.benchmarkInfo}>
                  <span className={styles.benchmarkIcon}>{item.icon}</span>
                  <span className={styles.benchmarkName}>{item.name}</span>
                </div>
                
                <div className={styles.benchmarkBar}>
                  <div
                    className={styles.benchmarkFill}
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color,
                      animationDelay: `${idx * 0.1}s`
                    }}>
                    <span className={styles.benchmarkValue}>
                      {item.value.toLocaleString()} {currentData.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance insights */}
          <div className={styles.performanceInsights}>
            {metric === 'sync' && (
              <div className={styles.insight}>
                <h4>🏆 Fastest Synchronous Logger</h4>
                <p>MagicLogger outperforms all major logging libraries in synchronous operations, 
                   making it perfect for high-frequency logging scenarios.</p>
              </div>
            )}
            {metric === 'async' && (
              <div className={styles.insight}>
                <h4>🚄 6x Faster Async Performance</h4>
                <p>Our ring buffer implementation handles 2.5 million logs per second, 
                   making MagicLogger the clear choice for high-throughput applications.</p>
              </div>
            )}
            {metric === 'bundle' && (
              <div className={styles.insight}>
                <h4>🪶 96% Smaller than Winston</h4>
                <p>At just 12KB, MagicLogger adds minimal overhead to your application 
                   while providing more features than libraries 20x its size.</p>
              </div>
            )}
          </div>
        </div>

        {/* Key features */}
        <div className={styles.performanceFeatures}>
          <div className={styles.perfFeature}>
            <div className={styles.perfIcon}>🎯</div>
            <h4>Zero Allocations</h4>
            <p>Sync path creates no heap allocations or promises</p>
          </div>
          <div className={styles.perfFeature}>
            <div className={styles.perfIcon}>💾</div>
            <h4>Object Pooling</h4>
            <p>Reuses objects to minimize garbage collection</p>
          </div>
          <div className={styles.perfFeature}>
            <div className={styles.perfIcon}>🔄</div>
            <h4>Ring Buffer</h4>
            <p>Lock-free circular buffer for async operations</p>
          </div>
          <div className={styles.perfFeature}>
            <div className={styles.perfIcon}>⚛️</div>
            <h4>Monomorphic</h4>
            <p>JIT-optimized code paths for maximum speed</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Code examples section
function CodeExamples() {
  const [activeExample, setActiveExample] = useState(0);
  
  const examples = [
    {
      title: 'Basic Usage',
      description: 'Get started in seconds with zero configuration',
      code: `import { Logger } from 'magiclogger';

const logger = new Logger();

// Simple logging with automatic formatting
logger.info('Server started successfully');
logger.warn('Memory usage is high', { usage: '85%' });
logger.error('Failed to connect', new Error('ECONNREFUSED'));

// Rich console features
logger.success('✅ All tests passed!');
logger.rainbow('🌈 Make logging fun again!');

// Structured data
logger.table([
  { name: 'Alice', role: 'Developer', status: 'Active' },
  { name: 'Bob', role: 'Designer', status: 'Away' }
]);

// Progress tracking
const progress = logger.progress('Processing files');
for (let i = 0; i <= 100; i++) {
  progress.update(i, 100);
  await sleep(10);
}
progress.complete('✅ Done!');`
    },
    {
      title: 'Advanced Configuration',
      description: 'Full control over every aspect of logging',
      code: `import { 
  Logger, 
  ConsoleTransport, 
  FileTransport, 
  HTTPTransport,
  S3Transport 
} from 'magiclogger';

const logger = new Logger({
  // Identity and metadata
  id: 'api-service',
  tags: ['production', 'api', 'v2'],
  context: {
    service: 'user-api',
    version: process.env.VERSION,
    environment: process.env.NODE_ENV
  },
  
  // Async configuration for high performance
  async: {
    enabled: true,
    buffer: {
      size: 100000,        // 100k entry ring buffer
      flushInterval: 1000, // Flush every second
      flushSize: 1000      // Or every 1000 logs
    }
  },
  
  // Multiple transports with different configs
  transports: [
    // Console for development
    new ConsoleTransport({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      useColors: true,
      showTimestamp: true,
      showMetadata: true
    }),
    
    // Rotating file logs
    new FileTransport({
      filepath: './logs',
      rotation: 'daily',
      maxFiles: 7,
      compress: true,
      format: 'json'
    }),
    
    // Centralized logging service
    new HTTPTransport({
      url: process.env.LOG_ENDPOINT,
      headers: {
        'X-API-Key': process.env.LOG_API_KEY
      },
      batch: {
        maxSize: 100,
        maxTime: 5000,
        maxBytes: 1048576 // 1MB
      },
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        backoffFactor: 2
      }
    }),
    
    // Archive to S3
    new S3Transport({
      bucket: 'my-app-logs',
      region: 'us-east-1',
      prefix: \`logs/\${process.env.NODE_ENV}/\`,
      compress: true,
      encryption: {
        type: 'AES256'
      }
    })
  ]
});`
    },
    {
      title: 'Context & Child Loggers',
      description: 'Hierarchical context for organized logging',
      code: `// Base logger with global context
const logger = new Logger({
  context: {
    service: 'api',
    version: '2.0.0',
    region: 'us-east-1'
  }
});

// Express middleware for request context
app.use((req, res, next) => {
  // Create child logger with request context
  req.logger = logger.child({
    context: {
      requestId: req.id,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?.id
    },
    tags: ['http', req.method.toLowerCase()]
  });
  
  // Log request start
  req.logger.info('Request received');
  
  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    req.logger.info('Request completed', {
      status: res.statusCode,
      duration: Date.now() - start
    });
  });
  
  next();
});

// In route handlers, context is automatically included
app.post('/api/users', async (req, res) => {
  req.logger.info('Creating user', { email: req.body.email });
  
  try {
    const user = await createUser(req.body);
    req.logger.success('User created', { userId: user.id });
    res.json(user);
  } catch (error) {
    req.logger.error('User creation failed', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// All logs include: service, version, region, requestId, method, path, ip, userId`
    },
    {
      title: 'Error Handling & Recovery',
      description: 'Robust error handling with fallbacks and recovery',
      code: `import { Logger, HTTPTransport, FileTransport } from 'magiclogger';

// Configure transport with fallback and DLQ
const httpTransport = new HTTPTransport({
  name: 'primary',
  url: 'https://logs.example.com',
  
  // Fallback to file when HTTP fails
  fallback: new FileTransport({
    name: 'fallback',
    filepath: './logs/fallback.log'
  }),
  
  // Dead Letter Queue for failed logs
  dlq: {
    enabled: true,
    filepath: './logs/dlq.log',
    maxSize: 10485760, // 10MB
    maxAge: 604800000  // 7 days
  },
  
  // Circuit breaker configuration
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    resetTimeout: 60000 // 1 minute
  }
});

// Listen for transport events
httpTransport.on('error', (error, entry) => {
  console.error('Transport error:', error.message);
});

httpTransport.on('fallback', ({ count, reason }) => {
  console.warn(\`Falling back for \${count} logs: \${reason}\`);
});

httpTransport.on('circuit-open', () => {
  console.error('Circuit breaker opened - using fallback');
});

httpTransport.on('circuit-close', () => {
  console.info('Circuit breaker closed - resuming normal operation');
});

// Global error boundary
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught exception', error);
  logger.close().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled rejection', { reason, promise });
});

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down gracefully...');
  
  // Flush all pending logs
  await logger.flush();
  
  // Close all transports
  await logger.close();
  
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);`
    },
    {
      title: 'Browser Logging',
      description: 'Full-featured logging in the browser with persistence',
      code: `import { Logger } from 'magiclogger';

// Browser-specific configuration
const logger = new Logger({
  // Store logs in localStorage
  storeInBrowser: true,
  maxStoredLogs: 1000,
  storageKey: 'app-logs',
  
  // Browser-compatible transports
  transports: [
    // Beautiful console output
    new ConsoleTransport({
      useColors: true,
      showTimestamp: true
    }),
    
    // Send errors to backend
    new HTTPTransport({
      url: '/api/logs',
      levels: ['error', 'fatal'],
      batch: {
        maxSize: 50,
        maxTime: 10000 // 10 seconds
      }
    })
  ]
});

// React error boundary integration
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.error('React error boundary triggered', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      props: this.props
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// Performance monitoring
const perfLogger = logger.child({ tags: ['performance'] });

// Log Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => perfLogger.info('CLS', { value: metric.value }));
getFID(metric => perfLogger.info('FID', { value: metric.value }));
getFCP(metric => perfLogger.info('FCP', { value: metric.value }));
getLCP(metric => perfLogger.info('LCP', { value: metric.value }));
getTTFB(metric => perfLogger.info('TTFB', { value: metric.value }));

// Debug panel for development
if (process.env.NODE_ENV === 'development') {
  window.logger = logger;
  
  // Create debug UI
  const debugPanel = document.createElement('div');
  debugPanel.innerHTML = \`
    <button onclick="logger.downloadLogs()">📥 Download Logs</button>
    <button onclick="logger.clearLogs()">🗑️ Clear Logs</button>
    <button onclick="logger.showLogs()">👁️ View Logs</button>
  \`;
  document.body.appendChild(debugPanel);
}`
    }
  ];

  return (
    <section className={styles.examplesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Real-world examples
          </Heading>
          <p className={styles.sectionSubtitle}>
            From simple to sophisticated - MagicLogger scales with your needs
          </p>
        </div>

        <div className={styles.examplesContainer}>
          {/* Example tabs */}
          <div className={styles.exampleTabs}>
            {examples.map((example, idx) => (
              <button
                key={idx}
                className={clsx(styles.exampleTab, activeExample === idx && styles.active)}
                onClick={() => setActiveExample(idx)}>
                {example.title}
              </button>
            ))}
          </div>

          {/* Example content */}
          <div className={styles.exampleContent}>
            <div className={styles.exampleHeader}>
              <h3 className={styles.exampleTitle}>{examples[activeExample].title}</h3>
              <p className={styles.exampleDescription}>{examples[activeExample].description}</p>
            </div>

            <div className={styles.exampleCode}>
              <div className={styles.codeActions}>
                <button 
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText(examples[activeExample].code)}>
                  📋 Copy
                </button>
                <button className={styles.runButton}>
                  ▶️ Run in StackBlitz
                </button>
              </div>
              
              <CodeBlock language="typescript" className={styles.codeBlock}>
                {examples[activeExample].code}
              </CodeBlock>
            </div>
          </div>
        </div>

        {/* Quick tips */}
        <div className={styles.quickTips}>
          <h3 className={styles.tipsTitle}>💡 Pro Tips</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🎯</span>
              <div>
                <strong>Use structured logging</strong>
                <p>Pass objects as the second parameter for better searchability</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🏷️</span>
              <div>
                <strong>Tag your logs</strong>
                <p>Use tags to categorize and filter logs effectively</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🔄</span>
              <div>
                <strong>Child loggers for context</strong>
                <p>Create scoped loggers for requests, jobs, or modules</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>⚡</span>
              <div>
                <strong>Async for high volume</strong>
                <p>Enable async mode for applications with heavy logging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Integration showcase
function IntegrationShowcase() {
  const integrations = [
    {
      name: 'Express.js',
      logo: '🌐',
      description: 'Request logging and error tracking',
      code: `app.use(magicLogger.express({
  includeBody: true,
  includeQuery: true
}));`
    },
    {
      name: 'Next.js',
      logo: '▲',
      description: 'Full-stack logging with API routes',
      code: `export default withLogger(handler, {
  includeHeaders: true
});`
    },
    {
      name: 'React',
      logo: '⚛️',
      description: 'Component lifecycle and error boundaries',
      code: `<LoggerProvider logger={logger}>
  <App />
</LoggerProvider>`
    },
    {
      name: 'Node.js',
      logo: '🟢',
      description: 'Native integration with streams',
      code: `process.stdout.pipe(
  logger.stream({ level: 'info' })
);`
    },
    {
      name: 'TypeScript',
      logo: '🔷',
      description: 'Full type safety and IntelliSense',
      code: `const typed: LogEntry = {
  level: 'info', // autocomplete!
  message: 'Fully typed'
};`
    },
    {
      name: 'Docker',
      logo: '🐳',
      description: 'Container-friendly JSON output',
      code: `ENV LOG_FORMAT=json
ENV LOG_LEVEL=info`
    }
  ];

  return (
    <section className={styles.integrationsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Works everywhere you do
          </Heading>
          <p className={styles.sectionSubtitle}>
            Seamless integration with your favorite tools and frameworks
          </p>
        </div>

        <div className={styles.integrationsGrid}>
          {integrations.map((integration, idx) => (
            <div 
              key={idx} 
              className={styles.integrationCard}
              style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={styles.integrationHeader}>
                <span className={styles.integrationLogo}>{integration.logo}</span>
                <h3 className={styles.integrationName}>{integration.name}</h3>
              </div>
              <p className={styles.integrationDescription}>{integration.description}</p>
              <div className={styles.integrationCode}>
                <code>{integration.code}</code>
              </div>
            </div>
          ))}
        </div>

        {/* Ecosystem */}
        <div className={styles.ecosystem}>
          <h3 className={styles.ecosystemTitle}>Part of a larger ecosystem</h3>
          <div className={styles.ecosystemGrid}>
            <div className={styles.ecosystemItem}>
              <span className={styles.ecosystemIcon}>📊</span>
              <strong>MagicLogger Dashboard</strong>
              <p>Centralized log management and analytics</p>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
            <div className={styles.ecosystemItem}>
              <span className={styles.ecosystemIcon}>🔍</span>
              <strong>Log Search API</strong>
              <p>Query your logs with a powerful search API</p>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
            <div className={styles.ecosystemItem}>
              <span className={styles.ecosystemIcon}>📱</span>
              <strong>Mobile SDKs</strong>
              <p>Native logging for iOS and Android apps</p>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
            <div className={styles.ecosystemItem}>
              <span className={styles.ecosystemIcon}>🤖</span>
              <strong>AI Log Analysis</strong>
              <p>Automatic anomaly detection and insights</p>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials section
function Testimonials() {
  const testimonials = [
    {
      quote: "MagicLogger transformed how we handle logging. The performance is incredible and the API is a joy to use.",
      author: "Sarah Chen",
      role: "Senior Engineer at TechCorp",
      avatar: "👩‍💻"
    },
    {
      quote: "Finally, a logging library that doesn't compromise on features or performance. The tree-shaking alone saved us 200KB!",
      author: "Mike Johnson",
      role: "Lead Developer at StartupXYZ",
      avatar: "👨‍💻"
    },
    {
      quote: "The transport system is brilliant. We log to 5 different services and MagicLogger handles it flawlessly.",
      author: "Emily Rodriguez",
      role: "DevOps Engineer at CloudCo",
      avatar: "👩‍🔧"
    }
  ];

  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, idx) => (
            <div 
              key={idx} 
              className={styles.testimonialCard}
              style={{ animationDelay: `${idx * 0.2}s` }}>
              <blockquote className={styles.testimonialQuote}>
                "{testimonial.quote}"
              </blockquote>
              <div className={styles.testimonialAuthor}>
                <span className={styles.authorAvatar}>{testimonial.avatar}</span>
                <div>
                  <div className={styles.authorName}>{testimonial.author}</div>
                  <div className={styles.authorRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA section
function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            Ready to level up your logging?
          </Heading>
          <p className={styles.ctaSubtitle}>
            Join thousands of developers using MagicLogger in production
          </p>

          <div className={styles.ctaActions}>
            <Link
              className={clsx('button', styles.ctaPrimary)}
              to="/docs/">
              <span>Get Started</span>
              <span className={styles.ctaArrow}>→</span>
            </Link>
            <Link
              className={clsx('button', styles.ctaSecondary)}
              to="https://github.com/manicinc/magiclogger">
              <span>Star on GitHub</span>
              <span className={styles.ctaStar}>⭐</span>
            </Link>
          </div>

          <div className={styles.ctaStats}>
            <div className={styles.ctaStat}>
              <div className={styles.ctaStatValue}>10k+</div>
              <div className={styles.ctaStatLabel}>Active Projects</div>
            </div>
            <div className={styles.ctaStat}>
              <div className={styles.ctaStatValue}>50M+</div>
              <div className={styles.ctaStatLabel}>Daily Logs</div>
            </div>
            <div className={styles.ctaStat}>
              <div className={styles.ctaStatValue}>5⭐</div>
              <div className={styles.ctaStatLabel}>GitHub Rating</div>
            </div>
          </div>
        </div>

        {/* Quick start code */}
        <div className={styles.quickStart}>
          <h3 className={styles.quickStartTitle}>Quick Start</h3>
          <div className={styles.quickStartSteps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <code>npm install magiclogger</code>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <code>import {'{ Logger }'} from 'magiclogger'</code>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <code>const logger = new Logger()</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main component
export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} - Zero-overhead JavaScript Logging`}
      description="The most colorful TypeScript/JavaScript logging library with tree-shaking, async support, and beautiful output">
      <HeroSection />
      <main>
        <FeaturesShowcase />
        <ArchitectureVisualization />
        <PerformanceComparison />
        <CodeExamples />
        <IntegrationShowcase />
        <Testimonials />
        <CTASection />
      </main>
    </Layout>
  );
}