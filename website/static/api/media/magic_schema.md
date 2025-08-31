# MAGIC Schema Specification - Universal Color Logging Standard

## Overview

The **MAGIC Schema** (MAgicLogger Generic Interface for Consistency) is the first **universal standard for preserving text styling in structured logs**. It enables any programming language to generate styled logs that can be consumed, transported, and displayed with full color preservation across any platform or tool.

### 🎨 The Color Preservation Problem

Traditionally, colored console output is lost when logs are:
- Serialized to JSON
- Stored in databases
- Sent over networks
- Aggregated in observability platforms

MAGIC Schema solves this by **separating content from presentation** - storing plain text with style ranges that can be reconstructed anywhere.

### 🌍 Universal Interoperability Vision

The MAGIC Schema enables any language to produce styled logs that preserve formatting:

```python
# Future: Python SDK could generate MAGIC-compliant logs
# Input: "<red.bold>FATAL:</> Database <yellow>connection lost</>"
```
↓ Would produce MAGIC JSON ↓
```json
{
  "message": "FATAL: Database connection lost",
  "styles": [[0, 6, "red.bold"], [17, 32, "yellow"]],
  "level": "error",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
↓ Any MAGIC-aware system could reconstruct ↓
```typescript
// Current: TypeScript MagicLogger can reconstruct styled output
function displayMagicLog(entry: MAGICLogEntry) {
  const styled = applyStyles(entry.message, entry.styles);
  console.log(styled);  // Shows colors in terminal
}
```

### What Exists Today

- ✅ **MAGIC Schema Specification**: Complete and open source
- ✅ **TypeScript Implementation**: Full support for generating and displaying MAGIC logs
- ✅ **Style Extraction/Reconstruction**: Working algorithms in TypeScript
- 🌍 **Other Languages**: Schema is ready for community implementations

## Design Principles

1. **Style Preservation**: Colors and formatting survive serialization as structured data
2. **Language Agnostic**: Any language can produce/consume MAGIC-compliant logs
3. **Transport Resilient**: Styles survive JSON, databases, HTTP, message queues
4. **Platform Portable**: View styled logs in terminals, web UIs, IDEs, observability tools
5. **Backward Compatible**: Plain text fallback for non-MAGIC-aware systems
6. **Performance Optimized**: Compact array format minimizes overhead
7. **Observability Ready**: Direct mapping to OpenTelemetry, Loki, Elasticsearch
8. **Privacy First**: Built-in support for redaction and PII handling
9. **Versioned**: Forward and backward compatibility through schema versioning
10. **Extensible**: Allows custom fields while maintaining core compatibility

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
  message: string                      // Plain text message (no ANSI codes)
  styles?: Array<[number, number, string]>  // Optional: [start, end, style] ranges

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
- **`message`**: Plain text message without any formatting codes
- **`styles`**: Optional array of style ranges, each containing:
  - `[0]` (start): Starting character index (0-based)
  - `[1]` (end): Ending character index (exclusive)
  - `[2]` (style): Style descriptor (e.g., "red.bold" or "cyan.underline")

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

## Style Storage Optimization

The `styles` field provides an efficient way to store formatting information separately from the message content. This approach:

1. **Reduces Redundancy**: No need to store both styled and plain versions
2. **Enables Reconstruction**: Styles can be reapplied for console output
3. **Supports Multiple Formats**: Can store semantic styles ("red.bold") or ANSI codes
4. **Minimizes Payload**: Compact array format reduces JSON size

### Example

```typescript
// Input with styles
logger.info('<red.bold>Error:</> User <cyan>john@example.com</> not found');

// Stored as:
{
  "message": "Error: User john@example.com not found",
  "styles": [
    [0, 6, "red.bold"],      // "Error:" in red.bold
    [12, 29, "cyan"]         // "john@example.com" in cyan
  ]
}

// Reconstructing styled output:
function applyStyles(message: string, styles?: Array<[number, number, string]>) {
  if (!styles || !styles.length) return message;
  
  let result = '';
  let lastEnd = 0;
  
  for (const [start, end, style] of styles) {
    result += message.slice(lastEnd, start);
    result += applyStyle(message.slice(start, end), style);
    lastEnd = end;
  }
  result += message.slice(lastEnd);
  
  return result;
}
```

## Implementing MAGIC in Other Languages

### Implementation Guide

To create a MAGIC-compliant logger in any language, follow these steps:

#### 1. Style Extraction
Parse your styled text format (e.g., `<red>text</>`) and extract:
- Plain text without markup
- Array of style ranges `[startIndex, endIndex, styleDescriptor]`

#### 2. JSON Structure
Output the following JSON structure:

```json
{
  "id": "unique-id",
  "timestamp": "ISO-8601-timestamp",
  "timestampMs": 1234567890,
  "level": "info|warn|error|debug|trace|fatal",
  "message": "plain text without styles",
  "styles": [[0, 6, "red.bold"], [12, 20, "cyan"]],
  "service": "your-service-name",
  "environment": "production"
}
```

#### 3. Style Descriptors
Use dot-notation for combined styles:
- Single: `"red"`, `"bold"`, `"underline"`
- Combined: `"red.bold"`, `"bg.blue.white"`
- Custom: `"custom.brandColor"`

#### 4. Reference Implementation

```python
# Example Python implementation (pseudocode)
import json
import re
from datetime import datetime

def extract_styles(text):
    """Extract plain text and style ranges from markup."""
    plain = ""
    styles = []
    offset = 0
    
    # Pattern: <style>content</>
    for match in re.finditer(r'<([^>]+)>([^<]*)</>', text):
        style, content = match.groups()
        start = len(plain)
        plain += content
        end = len(plain)
        styles.append([start, end, style])
    
    return plain, styles

def create_magic_log(level, styled_text, **context):
    """Create a MAGIC-compliant log entry."""
    plain_text, styles = extract_styles(styled_text)
    
    return {
        "id": f"{int(time.time() * 1000)}-{random_id()}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "timestampMs": int(time.time() * 1000),
        "level": level,
        "message": plain_text,
        "styles": styles if styles else None,
        **context
    }

# Usage
log = create_magic_log(
    "error",
    "<red.bold>Error:</> Failed to connect to <yellow>database</>",
    service="api",
    environment="production"
)
print(json.dumps(log))
```

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

<!-- WIP FOR POSSIBLE ROADMAP -->
<!-- 
## Conformance Testing

Each MagicLogger implementation includes conformance tests:

```bash
# Test schema compliance
npm run test:schema-conformance

# Validate against JSON Schema
npm run validate:schema fixtures/sample-entries.json

# Cross-language compatibility test
npm run test:cross-language -->
```

## Future Enhancements

### Roadmap

- **Conformance / Schema Compliance Tester Scripts**
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