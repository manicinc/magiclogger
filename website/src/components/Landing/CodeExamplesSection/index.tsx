// File: website/src/components/Landing/CodeExamplesSection/index.tsx

import React, { useState } from 'react';
import clsx from 'clsx';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const examples = [
  {
    id: 'basic',
    title: 'Basic Usage',
    icon: '🎯',
    description: 'Get started in seconds. No config needed.',
    code: `import { Logger } from 'magiclogger';

const logger = new Logger();

// Beautiful logs with angle bracket syntax
logger.info('<cyan.bold>Server started</> on port <yellow>3000</>');
logger.warn('<yellow>⚠</> Memory usage <red.bold>high</>', { usage: '85%' });
logger.error('Connection failed', new Error('ECONNREFUSED'));

// The MAGIC Schema preserves your styles everywhere
logger.success('<green>✅ All tests passed!</>');
logger.header('Application Metrics', ['cyan', 'bold']);

// Rich formatting
logger.table([
  { name: 'Alice', role: 'Developer', status: 'Active' },
  { name: 'Bob', role: 'Designer', status: 'Away' }
]);`
  },
  {
    id: 'production',
    title: 'Production Setup',
    icon: '🏭',
    description: 'Scale from prototype to production in minutes.',
    code: `import { Logger } from 'magiclogger';
import { ConsoleTransport, FileTransport, HTTPTransport, S3Transport } from 'magiclogger/transports';

const logger = new Logger({
  id: 'api-service',
  tags: ['production', 'api', 'v2'],
  context: {
    service: 'user-api',
    version: process.env.VERSION,
    environment: process.env.NODE_ENV
  },
  
  // Async for performance
  async: {
    enabled: true,
    buffer: {
      size: 100000,        // 100k entry ring buffer
      flushInterval: 1000  // Flush every second
    }
  },
  
  transports: [
    // Pretty console in dev
    new ConsoleTransport({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      useColors: true
    }),
    
    // Rotating file logs
    new FileTransport({
      filepath: './logs',
      rotation: 'daily',
      maxFiles: 7,
      compress: true
    }),
    
    // Central logging
    new HTTPTransport({
      url: process.env.LOG_ENDPOINT,
      batch: { maxSize: 100, maxTime: 5000 },
      retry: { maxRetries: 3 }
    }),
    
    // Archive to S3
    new S3Transport({
      bucket: 'my-app-logs',
      prefix: \`logs/\${process.env.NODE_ENV}/\`
    })
  ]
});`
  },
  {
    id: 'express',
    title: 'Express Integration',
    icon: '🌐',
    description: 'Perfect request tracking and error handling.',
    code: `// Middleware for automatic request logging
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
  
  // Log request
  req.logger.info('Request received');
  
  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    req.logger.info('Request completed', {
      status: res.statusCode,
      duration: Date.now() - start,
      size: res.get('content-length')
    });
  });
  
  next();
});

// Use in routes
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
});`
  },
  {
    id: 'errors',
    title: 'Error Handling',
    icon: '🛡️',
    description: 'Never lose a log. Built-in resilience.',
    code: `// Transport with fallback and DLQ
const httpTransport = new HTTPTransport({
  url: 'https://logs.example.com',
  
  // Fallback when primary fails
  fallback: new FileTransport({
    filepath: './logs/fallback.log'
  }),
  
  // Dead Letter Queue
  dlq: {
    enabled: true,
    filepath: './logs/dlq.log',
    maxSize: 10485760  // 10MB
  },
  
  // Circuit breaker
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    resetTimeout: 60000
  }
});

// Global error handlers
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
    id: 'browser',
    title: 'Browser Logging',
    icon: '🌏',
    description: 'Full-featured logging in the browser.',
    code: `// Browser-optimized configuration
const logger = new Logger({
  // Store logs locally
  storeInBrowser: true,
  maxStoredLogs: 1000,
  storageKey: 'app-logs',
  
  transports: [
    // Beautiful console
    new ConsoleTransport({
      useColors: true,
      showTimestamp: true
    }),
    
    // Send errors to backend
    new HTTPTransport({
      url: '/api/logs',
      levels: ['error', 'fatal'],
      batch: { maxSize: 50, maxTime: 10000 }
    })
  ]
});

// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.error('React error boundary triggered', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      props: this.props
    });
  }
}

// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const perfLogger = logger.child({ tags: ['performance'] });

getCLS(metric => perfLogger.info('CLS', metric));
getFID(metric => perfLogger.info('FID', metric));
getFCP(metric => perfLogger.info('FCP', metric));
getLCP(metric => perfLogger.info('LCP', metric));
getTTFB(metric => perfLogger.info('TTFB', metric));

// Debug tools
if (process.env.NODE_ENV === 'development') {
  window.logger = logger;
  window.downloadLogs = () => logger.downloadLogs();
  window.clearLogs = () => logger.clearLogs();
}`
  },
  {
    id: 'typescript',
    title: 'TypeScript First',
    icon: '🔷',
    description: 'Full type safety and IntelliSense.',
    code: `import { Logger, LogLevel, LogEntry, Transport } from 'magiclogger';

