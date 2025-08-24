# MAGIC Schema Specification

## Overview

The **MAGIC Schema** (MAgicLogger Generic Interface for Consistency) is an open, standardized format for structured log entries that enables seamless integration across different programming languages, platforms, and observability tools. This schema serves as the canonical format for all MagicLogger implementations and provides the foundation for a unified, cross-language logging ecosystem.

## Design Principles

1. **Language Agnostic**: Schema works across Node.js, Python, Go, Java, .NET, Rust, and other languages
2. **Transport Compatible**: Optimized for Loki, Elasticsearch, OTLP, and other observability backends
3. **Privacy First**: Built-in support for redaction and PII handling
4. **Versioned**: Forward and backward compatibility through schema versioning
5. **Extensible**: Allows custom fields while maintaining core compatibility

## Schema Definition v1

```typescript
interface MAGICLogEntry {
  // === IDENTITY & TIMING ===
  id: string                           // Unique identifier: "1733938475123-abc123xyz"
  timestamp: string                    // ISO 8601: "2025-08-14T12:34:35.123Z"
  timestampMs: number                  // Unix milliseconds: 1765769675123
  schemaVersion: "v1"                  // Schema version for compatibility

  // === CORE CONTENT ===
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal"
  message: string                      // Final formatted message (may include ANSI)
  plainMessage: string                 // ANSI-free version for backends

  // === LOGGER CONTEXT ===
  loggerId?: string                    // Logger instance identifier
  service?: string                     // Service name (for microservices)
  environment?: string                 // Environment: "dev", "staging", "prod"
  tags?: string[]                      // Categorization tags

  // === STRUCTURED DATA ===
  context?: Record<string, any>        // User-provided structured data
  error?: {                            // Structured error information
    name: string
    message: string
    stack?: string
    code?: string | number
    cause?: any
  }

  // === RUNTIME METADATA ===
  metadata?: {
    hostname?: string                  // Host identifier
    pid?: number                       // Process ID
    platform?: string                 // Runtime platform
    nodeVersion?: string               // Node.js version (or runtime version)
    userAgent?: string                 // Browser user agent (browser environments)
  }

  // === DISTRIBUTED TRACING (OpenTelemetry compatible) ===
  trace?: {
    traceId?: string                   // Distributed trace ID
    spanId?: string                    // Current span ID
    parentSpanId?: string              // Parent span ID
  }
}
```

## Field Specifications

### Identity & Timing

- **`id`**: Globally unique identifier combining timestamp and random component
- **`timestamp`**: ISO 8601 formatted timestamp with millisecond precision
- **`timestampMs`**: Unix timestamp in milliseconds for efficient sorting
- **`schemaVersion`**: Version identifier for schema evolution

### Core Content

- **`level`**: Standardized severity levels compatible with syslog RFC5424
- **`message`**: Human-readable message, potentially with ANSI color codes
- **`plainMessage`**: ANSI-stripped version for structured storage

### Logger Context

- **`loggerId`**: Identifies the logger instance (useful in multi-logger apps)
- **`service`**: Service name for microservice architectures
- **`environment`**: Deployment environment for filtering and routing
- **`tags`**: Array of categorization tags for flexible filtering

### Structured Data

- **`context`**: Arbitrary structured data provided by the application
- **`error`**: Standardized error representation with stack traces

### Runtime Metadata

- **`metadata`**: Automatically collected runtime information
- **`trace`**: OpenTelemetry-compatible distributed tracing context

## Transport Mappings

### Loki

```typescript
// Labels (indexed)
{
  "app": entry.service,
  "environment": entry.environment,
  "level": entry.level,
  "logger": entry.loggerId
}

// Log line
{
  "timestamp": entry.timestampMs * 1000000, // Convert to nanoseconds
  "line": JSON.stringify({
    id: entry.id,
    message: entry.plainMessage,
    context: entry.context,
    error: entry.error,
    metadata: entry.metadata,
    trace: entry.trace
  })
}
```

### Elasticsearch/OpenSearch

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "timestamp": { "type": "date" },
      "timestampMs": { "type": "long" },
      "level": { "type": "keyword" },
      "message": { "type": "text", "analyzer": "standard" },
      "plainMessage": { "type": "text", "analyzer": "standard" },
      "loggerId": { "type": "keyword" },
      "service": { "type": "keyword" },
      "environment": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "context": { "type": "object", "dynamic": true },
      "error": {
        "properties": {
          "name": { "type": "keyword" },
          "message": { "type": "text" },
          "stack": { "type": "text", "index": false },
          "code": { "type": "keyword" }
        }
      },
      "metadata": { "type": "object", "dynamic": true },
      "trace": {
        "properties": {
          "traceId": { "type": "keyword" },
          "spanId": { "type": "keyword" },
          "parentSpanId": { "type": "keyword" }
        }
      },
      "schemaVersion": { "type": "keyword" }
    }
  }
}
```

### OTLP (OpenTelemetry Protocol)

```typescript
// Resource attributes
{
  "service.name": entry.service,
  "service.version": entry.metadata?.nodeVersion,
  "deployment.environment": entry.environment,
  "host.name": entry.metadata?.hostname
}

