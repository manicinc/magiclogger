# Context and Tags in MagicLogger

This guide covers how to effectively use context and tags in MagicLogger for structured logging, filtering, and log organization.

## Overview

**Context** and **Tags** are two powerful features that help you add structured metadata to your logs:

- **Context**: Structured data (objects) that provide additional information about the log entry
- **Tags**: Simple string labels used for categorization and filtering

## Context

Context allows you to attach structured data to log entries, providing rich metadata that can be used for debugging, monitoring, and analysis.

### Basic Context Usage

```typescript
import { Logger } from 'magiclogger';

// Global context - applied to all logs from this logger
const logger = new Logger({
  id: 'payment-service',
  context: {
    service: 'payment-api',
    version: '2.1.0',
    environment: 'production',
    region: 'us-east-1'
  }
});

// Per-log context - specific to this log entry
logger.info('Payment processed successfully', {
  orderId: 'ORD-12345',
  customerId: 'CUST-67890',
  amount: 99.99,
  currency: 'USD',
  processingTime: 145,
  paymentMethod: 'credit_card'
});
```

### Context Merging

When both global and per-log context are provided, they are merged with per-log context taking precedence:

```typescript
const logger = new Logger({
  context: { service: 'api', version: '1.0', environment: 'prod' }
});

logger.info('User action', {
  userId: '123',
  action: 'login',
  version: '2.0' // This overrides the global version
});

// Resulting context:
// {
//   service: 'api',
//   version: '2.0',    // Overridden
//   environment: 'prod',
//   userId: '123',
//   action: 'login'
// }
```

### Advanced Context Management

Using the `ContextManager` for advanced context operations:

```typescript
import { ContextManager } from 'magiclogger';

const contextManager = new ContextManager({
  sensitiveKeys: ['password', 'token', 'ssn'],
  transformRules: {
    'user.id': 'userId',
    'request.id': 'requestId'
  }
});

// Merge multiple contexts
const baseContext = { service: 'api', version: '1.0' };
const requestContext = { requestId: 'req-123', userId: '456' };
const merged = contextManager.merge(baseContext, requestContext);

// Sanitize sensitive data
const userContext = { 
  userId: '123', 
  email: 'user@example.com', 
  password: 'secret123' 
};
const sanitized = contextManager.sanitize(userContext);
// Result: { userId: '123', email: 'user@example.com', password: '***' }

// Flatten nested context
const nested = {
  user: { id: '123', profile: { name: 'John', age: 30 } },
  request: { method: 'POST', path: '/api/users' }
};
const flattened = contextManager.flatten(nested);
// Result: {
//   'user.id': '123',
//   'user.profile.name': 'John',
//   'user.profile.age': 30,
//   'request.method': 'POST',
//   'request.path': '/api/users'
// }
```

### Context Validation

Ensure context meets your requirements:

```typescript
const validation = contextManager.validate(context, {
  required: ['userId', 'requestId'],
  forbidden: ['password', 'secret'],
  maxDepth: 3,
  maxSize: 1000 // bytes
});

if (!validation.valid) {
  console.error('Context validation failed:', validation.errors);
}
```

### Context Best Practices

1. **Keep it structured**: Use consistent field names across your application
2. **Avoid sensitive data**: Never log passwords, tokens, or PII without sanitization
3. **Use meaningful keys**: Choose descriptive field names that are self-documenting
4. **Limit depth**: Avoid deeply nested objects that are hard to query
5. **Consider size**: Large context objects can impact performance

```typescript
// Good context structure
const goodContext = {
  userId: '123',
  requestId: 'req-456',
  operation: 'user.update',
  duration: 145,
  success: true
};

// Avoid this
const badContext = {
  u: '123', // Unclear abbreviation
  data: {   // Too generic
    stuff: {
      things: {
        deep: {
          nested: 'value' // Too deep
        }
      }
    }
  },
  password: 'secret123' // Sensitive data
};
```

## Tags

Tags are simple string labels that help categorize and filter log entries. They're perfect for grouping related logs and enabling efficient filtering.

### Basic Tag Usage

```typescript
// Global tags - applied to all logs from this logger
const logger = new Logger({
  id: 'api-service',
  tags: ['api', 'production', 'v2']
});

// Tags are automatically included in all log entries
logger.info('Server started');
logger.error('Database connection failed');
```

### Hierarchical Tags

Use hierarchical tags for better organization:

```typescript
import { TagManager } from 'magiclogger';

const tagManager = new TagManager();

// Generate hierarchical tags from paths
const apiTags = tagManager.fromPath('api/v1/users/create');
// Result: ['api', 'api-v1', 'api-v1-users', 'api-v1-users-create']

// Group related functionality
const tags = [
  'service-api',
  'service-auth',
  'database-read',
  'database-write',
  'cache-redis',
  'cache-memory'
];

const grouped = tagManager.group(tags);
// Result: {
//   service: ['api', 'auth'],
//   database: ['read', 'write'],
//   cache: ['redis', 'memory']
// }
```

