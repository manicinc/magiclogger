# The MAGIC Schema: Design Philosophy & Implementation

## The Problem We Solved

Traditional logging systems face a fundamental limitation: **style information is lost the moment logs leave the console**. When you write `console.log('\x1b[36mHello\x1b[0m')`, that ANSI escape sequence becomes meaningless once serialized to JSON, sent over HTTP, or stored in a database. Every logging system has tried to solve this differently, creating a fragmented ecosystem where:

- **Logs lose their visual hierarchy** in production dashboards
- **Developers can't distinguish log types** at a glance
- **Important errors blend into walls of text**
- **Each transport reinvents styling** incompatibly

## How the MAGIC Schema Works

The MAGIC (MagicLogger Agnostic Generic Interface for Consistency) schema **separates content from presentation** using a structured format that preserves styling intent:

```typescript
{
  "message": "Server started on port 3000",  // Plain text
  "styles": [                                // Style ranges
    { "start": 0, "end": 14, "styles": ["green", "bold"] },
    { "start": 23, "end": 27, "styles": ["yellow"] }
  ]
}
```

This approach mirrors how rich text editors work - storing formatting as metadata rather than inline markup. The benefits:

1. **Transport Agnostic**: Works equally well in JSON, MessagePack, Protocol Buffers
2. **Language Agnostic**: Any language can produce/consume MAGIC-compliant logs
3. **Backward Compatible**: Plain text still readable without style processing
4. **Efficient**: Style ranges compress better than repeated escape sequences
5. **Queryable**: Can search/filter by styles (e.g., find all "red" errors)

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
    { "start": 0, "end": 10, "theme": "error.critical" }
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

## Real-World Benefits

**In Development**: See beautifully formatted logs in your terminal
**In Production**: Same styling appears in Datadog, Elastic, Grafana
**In Debugging**: Color-coded logs make patterns instantly visible
**In Compliance**: Audit logs maintain visual distinction for security events

## Performance Trade-offs

Yes, MAGIC adds ~15-20% overhead compared to plain text logging:

- **Extra bytes**: Style metadata adds 50-200 bytes per log
- **Processing time**: ~2-5μs to apply styles per log
- **Memory**: Style tree caching uses ~1KB per unique log pattern

But consider:
- **135,000+ styled logs/sec** is still faster than most apps need
- **Visual clarity saves hours** of debugging time
- **Standardization enables tooling** that wasn't possible before

## Implementation Details

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

## Specification

For the complete MAGIC schema specification, see [magic_schema.md](./magic_schema.md).

## Related Documentation

- [Custom Colors](./custom_colors) - How themes and colors work with MAGIC
- [Context and Tags](./context-and-tags) - Tag-based styling system
- [Architecture](./architecture) - Overall system design