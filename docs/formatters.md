# Formatters

Comprehensive guide to MagicLogger output formatters. These control how each log entry is serialized before being written by a transport.

## Available Formatters

- PlainTextFormatter (human-friendly text, configurable fields, templates, presets)
- JSONFormatter (structured JSON / NDJSON, field filtering, flattening presets)
- XMLFormatter (hierarchical XML document or single log element)
- CSVFormatter (tabular CSV with stable column set; good for spreadsheet / BI ingestion)
- CustomFormatter base (abstract class to implement new structured formats)
- FunctionFormatter (pass a function instead of subclassing for quick custom output)

> Quick custom formatting: Use `FunctionFormatter` if you just need to map a log entry to a string/Buffer inline without creating a subclass.

## PlainTextFormatter

Best for console / file readability.

Key options:
- timestampFormat: 'ISO' | 'unix' | 'locale' | 'custom'
- includeTimestamp / includeLevel / includeLoggerId / includeTags
- includeContext / includeMetadata / includeStack
- maxLineLength + truncationIndicator
- template string with placeholders like `{timestamp}`, `{level}`, `{message}`, `{context.user}`.

Example:
```ts
import { PlainTextFormatter } from 'magiclogger/transports/console';
const f = new PlainTextFormatter({ template: '[{timestamp}] [{level}] {message}', includeStack: false });
transport.setFormatter(f);
```

Presets (`PlainTextFormatters`): simple(), detailed(), syslog(), apache(), minimal().

## JSONFormatter

Structured output for ingestion by log processors.

Features:
- includeFields / excludeFields (exclude wins)
- flatten + maxFlattenDepth (convert shallow nested objects to dotted keys)
- includeSchema (emit `$schema` object once or per batch depending on transport usage)
- replacer for custom serialization (e.g. redacting secrets)
- format() returns a single JSON line; formatBatch() joins with `\n`; `formatStream()` (if present in transport integration) may append `\n` for NDJSON.

Example NDJSON stream:
```ts
const f = new JSONFormatter({ includeSchema: false });
entries.forEach(e => stream.write(f.format(e) + '\n'));
```

Presets (`JSONFormatters`): compact(), pretty(), flat(), minimal(), extended().

## XMLFormatter

Produces XML for interoperability with systems expecting hierarchical or verbose structured logs.

- format(entry) => `<log ...>...</log>`
- formatBatch(entries) => XML document with declaration and `<logs>` root.
- Escapes XML entities and nests context / metadata / error.

Example:
```ts
import { XMLFormatter } from 'magiclogger/transports/formatters';
const xf = new XMLFormatter();
const xmlDoc = xf.formatBatch(entries);
```

## CSVFormatter

Tabular output ideal for spreadsheets, Athena, BigQuery (after external load), or ad-hoc analysis.

Columns (fixed order): `timestamp,level,message,loggerId,tags,error.name,error.message,context,metadata`.
- context & metadata columns are JSON-serialized objects
- tags joined by `;`
- Error name/message isolated for easy filtering
- RFC 4180 escaping (quotes doubled, fields wrapped if containing comma, quote, CR/LF)
- formatBatch adds header row when includeHeaders = true (default) and appends trailing `\n`.

Example:
```ts
import { CSVFormatter } from 'magiclogger/transports/formatters';
const cf = new CSVFormatter();
fs.writeFileSync('logs.csv', cf.formatBatch(entries));
```

## Implementing a Custom Formatter

Extend the abstract base:
```ts
import { CustomFormatter } from 'magiclogger/transports/formatters';
class LineFormatter extends CustomFormatter {
  format(entry) { return `${entry.timestamp} ${entry.level} ${entry.message}`; }
}
```

Or wrap it in a transport:
```ts
transport.setFormatter(new LineFormatter());
```

## Choosing a Format

| Use Case | Recommended |
|----------|-------------|
| Human debugging | PlainText (simple/detailed) |
| Structured ingestion (ELK, Datadog) | JSON (compact/extended) |
| XML pipeline interoperability | XMLFormatter |
| Spreadsheet / CSV loader | CSVFormatter |
| Highly specialized legacy schema | CustomFormatter subclass |

## Converting Between Formats

Because entries retain full structured data until formatting, you can:
1. Capture structured logs with JSONFormatter into a file.
2. Later transform JSON to CSV: parse each line and re-render with CSVFormatter.

Sketch:
```ts
import { CSVFormatter } from 'magiclogger/transports/formatters';
const cf = new CSVFormatter();
const rows = jsonLines.map(line => cf.format(JSON.parse(line))); // if shape aligns with LogEntry
```

For lossless conversion, prefer re-logging original LogEntry objects rather than parsing formatted text.

## Stream & Batch Behavior

- PlainTextFormatter.formatBatch joins lines and appends EOL.
- JSONFormatter.formatBatch joins JSON strings with `\n` (no trailing by default) for NDJSON-like blocks.
- XMLFormatter.formatBatch produces full XML document with declaration.
- CSVFormatter.formatBatch prepends header (optional) and always appends trailing newline.

## Future Extensions

Potential additions (not yet implemented):
- YAMLFormatter
- ParquetFormatter (offloaded via worker & dependency opt-in)
- HTMLFormatter (interactive log report)

Contributions welcome—extend `CustomFormatter` and open a PR.