// Log record
{
  "timeUnixNano": entry.timestampMs * 1000000,
  "severityNumber": levelToOTLP(entry.level),
  "severityText": entry.level.toUpperCase(),
  "body": { "stringValue": entry.plainMessage },
  "attributes": {
    "log.id": entry.id,
    "log.logger": entry.loggerId,
    ...flattenObject(entry.context),
    ...flattenObject(entry.metadata)
  },
  "traceId": entry.trace?.traceId,
  "spanId": entry.trace?.spanId
}
```

## Cross-Language Implementation Examples

### Node.js (MagicLogger)

```typescript
import { createLogger } from 'magiclogger';

const logger = createLogger({
  service: "api-gateway",
  environment: "production",
  tags: ["http", "auth"],
  onFlush: async (entries: MAGICLogEntry[]) => {
    await transport.sendBatch(entries);
  }
});

logger.info("Request processed", {
  userId: "123",
  duration: 45,
  path: "/api/users"
});
```

### Python (Future Implementation)

```python
from magiclogger import create_logger

logger = create_logger(
    service="data-processor",
    environment="production",
    tags=["etl", "batch"],
    transports=[LokiTransport()]
)

logger.info("Data processed", {
    "records": 1000,
    "duration": 2.5,
    "source": "s3://bucket/data.csv"
})
```

### Go (Future Implementation)

```go
package main

import "github.com/magiclogger/magiclogger-go"

func main() {
    logger := magiclog.NewLogger(magiclog.Config{
        Service: "worker-service",
        Environment: "production",
        Tags: []string{"worker", "background"},
        Transport: &LokiTransport{},
    })
    
    logger.Info("Job completed", magiclog.Fields{
        "jobId": "abc123",
        "duration": "30s",
        "result": "success",
    })
}
```

## Redaction & Privacy

The MAGIC schema includes built-in privacy controls that work consistently across all implementations:

### Pattern-Based Redaction

```typescript
const logger = createLogger({
  redactor: {
    patterns: [
      {
        name: 'email',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        replacement: '[EMAIL]'
      },
      {
        name: 'ssn',
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        replacement: '[SSN]'
      },
      {
        name: 'creditCard',
        pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        replacement: '**** **** **** ****'
      }
    ]
  }
});
```

### Field-Based Redaction

```typescript
const logger = createLogger({
  redactor: {
    fields: ['password', 'token', 'secret', 'apiKey', 'creditCard'],
    strategy: 'redact' // or 'hash', 'mask'
  }
});

// Input
logger.info("User login", {
  email: "user@example.com",
  password: "secret123",
  token: "eyJhbGciOiJIUzI1NiIs..."
});

// Output (after redaction)
{
  "message": "User login",
  "context": {
    "email": "[EMAIL]",
    "password": "[REDACTED]",
    "token": "[REDACTED]"
  }
}
```

### Semantic Redaction

```typescript
const logger = createLogger({
  redactor: {
    semantic: {
      emails: 'hash',      // Hash emails consistently
      ips: 'mask',         // Mask IP addresses
      phones: 'redact',    // Remove phone numbers
      urls: 'domain'       // Keep domain, remove path/query
    }
  }
});
```

## Schema Evolution

### Version Compatibility

- **Forward Compatibility**: New fields can be added without breaking existing consumers
- **Backward Compatibility**: Old consumers can ignore unknown fields
- **Version Detection**: `schemaVersion` field enables consumers to handle different versions

### Migration Strategy

```typescript
// Schema version detection
function processLogEntry(entry: any) {
  switch (entry.schemaVersion) {
    case 'v1':
      return processV1Entry(entry);
    case 'v2':
      return processV2Entry(entry);
    default:
      // Fallback to latest known version
      return processV1Entry(entry);
  }
}
```

## Conformance Testing

Each MagicLogger implementation includes conformance tests:

```bash
# Test schema compliance
npm run test:schema-conformance

# Validate against JSON Schema
npm run validate:schema fixtures/sample-entries.json

# Cross-language compatibility test
npm run test:cross-language
```

## Future Enhancements

### Planned v2 Features

- **Binary Encoding**: Protobuf/MessagePack support for efficiency
- **Structured Tags**: Hierarchical tag support (`service.api.auth`)
- **Sampling Metadata**: Include sampling decisions in schema
- **Performance Metrics**: Built-in latency and throughput tracking

### Ecosystem Roadmap

- **MAGIC Dashboard**: Universal log analysis platform
- **Query Language**: SQL-like syntax for cross-service log queries
- **Alerting Engine**: Smart alerting based on log patterns
- **Metrics Extraction**: Automatic SLI/SLO metrics from logs

## Contributing

The MAGIC schema is an open standard. Contributions and feedback are welcome:

1. **Schema Changes**: Propose changes via GitHub issues
2. **Implementation Guidelines**: Help define best practices
3. **Transport Mappings**: Add support for new observability backends
4. **Language Implementations**: Port MagicLogger to new languages

## License

The MAGIC schema specification is released under MIT license, ensuring broad adoption and compatibility across the ecosystem.