// Everything is typed
interface AppContext {
  userId: string;
  sessionId: string;
  feature: string;
}

const logger = new Logger<AppContext>({
  context: {
    userId: 'user-123',
    sessionId: 'session-456',
    feature: 'onboarding'
  }
});

// Type-safe logging
logger.info('User action', {
  action: 'click_button',
  timestamp: Date.now()
});

// Custom transport with types
class CustomTransport implements Transport {
  name = 'custom';
  
  async log(entry: LogEntry): Promise<void> {
    // entry is fully typed
    console.log(\`[\${entry.level}] \${entry.message}\`);
  }
  
  shouldLog(entry: LogEntry): boolean {
    return entry.level !== 'debug';
  }
}

// Typed log levels
const level: LogLevel = 'info';
logger.log(level, 'Dynamic level logging');`
  },
  {
    id: 'performance',
    title: 'Performance Tracking',
    icon: '⚡',
    description: 'Built-in performance monitoring.',
    code: `// Track operation timing
logger.time('database-query');

const results = await db.query('SELECT * FROM users');

logger.timeEnd('database-query'); // Logs: database-query: 45.23ms

// Track custom metrics
logger.metric('api.latency', 23.5, { endpoint: '/users' });
logger.metric('cache.hit_rate', 0.95);

// Performance context
const perfLogger = logger.child({
  tags: ['performance'],
  context: { component: 'database' }
});

// Measure async operations
await perfLogger.measureAsync('heavy-computation', async () => {
  return await processLargeDataset();
});

// Track memory usage
perfLogger.memory('After processing');

// CPU profiling
perfLogger.profile('cpu-intensive-task', () => {
  // Your code here
});

// Real-time performance dashboard
logger.dashboard({
  metrics: ['latency', 'throughput', 'errors'],
  interval: 1000,
  port: 3001
});`
  },
  {
    id: 'testing',
    title: 'Testing & Debugging',
    icon: '🧪',
    description: 'Make your tests as beautiful as your code.',
    code: `// Test-friendly logging
import { Logger, MemoryTransport } from 'magiclogger';
import { jest } from '@jest/globals';

// In-memory transport for tests
const memoryTransport = new MemoryTransport();
const logger = new Logger({
  transports: [memoryTransport]
});

describe('User Service', () => {
  beforeEach(() => {
    memoryTransport.clear();
  });
  
  test('should log user creation', async () => {
    await createUser({ name: 'Alice' });
    
    // Assert on logs
    expect(memoryTransport.logs).toContainEqual(
      expect.objectContaining({
        level: 'info',
        message: 'User created',
        context: expect.objectContaining({
          userId: expect.any(String)
        })
      })
    );
  });
  
  test('should track performance', async () => {
    await processUsers();
    
    const perfLogs = memoryTransport.logs.filter(
      log => log.tags?.includes('performance')
    );
    
    expect(perfLogs).toHaveLength(3);
    expect(perfLogs[0].context.duration).toBeLessThan(100);
  });
});

// Spy on logs in tests
const logSpy = jest.spyOn(logger, 'info');
await someOperation();
expect(logSpy).toHaveBeenCalledWith('Operation completed');`
  }
];

export default function CodeExamplesSection() {
  const [activeExample, setActiveExample] = useState('basic');
  
  const currentExample = examples.find(e => e.id === activeExample) || examples[0];
  
  return (
    <section className={styles.examplesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Real code, real examples
          </Heading>
          <p className={styles.sectionSubtitle}>
            From quick prototypes to production systems - see how MagicLogger scales with you
          </p>
        </div>

        <div className={styles.examplesContainer}>
          {/* Example tabs */}
          <div className={styles.exampleTabs}>
            {examples.map((example) => (
              <button
                key={example.id}
                className={clsx(
                  styles.exampleTab, 
                  activeExample === example.id && styles.active
                )}
                onClick={() => setActiveExample(example.id)}>
                <span className={styles.tabIcon}>{example.icon}</span>
                <span className={styles.tabTitle}>{example.title}</span>
              </button>
            ))}
          </div>

          {/* Example content */}
          <div className={styles.exampleContent}>
            <div className={styles.exampleHeader}>
              <div className={styles.exampleInfo}>
                <h3 className={styles.exampleTitle}>
                  <span className={styles.exampleIcon}>{currentExample.icon}</span>
                  {currentExample.title}
                </h3>
                <p className={styles.exampleDescription}>{currentExample.description}</p>
              </div>
              
              <div className={styles.exampleActions}>
                <button 
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText(currentExample.code)}>
                  <CopyIcon />
                  Copy
                </button>
                <button className={styles.playButton}>
                  <PlayIcon />
                  Run
                </button>
              </div>
            </div>

            <div className={styles.exampleCode}>
              <CodeBlock language="typescript" className={styles.codeBlock}>
                {currentExample.code}
              </CodeBlock>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// Icons
function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}