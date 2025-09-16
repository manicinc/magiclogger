# Advanced Usage Patterns

This guide covers advanced patterns and best practices for MagicLogger.

## Table of Contents

- [Architecture Details](#architecture-details)
- [Custom Transports](#custom-transports)
- [Middleware & Plugins](#middleware--plugins)
- [Distributed Tracing](#distributed-tracing)
- [Security & Compliance](#security--compliance)
- [Testing Strategies](#testing-strategies)
- [Production Best Practices](#production-best-practices)

## Architecture Details

### Transport-Optimized Architecture

MagicLogger uses a multi-layered transport system designed for maximum flexibility and performance:

**Core Architecture Components:**
- **Logger Core**: Lightweight, synchronous message formatting and routing
- **Transport Layer**: Pluggable outputs with independent configuration
- **Async Workers**: Optional worker threads for non-blocking I/O
- **Batch Processing**: Intelligent batching for network and file I/O

**Transport Types:**
- **Synchronous**: Console, File (immediate write)
- **Asynchronous**: HTTP, WebSocket, Database (queued with retry)
- **Streaming**: Real-time outputs with backpressure handling
- **Conditional**: Route logs based on level, content, or metadata

### Dispatch Architecture

The logging pipeline is optimized for different scenarios:

**Synchronous Mode (SyncLogger):**
- Direct dispatch to transports
- Guaranteed delivery order
- Best for: Audit logs, debugging, small applications
- Trade-off: Can block on slow I/O

**Asynchronous Mode (AsyncLogger):**
- Worker thread pool for I/O operations
- Non-blocking main thread
- Smart batching and buffering
- Best for: Production services, high-throughput applications
- Trade-off: Possible log loss on crash (mitigated by flush strategies)

### Log Delivery Guarantees

MagicLogger provides configurable delivery guarantees:

**At-Most-Once (Default for Async):**
- Logs queued in memory
- Fast, non-blocking
- Possible loss on crash
- Use for: Application logs, metrics

**At-Least-Once (With Retry):**
- Automatic retry on failure
- Exponential backoff
- Duplicate possible on retry
- Use for: Important events, alerts

**Exactly-Once (With Sync):**
- Synchronous confirmation
- Transaction support
- Guaranteed single delivery
- Use for: Audit logs, compliance

## Custom Transports

Building a custom transport allows you to send logs to any destination:

Create specialized transports for your infrastructure:

```typescript
import { Transport } from 'magiclogger/transports/base';
import { LogEntry } from 'magiclogger/types';

class KafkaTransport extends Transport {
  private producer: KafkaProducer;
  private topic: string;
  
  constructor(options: KafkaTransportOptions) {
    super(options);
    this.topic = options.topic;
    this.producer = new KafkaProducer(options.kafka);
  }
  
  async init(): Promise<void> {
    await this.producer.connect();
  }
  
  async log(entry: LogEntry): Promise<void> {
    const message = {
      key: entry.id,
      value: JSON.stringify(entry),
      timestamp: entry.timestampMs,
      headers: {
        'log-level': entry.level,
        'service': entry.metadata?.service || 'unknown'
      }
    };
    
    await this.producer.send({
      topic: this.topic,
      messages: [message]
    });
  }
  
  async logBatch(entries: LogEntry[]): Promise<void> {
    const messages = entries.map(entry => ({
      key: entry.id,
      value: JSON.stringify(entry),
      timestamp: entry.timestampMs
    }));
    
    await this.producer.sendBatch({
      topic: this.topic,
      messages
    });
  }
  
  async close(): Promise<void> {
    await this.producer.disconnect();
  }
}
```

### Transport Composition

Combine multiple transports with different strategies:

```typescript
class ConditionalTransport extends Transport {
  private transports: Map<string, Transport>;
  
  constructor(options: ConditionalTransportOptions) {
    super(options);
    this.transports = new Map(options.transports);
  }
  
  async log(entry: LogEntry): Promise<void> {
    // Route based on level
    if (entry.level === 'error' || entry.level === 'fatal') {
      await this.transports.get('critical')?.log(entry);
    } else if (entry.level === 'warn') {
      await this.transports.get('warning')?.log(entry);
    } else {
      await this.transports.get('default')?.log(entry);
    }
  }
}

const logger = new Logger({
  transports: [
    new ConditionalTransport({
      transports: [
        ['critical', new HTTPTransport({ url: '/api/critical-logs' })],
        ['warning', new FileTransport({ filepath: './warnings.log' })],
        ['default', new ConsoleTransport()]
      ]
    })
  ]
});
```

## Middleware & Plugins

### Creating Middleware

Process logs before they reach transports:

```typescript
class TimestampEnricher {
  process(entry: LogEntry): LogEntry {
    return {
      ...entry,
      timestamps: {
        iso: entry.timestamp,
        unix: entry.timestampMs,
        local: new Date(entry.timestampMs).toLocaleString()
      }
    };
  }
}

class GeoIPEnricher {
  async process(entry: LogEntry): Promise<LogEntry> {
    if (entry.context?.ip) {
      const geo = await this.lookupGeoIP(entry.context.ip);
      return {
        ...entry,
        context: {
          ...entry.context,
          geo
        }
      };
    }
    return entry;
  }
}
```

### Plugin System

Extend logger functionality with plugins:

```typescript
interface LoggerPlugin {
  name: string;
  version: string;
  
  install(logger: Logger): void;
  uninstall(logger: Logger): void;
}

class MetricsPlugin implements LoggerPlugin {
  name = 'metrics';
  version = '1.0.0';
  
  private metrics: MetricsClient;
  
  install(logger: Logger): void {
    logger.on('log', (entry) => {
      this.metrics.increment(`logs.${entry.level}`);
    });
    
    logger.on('error', (error) => {
      this.metrics.increment('logs.errors');
    });
    
    logger.on('flush', (count) => {
      this.metrics.histogram('logs.flush.size', count);
    });
  }
  
  uninstall(logger: Logger): void {
    logger.removeAllListeners();
  }
}
```

## Distributed Tracing

### W3C Trace Context Integration

Automatic trace context propagation:

```typescript
import { AsyncLocalStorage } from 'async_hooks';
import { extractTraceContext } from 'magiclogger/utils/trace-context';

const traceStorage = new AsyncLocalStorage();

// Middleware to extract and store trace context
app.use((req, res, next) => {
  const traceContext = extractTraceContext(req.headers);
  
  traceStorage.run(traceContext, () => {
    req.log = createContextualLogger(traceContext);
    next();
  });
});

function createContextualLogger(traceContext) {
  return new Logger({
    context: { trace: traceContext },
    
    // Auto-inject trace context into all logs
    middleware: [(entry) => ({
      ...entry,
      trace: traceStorage.getStore() || traceContext
    })]
  });
}

// Logs automatically include trace context
app.get('/api/users', (req, res) => {
  req.log.info('Fetching users');  // Includes traceId and spanId
});
```

### OpenTelemetry Integration

```typescript
import { OTLPTransport } from 'magiclogger/transports/otlp';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const logger = new Logger({
  transports: [
    new OTLPTransport({
      endpoint: 'http://localhost:4318/v1/logs',
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'api-service',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production'
      }),
      
      // Map MagicLogger fields to OTLP
      fieldMapping: {
        'level': 'severityText',
        'message': 'body',
        'context': 'attributes',
        'trace.traceId': 'traceId',
        'trace.spanId': 'spanId'
      }
    })
  ]
});
```

## Security & Compliance

### PII Redaction

Automatically redact sensitive information:

```typescript
import { Redactor } from 'magiclogger/extensions';

const redactor = new Redactor({
  preset: 'strict',
  
  // Custom patterns
  patterns: [
    {
      name: 'email',
      pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      replacement: '[EMAIL]'
    },
    {
      name: 'ssn',
      pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
      replacement: '[SSN]'
    }
  ],
  
  // Keys to always redact
  keys: ['password', 'token', 'apiKey', 'secret'],
  
  // Deep scanning
  deepScan: true,
  maxDepth: 10
});

const logger = new Logger({ redactor });
```

### Audit Logging

Create tamper-proof audit logs:

```typescript
import crypto from 'crypto';

class AuditLogger extends SyncLogger {
  private hashChain: string = '';
  
  log(level: LogLevel, message: string, context?: any): void {
    const entry = this.createEntry(level, message, context);
    
    // Add hash chain
    const entryHash = this.hash(JSON.stringify(entry));
    entry.audit = {
      hash: entryHash,
      previousHash: this.hashChain,
      signature: this.sign(entryHash)
    };
    
    this.hashChain = entryHash;
    
    // Write with fsync for durability
    super.log(entry);
  }
  
  private hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private sign(data: string): string {
    // Sign with private key
    return crypto.sign('sha256', Buffer.from(data), this.privateKey);
  }
}
```

## Testing Strategies

### Mock Logger for Tests

```typescript
class MockLogger extends Logger {
  public logs: LogEntry[] = [];
  
  protected dispatch(entry: LogEntry): void {
    this.logs.push(entry);
  }
  
  hasLogged(level: LogLevel, message: string): boolean {
    return this.logs.some(
      log => log.level === level && log.message.includes(message)
    );
  }
  
  clear(): void {
    this.logs = [];
  }
}

// In tests
describe('UserService', () => {
  let logger: MockLogger;
  let service: UserService;
  
  beforeEach(() => {
    logger = new MockLogger();
    service = new UserService(logger);
  });
  
  it('should log user creation', async () => {
    await service.createUser({ name: 'John' });
    
    expect(logger.hasLogged('info', 'User created')).toBe(true);
    expect(logger.logs[0].context).toHaveProperty('userId');
  });
});
```

### Snapshot Testing

```typescript
import { stripAnsi } from 'magiclogger/utils';

test('log formatting', () => {
  const logger = new Logger({ useColors: true });
  const output = logger.format('info', 'Test message', { id: 123 });
  
  // Strip ANSI codes for snapshot
  expect(stripAnsi(output)).toMatchSnapshot();
});
```

## Production Best Practices

### 1. Graceful Shutdown

```typescript
class Application {
  private logger: AsyncLogger;
  
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down gracefully');
    
    // Stop accepting new logs
    this.logger.pause();
    
    // Flush remaining logs
    await this.logger.flush();
    
    // Close transports
    await this.logger.close();
    
    process.exit(0);
  }
}

process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());
```

### 2. Health Checks

```typescript
app.get('/health', (req, res) => {
  const loggerStats = logger.getStats();
  
  const health = {
    status: 'healthy',
    logger: {
      buffered: loggerStats.bufferSize,
      dropped: loggerStats.droppedCount,
      transports: logger.getTransports().map(t => ({
        name: t.name,
        status: t.isHealthy() ? 'healthy' : 'unhealthy'
      }))
    }
  };
  
  res.json(health);
});
```

### 3. Dynamic Configuration

```typescript
class ConfigurableLogger extends Logger {
  updateLevel(level: LogLevel): void {
    this.options.level = level;
    this.transports.forEach(t => t.setLevel?.(level));
  }
  
  updateSampling(rate: number): void {
    this.sampler?.setRate(rate);
  }
  
  addTransport(transport: Transport): void {
    super.addTransport(transport);
    transport.init();
  }
}

// API endpoint for runtime configuration
app.post('/admin/logging', (req, res) => {
  const { level, samplingRate, enableDebug } = req.body;
  
  if (level) logger.updateLevel(level);
  if (samplingRate) logger.updateSampling(samplingRate);
  if (enableDebug !== undefined) logger.setVerbose(enableDebug);
  
  res.json({ message: 'Logging configuration updated' });
});
```

### 4. Correlation IDs

```typescript
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  // Get or create correlation ID
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  
  // Attach to request
  req.correlationId = correlationId;
  
  // Create child logger with correlation ID
  req.logger = logger.child({
    correlationId,
    requestId: uuidv4()
  });
  
  // Pass downstream
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
});
```

### 5. Structured Error Handling

```typescript
class ErrorHandler {
  private logger: Logger;
  
  handleError(error: Error, context?: any): void {
    const errorEntry = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      context,
      
      // Add categorization
      category: this.categorizeError(error),
      severity: this.calculateSeverity(error),
      userImpact: this.assessUserImpact(error)
    };
    
    // Log with appropriate level
    if (errorEntry.severity === 'critical') {
      this.logger.fatal('Critical error occurred', errorEntry);
      this.alertOncall(errorEntry);
    } else if (errorEntry.severity === 'high') {
      this.logger.error('Error occurred', errorEntry);
    } else {
      this.logger.warn('Warning condition', errorEntry);
    }
  }
  
  private categorizeError(error: Error): string {
    if (error.name === 'ValidationError') return 'validation';
    if (error.name === 'DatabaseError') return 'database';
    if (error.code === 'ECONNREFUSED') return 'network';
    return 'unknown';
  }
}
```

## Performance Benchmarks

Compare different configurations:

```typescript
import { performance } from 'perf_hooks';

async function benchmark() {
  const configs = [
    { name: 'Sync', logger: new SyncLogger() },
    { name: 'Async Small Buffer', logger: new AsyncLogger({ buffer: { size: 1000 } }) },
    { name: 'Async Large Buffer', logger: new AsyncLogger({ buffer: { size: 100000 } }) }
  ];
  
  for (const config of configs) {
    const start = performance.now();
    
    for (let i = 0; i < 100000; i++) {
      config.logger.info(`Log message ${i}`, { index: i });
    }
    
    await config.logger.flush();
    const duration = performance.now() - start;
    
    console.log(`${config.name}: ${duration.toFixed(2)}ms`);
    console.log(`  Throughput: ${(100000 / (duration / 1000)).toFixed(0)} logs/sec`);
  }
}
```

## Troubleshooting

### Debug Logging

Enable verbose output for troubleshooting:

```typescript
const logger = new Logger({
  verbose: true,
  debug: {
    showTransportErrors: true,
    showDroppedLogs: true,
    showBufferStats: true,
    statsInterval: 5000
  }
});

logger.on('error', (error, context) => {
  console.error('Logger error:', error, context);
});

logger.on('transport:error', (transport, error) => {
  console.error(`Transport ${transport.name} error:`, error);
});
```

### Common Issues

1. **High memory usage**: Reduce buffer size or implement sampling
2. **Dropped logs**: Increase buffer size or reduce log volume
3. **Slow performance**: Use AsyncLogger, batch transports
4. **Missing logs**: Check transport errors, ensure proper flushing
5. **Network timeouts**: Implement retry logic, use local buffering