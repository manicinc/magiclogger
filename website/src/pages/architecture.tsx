// File: website/src/pages/architecture.tsx

import React, { useState } from 'react';
import type { JSX } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import Link from '@docusaurus/Link';
import styles from './architecture.module.css';

/**
 * MagicLogger Architecture Page
 * 
 * Deep dive into the architecture, design principles, and implementation details
 * of MagicLogger with interactive diagrams and code examples.
 */

// Architecture Overview Section
function OverviewSection() {
  return (
    <section className={styles.overviewSection}>
      <div className="container">
        <div className={styles.overviewContent}>
          <div className={styles.overviewText}>
            <Heading as="h1" className={styles.pageTitle}>
              <span className={styles.gradientText}>Architecture</span>
            </Heading>
            <p className={styles.pageSubtitle}>
              MagicLogger is built on four foundational pillars that work together
              to deliver unmatched performance and developer experience.
            </p>
            
            <div className={styles.pillarsGrid}>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>🎯</div>
                <h3 className={styles.pillarTitle}>Zero-Cost Abstractions</h3>
                <p className={styles.pillarDescription}>
                  No heap allocations, no promises, direct call paths
                </p>
              </div>
              
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>📦</div>
                <h3 className={styles.pillarTitle}>Progressive Enhancement</h3>
                <p className={styles.pillarDescription}>
                  Features are opt-in and tree-shakeable
                </p>
              </div>
              
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>🔌</div>
                <h3 className={styles.pillarTitle}>Transport Agnosticism</h3>
                <p className={styles.pillarDescription}>
                  Unified interface for any destination
                </p>
              </div>
              
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>🤝</div>
                <h3 className={styles.pillarTitle}>Compatibility</h3>
                <p className={styles.pillarDescription}>
                  Drop-in replacement for popular loggers
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.overviewDiagram}>
            <div className={styles.diagramCard}>
              <svg viewBox="0 0 600 400" className={styles.architectureSvg}>
                {/* Application Layer */}
                <rect x="100" y="20" width="400" height="50" rx="8" className={styles.layerApp} />
                <text x="300" y="50" className={styles.layerText}>Application Layer</text>
                
                {/* Compatibility Layer */}
                <rect x="150" y="90" width="300" height="40" rx="8" className={styles.layerCompat} />
                <text x="300" y="115" className={styles.layerTextSmall}>Compatibility (Optional)</text>
                
                {/* Core Logger */}
                <rect x="200" y="150" width="200" height="60" rx="8" className={styles.layerCore} />
                <text x="300" y="185" className={styles.layerText}>Logger Core</text>
                
                {/* Processing Layers */}
                <rect x="100" y="230" width="180" height="60" rx="8" className={styles.layerSync} />
                <text x="190" y="265" className={styles.layerText}>Sync Pipeline</text>
                
                <rect x="320" y="230" width="180" height="60" rx="8" className={styles.layerAsync} />
                <text x="410" y="265" className={styles.layerText}>Async Pipeline</text>
                
                {/* Transport Layer */}
                <rect x="50" y="310" width="500" height="60" rx="8" className={styles.layerTransport} />
                <text x="300" y="345" className={styles.layerText}>Transport Layer</text>
                
                {/* Connections */}
                <line x1="300" y1="70" x2="300" y2="90" className={styles.connectionLine} />
                <line x1="300" y1="130" x2="300" y2="150" className={styles.connectionLine} />
                <line x1="300" y1="210" x2="190" y2="230" className={styles.connectionLine} />
                <line x1="300" y1="210" x2="410" y2="230" className={styles.connectionLine} />
                <line x1="190" y1="290" x2="300" y2="310" className={styles.connectionLine} />
                <line x1="410" y1="290" x2="300" y2="310" className={styles.connectionLine} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Core Components Section
function CoreComponentsSection() {
  const [activeComponent, setActiveComponent] = useState('logger');
  
  const components = {
    logger: {
      title: 'Logger Class',
      description: 'The main orchestration point that manages the entire logging lifecycle',
      features: [
        'Entry creation and routing',
        'Transport management',
        'Context and tag handling',
        'Lifecycle management'
      ],
      code: `class Logger {
  private readonly id: string;
  private readonly transports: Transport[];
  private readonly contextManager: ContextManager;
  private readonly tagManager: TagManager;
  private asyncBuffer?: AsyncBuffer;
  
  constructor(options: LoggerOptions = {}) {
    this.id = options.id || this.generateId();
    this.contextManager = new ContextManager(options.context);
    this.tagManager = new TagManager(options.tags);
    this.transports = this.initializeTransports(options.transports);
    
    if (options.async?.enabled) {
      this.asyncBuffer = new AsyncBuffer({
        size: options.async.bufferSize || 10000,
        onFlush: entries => this.flushEntries(entries)
      });
    }
  }
  
  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }
  
  private log(level: LogLevel, message: string, meta?: any): void {
    const entry = this.createEntry(level, message, meta);
    
    if (this.asyncBuffer && meta?.async !== false) {
      this.asyncBuffer.add(entry);
    } else {
      this.dispatchSync(entry);
    }
  }
}`
    },
    entry: {
      title: 'LogEntry Structure',
      description: 'The canonical format for all log data flowing through the system',
      features: [
        'Unique identification',
        'Timestamp precision',
        'Structured metadata',
        'Error serialization'
      ],
      code: `interface LogEntry {
  // Identity
  id: string;              // Unique identifier
  timestamp: string;       // ISO 8601 timestamp
  timestampMs: number;     // Unix milliseconds
  
  // Core content
  level: LogLevel;         // Severity level
  message: string;         // Formatted message
  plainMessage?: string;   // Message without ANSI
  
  // Metadata
  loggerId?: string;       // Logger instance ID
  tags?: string[];         // Categorization tags
  context?: Record<string, any>;  // Structured context
  
  // Error details
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    cause?: any;
  };
  
  // Environment
  metadata?: {
    hostname?: string;
    pid?: number;
    platform?: string;
    version?: string;
  };
}`
    },
    context: {
      title: 'Context Management',
      description: 'Hierarchical context merging for rich, structured logging',
      features: [
        'Global context inheritance',
        'Request-scoped contexts',
        'Efficient merging',
        'Key minification'
      ],
      code: `class ContextManager {
  private globalContext: Record<string, any>;
  
  merge(...contexts: Array<Record<string, any> | undefined>): Record<string, any> {
    // Efficient merging without intermediate objects
    const result = Object.create(null);
    
    // Global context first
    for (const key in this.globalContext) {
      result[key] = this.globalContext[key];
    }
    
    // Merge additional contexts (right-to-left precedence)
    for (const context of contexts) {
      if (!context) continue;
      for (const key in context) {
        result[key] = context[key];
      }
    }
    
    return result;
  }
  
  // Minification for efficiency (Hatchet-ready)
  minify(context: Record<string, any>): Record<string, any> {
    const minified: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      const minKey = this.minificationRules[key] || key;
      minified[minKey] = value;
    }
    
    return minified;
  }
}`
    },
    transport: {
      title: 'Transport Interface',
      description: 'Minimal interface for maximum flexibility in log destinations',
      features: [
        'Lifecycle hooks',
        'Optional batching',
        'Built-in filtering',
        'Event emission'
      ],
      code: `interface Transport {
  // Required
  name: string;
  log(entry: LogEntry): void | Promise<void>;
  
  // Optional lifecycle
  init?(): void | Promise<void>;
  close?(): void | Promise<void>;
  flush?(): void | Promise<void>;
  
  // Optional batching
  logBatch?(entries: LogEntry[]): void | Promise<void>;
  
  // Optional filtering
  shouldLog?(entry: LogEntry): boolean;
}

// Example implementation
class ConsoleTransport implements Transport {
  name = 'console';
  
  constructor(private options: ConsoleOptions) {}
  
  log(entry: LogEntry): void {
    const formatted = this.format(entry);
    console.log(formatted);
  }
  
  private format(entry: LogEntry): string {
    if (this.options.useColors) {
      return this.colorize(entry);
    }
    return this.plain(entry);
  }
}`
    }
  };
  
  return (
    <section className={styles.componentsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Core Components
          </Heading>
          <p className={styles.sectionSubtitle}>
            The building blocks that power MagicLogger
          </p>
        </div>
        
        <div className={styles.componentsLayout}>
          <div className={styles.componentNav}>
            {Object.entries(components).map(([key, component]) => (
              <button
                key={key}
                className={clsx(
                  styles.componentNavItem,
                  activeComponent === key && styles.active
                )}
                onClick={() => setActiveComponent(key)}
              >
                <span className={styles.componentNavTitle}>{component.title}</span>
                <span className={styles.componentNavArrow}>→</span>
              </button>
            ))}
          </div>
          
          <div className={styles.componentDetails}>
            <div className={styles.componentCard}>
              <h3 className={styles.componentTitle}>
                {components[activeComponent].title}
              </h3>
              <p className={styles.componentDescription}>
                {components[activeComponent].description}
              </p>
              
              <div className={styles.componentFeatures}>
                <h4 className={styles.featuresTitle}>Key Features:</h4>
                <ul className={styles.featuresList}>
                  {components[activeComponent].features.map((feature, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      <span className={styles.featureBullet}>▸</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.componentCode}>
                <CodeBlock language="typescript">
                  {components[activeComponent].code}
                </CodeBlock>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Performance Architecture Section
function PerformanceSection() {
  return (
    <section className={styles.performanceSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Performance Architecture
          </Heading>
          <p className={styles.sectionSubtitle}>
            How MagicLogger achieves 164K+ ops/sec
          </p>
        </div>
        
        <div className={styles.performanceGrid}>
          <div className={styles.perfCard}>
            <div className={styles.perfIcon}>💾</div>
            <h3 className={styles.perfTitle}>Memory Management</h3>
            <p className={styles.perfDescription}>
              Object pooling, ring buffers, and string interning minimize allocations
            </p>
            <CodeBlock language="typescript">
{`class LogEntryPool {
  private pool: LogEntry[] = [];
  private maxSize = 1000;
  
  acquire(): LogEntry {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createNew();
  }
  
  release(entry: LogEntry): void {
    if (this.pool.length < this.maxSize) {
      this.reset(entry);
      this.pool.push(entry);
    }
  }
}`}
            </CodeBlock>
          </div>
          
          <div className={styles.perfCard}>
            <div className={styles.perfIcon}>🔄</div>
            <h3 className={styles.perfTitle}>Ring Buffer</h3>
            <p className={styles.perfDescription}>
              Lock-free circular buffer for async logging without blocking
            </p>
            <CodeBlock language="typescript">
{`class RingBuffer<T> {
  private buffer: Array<T | undefined>;
  private writePos = 0;
  private readPos = 0;
  
  push(item: T): boolean {
    if (this.size === this.capacity) {
      // Overwrite oldest
      this.readPos = (this.readPos + 1) % this.capacity;
    }
    
    this.buffer[this.writePos] = item;
    this.writePos = (this.writePos + 1) % this.capacity;
    return true;
  }
}`}
            </CodeBlock>
          </div>
          
          <div className={styles.perfCard}>
            <div className={styles.perfIcon}>⚡</div>
            <h3 className={styles.perfTitle}>Monomorphic Functions</h3>
            <p className={styles.perfDescription}>
              JIT-optimized code paths with consistent object shapes
            </p>
            <CodeBlock language="typescript">
{`// ❌ Polymorphic - slow
function format(entry: LogEntry | string | Error) {
  if (typeof entry === 'string') return entry;
  if (entry instanceof Error) return entry.message;
  return JSON.stringify(entry);
}

// ✅ Monomorphic - fast
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function formatString(str: string): string {
  return str;
}`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

// Transport System Section
function TransportSystemSection() {
  const [activeTransport, setActiveTransport] = useState('console');
  
  const transports = {
    console: {
      name: 'Console Transport',
      icon: '🖥️',
      description: 'High-performance console output with color support',
      features: ['ANSI colors', 'Format customization', 'Browser/Node compatible'],
      example: `new ConsoleTransport({
  level: 'debug',
  useColors: true,
  showTimestamp: true,
  prefix: 'APP'
})`
    },
    file: {
      name: 'File Transport',
      icon: '📁',
      description: 'Rotating file logs with compression and retention',
      features: ['Log rotation', 'Gzip compression', 'Atomic writes'],
      example: `new FileTransport({
  filepath: './logs',
  rotation: 'daily',
  maxFiles: 7,
  compress: true
})`
    },
    http: {
      name: 'HTTP Transport',
      icon: '🌐',
      description: 'Batched HTTP/HTTPS with retry and circuit breaker',
      features: ['Smart batching', 'Exponential backoff', 'Request compression'],
      example: `new HTTPTransport({
  url: 'https://logs.example.com',
  batch: { maxSize: 100, maxTime: 5000 },
  retry: { maxRetries: 3 },
  compress: true
})`
    },
    s3: {
      name: 'S3 Transport',
      icon: '☁️',
      description: 'Direct S3 uploads with intelligent partitioning',
      features: ['Date partitioning', 'Encryption', 'Lifecycle policies'],
      example: `new S3Transport({
  bucket: 'my-logs',
  keyStrategy: 'date-hierarchy',
  compress: true,
  encryption: { type: 'AES256' }
})`
    }
  };
  
  return (
    <section className={styles.transportSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Transport System
          </Heading>
          <p className={styles.sectionSubtitle}>
            Send logs anywhere with a unified interface
          </p>
        </div>
        
        <div className={styles.transportGrid}>
          <div className={styles.transportList}>
            {Object.entries(transports).map(([key, transport]) => (
              <div
                key={key}
                className={clsx(
                  styles.transportItem,
                  activeTransport === key && styles.active
                )}
                onClick={() => setActiveTransport(key)}
              >
                <span className={styles.transportIcon}>{transport.icon}</span>
                <span className={styles.transportName}>{transport.name}</span>
              </div>
            ))}
          </div>
          
          <div className={styles.transportDetails}>
            <div className={styles.transportCard}>
              <div className={styles.transportHeader}>
                <span className={styles.transportDetailIcon}>
                  {transports[activeTransport].icon}
                </span>
                <h3 className={styles.transportTitle}>
                  {transports[activeTransport].name}
                </h3>
              </div>
              
              <p className={styles.transportDescription}>
                {transports[activeTransport].description}
              </p>
              
              <div className={styles.transportFeatures}>
                {transports[activeTransport].features.map((feature, idx) => (
                  <div key={idx} className={styles.transportFeature}>
                    <span className={styles.featureCheck}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className={styles.transportExample}>
                <h4 className={styles.exampleTitle}>Example Usage:</h4>
                <CodeBlock language="typescript">
                  {transports[activeTransport].example}
                </CodeBlock>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.transportFlow}>
          <h3 className={styles.flowTitle}>Transport Data Flow</h3>
          <div className={styles.flowDiagram}>
            <div className={styles.flowStep}>
              <div className={styles.flowIcon}>📝</div>
              <div className={styles.flowLabel}>Log Entry</div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowIcon}>🔍</div>
              <div className={styles.flowLabel}>Filter</div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowIcon}>📦</div>
              <div className={styles.flowLabel}>Batch</div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowIcon}>🚀</div>
              <div className={styles.flowLabel}>Send</div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowIcon}>🔄</div>
              <div className={styles.flowLabel}>Retry</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Implementation Guide Section
function ImplementationSection() {
  return (
    <section className={styles.implementationSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Implementation Guide
          </Heading>
          <p className={styles.sectionSubtitle}>
            Best practices and patterns for production use
          </p>
        </div>
        
        <div className={styles.guideGrid}>
          <div className={styles.guideCard}>
            <h3 className={styles.guideTitle}>🏗️ Project Structure</h3>
            <CodeBlock language="typescript">
{`// Optimal import strategy
import { Logger } from 'magiclogger/core';
import { ConsoleTransport } from 'magiclogger/console';
import { HTTPTransport } from 'magiclogger/http';

// Only imports what you need (tree-shaking)
const logger = new Logger({
  transports: [
    new ConsoleTransport({ level: 'debug' }),
    new HTTPTransport({ url: '/api/logs' })
  ]
});`}
            </CodeBlock>
          </div>
          
          <div className={styles.guideCard}>
            <h3 className={styles.guideTitle}>🎯 Context Strategy</h3>
            <CodeBlock language="typescript">
{`// Application-wide context
const logger = new Logger({
  context: { 
    service: 'api',
    version: process.env.VERSION,
    environment: process.env.NODE_ENV
  }
});

// Request-scoped context
app.use((req, res, next) => {
  req.logger = logger.child({
    context: {
      requestId: req.id,
      userId: req.user?.id,
      method: req.method,
      path: req.path
    }
  });
  next();
});`}
            </CodeBlock>
          </div>
          
          <div className={styles.guideCard}>
            <h3 className={styles.guideTitle}>⚡ Performance Tips</h3>
            <CodeBlock language="typescript">
{`// Use async for high-frequency logs
const logger = new Logger({
  async: {
    enabled: true,
    buffer: { size: 100000 },
    flushInterval: 1000
  }
});

// Bypass async for critical logs
logger.error('Critical error', { 
  async: false,  // Force sync
  alert: true
});

// Batch network transports
new HTTPTransport({
  batch: {
    maxSize: 100,
    maxTime: 5000,
    maxBytes: 1048576  // 1MB
  }
});`}
            </CodeBlock>
          </div>
          
          <div className={styles.guideCard}>
            <h3 className={styles.guideTitle}>🛡️ Error Handling</h3>
            <CodeBlock language="typescript">
{`// Transport error handling
const httpTransport = new HTTPTransport({
  url: 'https://logs.example.com',
  fallback: new FileTransport({
    filepath: './fallback.log'
  }),
  dlq: {
    enabled: true,
    filepath: './dlq.log'
  }
});

// Listen for transport events
httpTransport.on('error', (error, entry) => {
  console.error('Transport failed:', error);
});

httpTransport.on('fallback', ({ count }) => {
  console.log(\`Failed over for \${count} logs\`);
});`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main Architecture Page Component
export default function Architecture(): JSX.Element {
  return (
    <Layout
      title="Architecture - MagicLogger"
      description="Deep dive into MagicLogger's architecture, design principles, and implementation details">
      <main className={styles.architecturePage}>
        <OverviewSection />
        <CoreComponentsSection />
        <PerformanceSection />
        <TransportSystemSection />
        <ImplementationSection />
        
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to dive deeper?</h2>
              <p className={styles.ctaSubtitle}>
                Explore the complete documentation and start building
              </p>
              <div className={styles.ctaButtons}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/">
                  Read the Docs
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="https://github.com/manicinc/magiclogger">
                  View Source Code
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}