### Tag Normalization

Ensure consistent tag formatting:

```typescript
const tagManager = new TagManager({
  normalizationRules: {
    lowercase: true,
    replaceSpaces: true,
    replaceDots: true,
    maxLength: 30
  }
});

const rawTags = ['API Service', 'v1.0', 'PRODUCTION', 'user@auth'];
const normalized = tagManager.normalize(rawTags);
// Result: ['api-service', 'v1-0', 'production', 'user-auth']
```

### Tag Filtering and Matching

Filter logs based on tags:

```typescript
// Transport-level tag filtering
new FileTransport({
  name: 'api-logs',
  filepath: './api.log',
  tags: ['api'], // Only logs with 'api' tag
  excludeTags: ['debug'] // Exclude debug logs
});

// Programmatic tag matching
const tags = ['api', 'v1', 'production'];

const hasRequired = tagManager.matches(tags, {
  all: ['api', 'production'] // Must have both
}); // true

const hasAny = tagManager.matches(tags, {
  any: ['debug', 'v1'] // Must have at least one
}); // true

const noForbidden = tagManager.matches(tags, {
  none: ['debug', 'test'] // Must not have any
}); // true
```

### Dynamic Tag Generation

Generate tags from objects or runtime data:

```typescript
const requestInfo = {
  method: 'POST',
  path: '/api/users',
  status: 200,
  authenticated: true
};

const tags = tagManager.fromObject(requestInfo, {
  prefix: 'http',
  includeArrays: true
});
// Result: ['http-method-post', 'http-path-api-users', 'http-status-200', 'http-authenticated']
```

### Tag Validation

Ensure tags meet your standards:

```typescript
const validation = tagManager.validate(['api', 'v1', 'production'], {
  maxCount: 5,
  required: ['api'],
  forbidden: ['debug', 'test'],
  allowedPatterns: [/^[a-z0-9-]+$/]
});

if (!validation.valid) {
  console.error('Tag validation failed:', validation.errors);
}
```

## Transport Integration

Both context and tags integrate seamlessly with transports for filtering and formatting.

### Filtering by Tags

```typescript
// Only send errors to Slack
new SlackTransport({
  webhook: process.env.SLACK_WEBHOOK,
  tags: ['error', 'critical']
});

// Audit logs to secure storage
new S3Transport({
  bucket: 'audit-logs',
  tags: ['audit', 'compliance'],
  excludeTags: ['debug', 'test']
});

// Development logs to console
new ConsoleTransport({
  tags: ['development'],
  showTags: true,
  showMetadata: true
});
```

### Context in Formatters

```typescript
// Custom formatter that includes specific context fields
new FileTransport({
  filepath: './app.log',
  formatter: (entry) => {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase();
    const message = entry.plainMessage || entry.message;
    const userId = entry.context?.userId || 'anonymous';
    const requestId = entry.context?.requestId || 'no-request';
    
    return `[${timestamp}] ${level} [${userId}] [${requestId}] ${message}\n`;
  }
});

// Use built-in formatters with context support
new FileTransport({
  filepath: './structured.log',
  formatter: Formatters.json.pretty // Includes full context
});
```

## Real-World Examples

### Express.js Integration

```typescript
import express from 'express';
import { Logger, ContextManager, TagManager } from 'magiclogger';

const app = express();
const contextManager = new ContextManager();
const tagManager = new TagManager();

// Request logging middleware
app.use((req, res, next) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Create request-specific logger
  req.logger = new Logger({
    context: {
      requestId,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    },
    tags: tagManager.fromPath(`http/${req.method.toLowerCase()}${req.path}`)
  });
  
  // Log request start
  req.logger.info('Request started');
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    req.logger.info('Request completed', {
      status: res.statusCode,
      duration,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
});

// Route handler
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Add user context
    const userContext = { userId, operation: 'user.fetch' };
    const mergedContext = contextManager.merge(req.logger.context, userContext);
    
    req.logger.info('Fetching user', userContext);
    
    const user = await getUserById(userId);
    
    req.logger.info('User fetched successfully', {
      userId,
      userExists: !!user
    });
    
    res.json(user);
  } catch (error) {
    req.logger.error('Failed to fetch user', {
      userId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Microservice Correlation

```typescript
// Service A
const serviceALogger = new Logger({
  context: {
    service: 'user-service',
    version: '1.2.0',
    instance: process.env.INSTANCE_ID
  },
  tags: ['user-service', 'microservice']
});

async function processUserRequest(correlationId: string, userId: string) {
  const requestContext = {
    correlationId,
    userId,
    operation: 'user.process'
  };
  
  serviceALogger.info('Processing user request', requestContext);
  
  // Call Service B
  const result = await callServiceB(correlationId, userId);
  
  serviceALogger.info('User request completed', {
    ...requestContext,
    success: true,
    result: result.id
  });
}

