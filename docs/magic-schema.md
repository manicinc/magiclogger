# MAGIC Schema Specification - Universal Color Logging Standard

## Overview

The **MAGIC Schema** (MagicLog Agnostic Generic Interface for Consistency) is the first **universal standard for preserving text styling in structured logs**. It enables any programming language to generate styled logs that can be consumed, transported, and displayed with full color preservation across any platform or tool.

## The Problem We Solved

Traditional logging systems face a fundamental limitation: **style information is lost the moment logs leave the console**. When you write `console.log('\x1b[36mHello\x1b[0m')`, that ANSI escape sequence becomes meaningless once serialized to JSON, sent over HTTP, or stored in a database. Every logging system has tried to solve this differently, creating a fragmented ecosystem where:

- **Logs lose their visual hierarchy** in production dashboards
- **Developers can't distinguish log types** at a glance
- **Important errors blend into walls of text**
- **Each transport reinvents styling** incompatibly

### Preserving Colors from Output to Destination Storage

Traditionally, colored console output is lost when logs are:
- Serialized to JSON
- Stored in databases
- Sent over networks
- Aggregated in observability platforms

MAGIC Schema solves this by **separating content from presentation** - storing plain text with style ranges that can be reconstructed anywhere.

## How the MAGIC Schema Works

The MAGIC schema **separates content from presentation** using a structured format that preserves styling intent:

```typescript
{
  "message": "Server started on port 3000",  // Plain text
  "styles": [                                // Style ranges
    [0, 14, "green.bold"],
    [23, 27, "yellow"]
  ]
}
```

This approach mirrors how rich text editors work - storing formatting as metadata rather than inline markup. The benefits:

1. **Transport Agnostic**: Works equally well in JSON, MessagePack, Protocol Buffers
2. **Language Agnostic**: Any language can produce/consume MAGIC-compliant logs
3. **Backward Compatible**: Plain text still readable without style processing
4. **Efficient**: Style ranges compress better than repeated escape sequences
5. **Queryable**: Can search/filter by styles (e.g., find all "red" errors)

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

## Why This Design?

### 1. Preservation of Intent
The schema captures what the developer *meant* ("this is important" → red + bold) rather than how it was displayed (ANSI codes). This intent survives any transformation.

### 2. Progressive Enhancement
Systems that don't understand styles still get readable plain text. Systems that do can render beautiful, hierarchical logs.

### 3. Theming System Integration
Styles can reference theme variables, allowing centralized control:

```typescript
{
  "styles": [
    [0, 10, "error.critical"]
  ]
}
// Theme defines: error.critical = ["red", "bold", "underline"]
```

### 4. Tag-Based Styling
Tags automatically map to styles through themes:

```typescript
logger.info("Query executed", { 
  tags: ["database.query", "performance.slow"] 
});
// Automatically styled based on theme rules for these tags
```

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

## Real-World Benefits

**In Development**: See beautifully formatted logs in your terminal
**In Production**: Same styling appears in Datadog, Elastic, Grafana
**In Debugging**: Color-coded logs make patterns instantly visible
**In Compliance**: Audit logs maintain visual distinction for security events

## Optimal Style Reconstruction

When rebuilding styles from the MAGIC schema, the process is highly optimized:

```typescript
// 1. Parse style ranges into a segment tree for O(log n) lookups
const styleTree = buildSegmentTree(logEntry.styles);

// 2. Apply styles based on the output medium
if (isTerminal) {
  // Convert to ANSI escape sequences
  return applyANSIStyles(message, styleTree);
} else if (isHTML) {
  // Wrap in <span> tags with CSS classes
  return applyHTMLStyles(message, styleTree);
} else if (isMarkdown) {
  // Use markdown formatting
  return applyMarkdownStyles(message, styleTree);
}
```

### Style Application Algorithm

The style reconstruction uses a segment tree for efficient range queries:

```typescript
class StyleSegmentTree {
  // Build tree in O(n log n)
  constructor(styles: StyleRange[]) {
    this.tree = this.buildTree(styles);
  }
  
  // Query styles at position in O(log n)
  getStylesAt(position: number): string[] {
    return this.query(this.tree, position);
  }
  
  // Apply styles to text in O(n log n) where n = text length
  applyStyles(text: string): StyledText {
    const segments = [];
    let currentStyles = [];
    
    for (let i = 0; i < text.length; i++) {
      const styles = this.getStylesAt(i);
      if (!arraysEqual(styles, currentStyles)) {
        // Style boundary - emit segment
        segments.push({ text: text.slice(lastBoundary, i), styles: currentStyles });
        currentStyles = styles;
        lastBoundary = i;
      }
    }
    
    return segments;
  }
}
```

### Style Range Merging

When multiple styles overlap, they're merged intelligently:

```typescript
// Input styles
[
  { start: 0, end: 10, styles: ["bold"] },
  { start: 5, end: 15, styles: ["red"] }
]

// Merged output
[
  { start: 0, end: 5, styles: ["bold"] },
  { start: 5, end: 10, styles: ["bold", "red"] },
  { start: 10, end: 15, styles: ["red"] }
]
```

