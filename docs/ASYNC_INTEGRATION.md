# AsyncLogger Integration Guide

This guide covers the full integration of operational utilities (QueueManager, RateLimiter, Redactor, Sampler) with AsyncLogger for production-ready logging with explicit backpressure handling.

## Should You Use AsyncLogger?

| Scenario | Recommendation | Reason |
|----------|---------------|---------|
| Development/Local | Logger (sync) | Immediate feedback, easier debugging |
| Production API (< 100 RPS) | Logger (sync) | Simplicity outweighs performance |
| Production API (> 100 RPS) | AsyncLogger | Performance critical |
| Background Jobs | AsyncLogger | Non-blocking processing |
| CLI Tools | Logger (sync) | Users expect immediate output |
| Lambda/Serverless | Logger (sync) | Short-lived, needs guaranteed delivery |
| Long-running Services | AsyncLogger | Efficiency over time |

## Table of Contents

- [Should You Use AsyncLogger?](#should-you-use-asynclogger)
- [Overview](#overview)
- [Unified Import API](#unified-import-api)
- [Basic Usage](#basic-usage)
- [Advanced Configuration](#advanced-configuration)
- [Backpressure Handling](#backpressure-handling)
- [Operational Utilities](#operational-utilities)
- [Monitoring & Observability](#monitoring--observability)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Overview

The integrated AsyncLogger provides:

- **Unified Import API**: Import everything from the main entry point
- **Explicit Backpressure**: `AddResult` objects with clear failure reasons
- **Integrated Utilities**: Built-in rate limiting, redaction, sampling, and queue management
- **Production Ready**: Comprehensive monitoring, fallback mechanisms, and graceful degradation
- **Same API**: Both `Logger` and `AsyncLogger` support the same utility configuration

## Unified Import API

All components can now be imported from the main entry point:

```typescript
import {
  // Core logging
  Logger, AsyncLogger, createAsyncLogger,
  
  // Operational utilities
  QueueManager, RateLimiter, Redactor, Sampler,
  
  // Utility presets and helpers
  createRedactorPreset, createSamplerPreset,
  
  // Types for explicit backpressure handling
  type AddResult, type BufferStats,
  type LogEntry, type AsyncLoggerOptions
} from 'magiclogger';
```

## Basic Usage

### Simple Configuration

```typescript
const asyncLogger = createAsyncLogger({
  buffer: {
    size: 8192,
    flushInterval: 100,
    flushSize: 1000
  },
  
  // Built-in utilities with simple configuration
  redactor: { preset: 'strict' },
  rateLimiter: { max: 1000, window: 60000, strategy: 'sliding' },
  sampler: { rate: 0.1, strategy: 'adaptive', targetRate: 1000 },
  queueManager: { maxSize: 10000, dropPolicy: 'tail' },
  
  // Observability
  onMetrics: (metrics) => {
    console.log(`Metric: ${metrics.type}, Count: ${metrics.count}`);
  },
  
  onFlush: async (entries) => {
    await transport.sendBatch(entries);
  }
});

// Logging with explicit results
const result = asyncLogger.info('User logged in', { userId: 12345 });
if (!result.success) {
  console.warn(`Log dropped: ${result.reason}`);
}
```

### Regular Logger Integration

The same utilities work with regular Logger:

```typescript
const logger = new Logger({
  // Same utility integration!
  redactor: { preset: 'standard' },
  rateLimiter: { max: 100, window: 30000 },
  sampler: { rate: 1.0 }, // No sampling for regular logger
  
  transports: [new ConsoleTransport()]
});

logger.info('This is redacted and rate limited');
```

## Advanced Configuration

### Pre-configured Utility Instances

```typescript
// Create utility instances with advanced configuration
const redactor = new Redactor({
  preset: 'paranoid',
  auditTrail: true,
  patterns: [{
    name: 'custom-api-key',
    pattern: /api_key_[a-zA-Z0-9]{32}/g,
    replacement: 'api_key_***',
    strategy: 'mask'
  }]
});

const rateLimiter = new RateLimiter({
  max: 1000,
  window: 60000,
  strategy: 'token-bucket',
  keyFn: (entry) => entry.level, // Rate limit per level
  onLimit: (key, dropped) => {
    console.log(`Rate limit hit for ${key}: ${dropped} entries dropped`);
  }
});

const sampler = createSamplerPreset('production'); // 10% sampling with adaptive strategy

const queueManager = new QueueManager({
  maxSize: 5000,
  dropPolicy: 'priority',
  priorityFn: (entry) => entry.level === 'error' ? 10 : 1,
  onDrop: (entries, reason) => {
    metrics.recordDrops(entries.length, reason);
  }
});

// Use in AsyncLogger
const asyncLogger = new AsyncLogger({
  buffer: { size: 8192, flushInterval: 50 },
  
  // Use pre-configured instances
  redactor,
  rateLimiter,
  sampler,
  queueManager,
  
  // Advanced options
  fallbackToSync: true,
  flushOnHighWater: true,
  
  onFlush: async (entries) => {
    await transport.sendBatch(entries);
  }
}, createLogEntry);
```

## Backpressure Handling

### Explicit Result Objects

All logging methods now return `AddResult` objects:

```typescript
interface AddResult {
  success: boolean;
  reason?: 'buffer_full' | 'closing' | 'dropped';
  dropped?: LogEntry;
  bufferStats?: {
    size: number;
    capacity: number;
    utilization: number;
  };
}
```

### Usage Examples

```typescript
// Regular logging with result checking
const result = asyncLogger.error('Database connection failed');
if (!result.success) {
  // Handle the failure
  switch (result.reason) {
    case 'buffer_full':
      // Buffer is full, implement backoff
      await new Promise(resolve => setTimeout(resolve, 100));
      break;
    case 'closing':
      // Logger is shutting down
      console.error('Cannot log, logger is closing');
      break;
    case 'dropped':
      // Entry was dropped due to overflow strategy
      console.warn('Log entry dropped:', result.dropped);
      break;
  }
}

// Critical logging with retries
try {
  await asyncLogger.logCritical('error', 'CRITICAL: System failure', {
    component: 'database',
    error: 'Connection pool exhausted'
  });
} catch (error) {
  // Critical log failed after retries
  console.error('CRITICAL LOG FAILED:', error);
  process.exit(1);
}
```

### Backpressure Detection

```typescript
// Check if logger is under backpressure
if (asyncLogger.isBackpressured()) {
  console.warn('Logger under pressure, throttling application');
  // Implement application-level throttling
}

// Get utilization percentage
const utilization = asyncLogger.getUtilization();
if (utilization > 80) {
  console.warn(`Buffer utilization: ${utilization}%`);
}
```

## Operational Utilities

### Rate Limiting

Controls log throughput to prevent flooding:

```typescript
const rateLimiter = new RateLimiter({
  max: 1000,           // Max logs per window
  window: 60000,       // Window in milliseconds
  strategy: 'sliding', // 'sliding', 'fixed', 'token-bucket', 'leaky-bucket'
  keyFn: (entry) => entry.level, // Rate limit by log level
  onLimit: (key, dropped) => {
    metrics.increment('logs.rate_limited', { level: key });
  }
});
```

### Redaction

Removes PII and sensitive data:

```typescript
const redactor = new Redactor({
  preset: 'strict',     // 'minimal', 'standard', 'strict', 'paranoid'
  auditTrail: true,     // Keep audit log for compliance
  patterns: [           // Custom patterns
    {
      name: 'custom-secret',
      pattern: /secret_[a-zA-Z0-9]+/g,
      replacement: 'secret_***',
      strategy: 'mask'
    }
  ]
});

// Supports multiple strategies: 'mask', 'hash', 'tokenize', 'truncate', 'remove'
```

### Sampling

Controls log volume through statistical sampling:

```typescript
const sampler = new Sampler({
  rate: 0.1,              // 10% sampling rate
  strategy: 'adaptive',   // 'random', 'deterministic', 'adaptive', 'reservoir'
  targetRate: 1000,       // Target logs/second for adaptive
  keyFn: (entry) => entry.id // Deterministic key function
});

// Or use presets
const prodSampler = createSamplerPreset('production'); // 10% adaptive sampling
const devSampler = createSamplerPreset('development');  // 100% sampling
```

### Queue Management

Handles backpressure and overflow:

```typescript
const queueManager = new QueueManager({
  maxSize: 10000,         // Max queue size
  dropPolicy: 'priority', // 'tail', 'head', 'priority', 'random'
  priorityFn: (entry) => entry.level === 'error' ? 10 : 1,
  highWaterMark: 0.8,     // Trigger backpressure at 80%
  lowWaterMark: 0.5,      // Resume at 50%
  onDrop: (entries, reason) => {
    // Handle dropped entries
  }
});
```

## Monitoring & Observability

### Comprehensive Statistics

```typescript
// AsyncLogger statistics
const stats = asyncLogger.getStats();
console.log('Buffer Stats:', {
  size: stats.buffer.size,
  utilization: `${Math.round(stats.buffer.utilization * 100)}%`,
  totalFlushed: stats.buffer.metrics?.totalFlushed,
  totalDropped: stats.buffer.metrics?.totalDropped
});

// Individual utility statistics
console.log('Rate Limiter:', rateLimiter.getStats());
console.log('Redactor:', redactor.getStats());
console.log('Sampler:', sampler.getStats());
console.log('Queue:', queueManager.getStats());
```

### Metrics Callback

```typescript
const asyncLogger = createAsyncLogger({
  // ... other options
  
  onMetrics: (metrics) => {
    switch (metrics.type) {
      case 'drop':
        prometheus.counter('logs_dropped_total').inc(metrics.count);
        break;
      case 'backpressure':
        prometheus.gauge('log_buffer_utilization').set(metrics.utilization);
        break;
      case 'rate_limit':
        prometheus.counter('logs_rate_limited_total').inc(metrics.count);
        break;
      case 'sample':
        prometheus.counter('logs_sampled_total').inc(metrics.count);
        break;
    }
  }
});
```

## Best Practices

### Production Configuration

```typescript
const productionAsyncLogger = createAsyncLogger({
  buffer: {
    size: 16384,        // Large buffer for high throughput
    flushInterval: 50,  // Frequent flushes
    flushSize: 1000     // Reasonable batch size
  },
  
  // Conservative utilities for production
  redactor: { 
    preset: 'strict',
    auditTrail: true 
  },
  rateLimiter: { 
    max: 10000, 
    window: 60000, 
    strategy: 'sliding' 
  },
  sampler: { 
    rate: 0.1, 
    strategy: 'adaptive',
    targetRate: 1000,
    minRate: 0.001,
    maxRate: 0.5
  },
  queueManager: {
    maxSize: 50000,
    dropPolicy: 'priority',
    highWaterMark: 0.8,
    lowWaterMark: 0.3
  },
  
  // Production settings
  fallbackToSync: true,
  flushOnHighWater: true,
  
  // Comprehensive monitoring
  onMetrics: (metrics) => {
    // Send to your monitoring system
    monitoring.recordLogMetric(metrics);
  },
  
  onFlush: async (entries) => {
    // Robust transport with retries
    await transport.sendBatchWithRetry(entries);
  }
});
```

### Error Handling

```typescript
// Always check results for critical operations
const result = asyncLogger.error('Critical error occurred');
if (!result.success) {
  // Fallback to console or alternative logging
  console.error('Failed to log critical error, falling back to console');
  console.error('Original error:', errorData);
}

// Use critical logging for must-log scenarios
try {
  await asyncLogger.logCritical('error', 'System failure', { 
    severity: 'critical',
    component: 'database',
    action: 'restart_required'
  });
} catch (error) {
  // This is a serious problem - logger can't handle critical logs
  alerting.sendCriticalAlert('Logger failure', error);
}
```

### Graceful Shutdown

```typescript
// Proper shutdown sequence
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  
  // Flush all pending logs
  await asyncLogger.flushAndWait();
  
  // Close logger and cleanup resources
  await asyncLogger.close();
  
  // Exit process
  process.exit(0);
});
```

## Migration Guide

### From AsyncLogger v1

```typescript
// Before (v1)
const oldAsyncLogger = new AsyncLogger({
  buffer: { size: 8192 },
  onFlush: (entries) => transport.send(entries)
});

oldAsyncLogger.info('message'); // Returns void

// After (v2)
const newAsyncLogger = createAsyncLogger({
  buffer: { size: 8192 },
  onFlush: async (entries) => await transport.send(entries),
  
  // New integrated utilities
  redactor: { preset: 'standard' },
  rateLimiter: { max: 1000, window: 60000 }
});

const result = newAsyncLogger.info('message'); // Returns AddResult
if (!result.success) {
  console.warn('Log dropped:', result.reason);
}
```

### Adding Utilities to Existing Loggers

```typescript
// Existing logger
const logger = new Logger({
  transports: [new ConsoleTransport()]
});

// Enhanced with utilities
const enhancedLogger = new Logger({
  transports: [new ConsoleTransport()],
  
  // Add operational utilities
  redactor: { preset: 'standard' },
  rateLimiter: { max: 100, window: 30000 },
  sampler: { rate: 0.5 }
});
```

## Performance Considerations

- **Buffer Size**: Larger buffers reduce flush frequency but use more memory
- **Flush Interval**: Lower intervals improve latency but increase CPU usage  
- **Utility Order**: Processing order is: Sampling → Rate Limiting → Redaction → Buffering
- **Memory Usage**: Each utility maintains internal state, monitor memory consumption
- **CPU Impact**: Redaction and rate limiting add CPU overhead per log entry

## Troubleshooting

### High Drop Rates

```typescript
// Check buffer utilization
const utilization = asyncLogger.getUtilization();
if (utilization > 90) {
  console.log('Buffer nearly full, consider:');
  console.log('- Increasing buffer size');
  console.log('- Reducing flush interval');
  console.log('- Implementing application backpressure');
}

// Check rate limiting
const rateLimiterStats = rateLimiter.getStats();
if (rateLimiterStats.dropped.size > 0) {
  console.log('Rate limiting active, consider increasing limits');
}
```

### Memory Issues

```typescript
// Monitor utility memory usage
const redactorStats = redactor.getStats();
if (redactorStats.cacheSize > 5000) {
  console.log('Redactor cache large, consider clearing or reducing max size');
  redactor.reset(); // Clear cache if needed
}
```

### Performance Issues

```typescript
// Disable expensive features in high-throughput scenarios
const lightweightAsyncLogger = createAsyncLogger({
  buffer: { size: 32768, flushInterval: 10 },
  
  // Minimal utilities for maximum performance
  sampler: { rate: 0.01 }, // Heavy sampling
  // Skip redaction and rate limiting for performance
  
  onFlush: async (entries) => {
    // Optimized batch processing
    await fastTransport.sendBatch(entries);
  }
});
```

This integration provides a production-ready logging solution with comprehensive operational capabilities while maintaining the simplicity and performance of the original MagicLogger API.