// Service B
const serviceBLogger = new Logger({
  context: {
    service: 'notification-service',
    version: '2.0.1',
    instance: process.env.INSTANCE_ID
  },
  tags: ['notification-service', 'microservice']
});

async function callServiceB(correlationId: string, userId: string) {
  const requestContext = {
    correlationId,
    userId,
    operation: 'notification.send'
  };
  
  serviceBLogger.info('Received request from user-service', requestContext);
  
  // Process notification
  const notification = await sendNotification(userId);
  
  serviceBLogger.info('Notification sent', {
    ...requestContext,
    notificationId: notification.id,
    channel: notification.channel
  });
  
  return notification;
}
```

### Error Tracking and Alerting

```typescript
const errorLogger = new Logger({
  context: {
    service: 'payment-processor',
    environment: process.env.NODE_ENV
  },
  tags: ['payment', 'critical'],
  transports: [
    // Console for development
    new ConsoleTransport({
      level: 'debug',
      showTags: true,
      showMetadata: true
    }),
    
    // File for all logs
    new FileTransport({
      filepath: './logs/payment.log',
      formatter: Formatters.json.compact
    }),
    
    // Slack for errors
    new SlackTransport({
      webhook: process.env.SLACK_WEBHOOK,
      levels: ['error'],
      formatter: (entry) => {
        const context = entry.context || {};
        return {
          text: `🚨 Payment Error: ${entry.message}`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Service', value: context.service, short: true },
              { title: 'Environment', value: context.environment, short: true },
              { title: 'Order ID', value: context.orderId, short: true },
              { title: 'Customer ID', value: context.customerId, short: true },
              { title: 'Error', value: entry.error?.message, short: false }
            ]
          }]
        };
      }
    })
  ]
});

async function processPayment(order: Order) {
  const paymentContext = {
    orderId: order.id,
    customerId: order.customerId,
    amount: order.amount,
    currency: order.currency,
    paymentMethod: order.paymentMethod
  };
  
  errorLogger.info('Processing payment', paymentContext);
  
  try {
    const result = await chargePayment(order);
    
    errorLogger.info('Payment successful', {
      ...paymentContext,
      transactionId: result.transactionId,
      processingTime: result.processingTime
    });
    
    return result;
  } catch (error) {
    errorLogger.error('Payment failed', {
      ...paymentContext,
      error,
      attemptNumber: order.attemptNumber || 1,
      lastAttempt: new Date().toISOString()
    });
    
    throw error;
  }
}
```

## Performance Considerations

1. **Context Size**: Large context objects are serialized for each log entry. Keep them reasonably sized.

2. **Tag Normalization**: Tag normalization happens at logger creation time, not per log entry.

3. **Memory Usage**: Context and tags are stored in memory until the log entry is processed.

4. **Serialization**: JSON serialization of context happens when formatting logs for output.

```typescript
// Efficient context usage
const logger = new Logger({
  context: {
    service: 'api',
    version: '1.0'
  }
});

// Avoid large objects in per-log context
logger.info('User action', {
  userId: '123',
  action: 'login'
  // Don't include: largeUserObject, fullRequestBody, etc.
});

// Use context snapshots for debugging
const contextSnapshot = contextManager.snapshot(largeContext);
logger.debug('Context snapshot created', {
  snapshotId: contextSnapshot.timestamp,
  size: contextSnapshot.size,
  depth: contextSnapshot.depth
});
```

## Migration Guide

If you're migrating from other logging libraries:

### From Winston

```typescript
// Winston
const winston = require('winston');
const logger = winston.createLogger({
  defaultMeta: { service: 'user-service' }
});

logger.info('Hello world', { userId: '123' });

// MagicLogger equivalent
const logger = new Logger({
  context: { service: 'user-service' }
});

logger.info('Hello world', { userId: '123' });
```

### From Bunyan

```typescript
// Bunyan
const bunyan = require('bunyan');
const logger = bunyan.createLogger({
  name: 'myapp',
  service: 'user-service'
});

logger.info({ userId: '123' }, 'Hello world');

// MagicLogger equivalent
const logger = new Logger({
  id: 'myapp',
  context: { service: 'user-service' }
});

logger.info('Hello world', { userId: '123' });
```

## Conclusion

Context and tags are powerful features that enable structured, searchable, and well-organized logging. Use context for rich metadata and tags for categorization and filtering. The new `ContextManager` and `TagManager` components provide advanced functionality for complex logging scenarios.

For more information, see:
- [Transport Documentation](./intro.md#-multiple-transports)
- [API Reference](./api_usage.md)
- [Examples](https://github.com/manicinc/magiclogger/tree/main/examples)