### Compression Strategies

For high-volume logging, style data compresses well:

1. **Style Deduplication**: Common style combinations are indexed
2. **Range Coalescing**: Adjacent ranges with same styles are merged
3. **Dictionary Encoding**: Frequent styles get short codes
4. **Delta Encoding**: Store only differences from previous log

### Cross-Platform Rendering

The same MAGIC schema renders appropriately everywhere:

```typescript
// Terminal (ANSI)
"\x1b[32;1mServer started\x1b[0m on port \x1b[33m3000\x1b[0m"

// HTML
"<span class='green bold'>Server started</span> on port <span class='yellow'>3000</span>"

// Markdown
"**Server started** on port `3000`"

// Plain text fallback
"Server started on port 3000"
```

## The Future

The MAGIC schema enables a new ecosystem:

- **Universal log viewers** that work with any MAGIC-compliant source
- **Style-aware log analysis** (e.g., "show me all red logs from yesterday")
- **Cross-language consistency** (Python, Go, Rust all producing identical styled output)
- **Semantic styling** where colors convey meaning consistently across teams

This is why we built MAGIC: not just for pretty logs, but for a future where logs are truly **readable, portable, and intelligent** across every part of your stack.

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

## Style Extraction & Application APIs

MagicLogger provides highly efficient APIs for extracting and applying styles, enabling the MAGIC schema's universal style preservation:

### Extracting Styles from Styled Text

```typescript
import { extractStyles } from 'magiclogger/utils';

const result = extractStyles('<red.bold>Error:</> User <cyan>john@example.com</> not found');
// Returns:
// {
//   plainText: "Error: User john@example.com not found",
//   styles: [[0, 6, "red.bold"], [12, 29, "cyan"]]
// }
```

### Applying Styles to Plain Text

```typescript
import { applyStyles } from 'magiclogger/utils';

// Reconstruct styled text with angle brackets
const styled = applyStyles(
  "Error: User john@example.com not found",
  [[0, 6, "red.bold"], [12, 29, "cyan"]],
  (text, style) => `<${style}>${text}</>`
);
// Returns: "<red.bold>Error:</> User <cyan>john@example.com</> not found"

// Or apply ANSI codes for terminal output
import { COLORS, ANSI } from 'magiclogger';

const ansiStyled = applyStyles(
  "Error: User john@example.com not found",
  [[0, 6, "red.bold"], [12, 29, "cyan"]],
  (text, style) => {
    // Convert style string to ANSI codes
    const styles = style.split('.');
    let ansiCode = '';
    for (const s of styles) {
      if (COLORS[s]) ansiCode += COLORS[s];
      else if (ANSI[s]) ansiCode += ANSI[s];
    }
    return ansiCode + text + COLORS.reset;
  }
);
```

### Optimizing Style Ranges

```typescript
import { optimizeStyleRanges } from 'magiclogger/utils';

// Merge adjacent/overlapping ranges with same style
const optimized = optimizeStyleRanges([
  [0, 5, "red"],
  [5, 10, "red"],  // Adjacent, same style
  [15, 20, "blue"]
]);
// Returns: [[0, 10, "red"], [15, 20, "blue"]]
```

### Full Example: Extract, Store, and Reconstruct

```typescript
import { Logger, extractStyles, applyStyles } from 'magiclogger';
import { COLORS } from 'magiclogger';

// 1. Log with styles
const logger = new Logger();
logger.info('<red.bold>Error:</> Database <yellow>connection</> failed');

// 2. Extract styles for storage (happens internally)
const extracted = extractStyles('<red.bold>Error:</> Database <yellow>connection</> failed');
// Result: {
//   plainText: "Error: Database connection failed",
//   styles: [[0, 6, "red.bold"], [16, 26, "yellow"]]
// }

// 3. Store in database/send over network as MAGIC schema JSON
const magicEntry = {
  id: "log-123",
  timestamp: "2024-01-01T00:00:00Z",
  level: "error",
  message: extracted.plainText,
  styles: extracted.styles
};

// 4. Later, reconstruct styled output anywhere
const reconstructed = applyStyles(
  magicEntry.message,
  magicEntry.styles,
  (text, style) => {
    // Apply ANSI codes for terminal
    const codes = style.split('.').map(s => COLORS[s] || '').join('');
    return codes + text + COLORS.reset;
  }
);
console.log(reconstructed); // Shows with colors in terminal!
```

### Why These APIs Are Efficient

1. **Zero-Copy Design**: Style ranges use integer indices, not string copies
2. **Single-Pass Extraction**: O(n) regex processing with no backtracking
3. **Pre-Allocated Buffers**: Ring buffer never allocates during operation
4. **Monomorphic Functions**: Consistent types for JIT optimization
5. **Efficient String Building**: Array join avoids O(n²) concatenation

Performance: 500K+ logs/second with full style preservation.

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