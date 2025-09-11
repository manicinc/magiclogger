# transports/formatters/XMLFormatter

XMLFormatter: Formats log entries as XML.

Produces either a single <log> element (via format) or a full XML document
with declaration and <logs> root when using formatBatch.

Design goals:
 - Deterministic element ordering
 - Proper XML escaping for attribute / element content
 - Graceful handling of nested objects (context, metadata) via recursive
   element emission with sanitized tag names
 - Safe stack inclusion using CDATA section to preserve formatting

This formatter intentionally avoids streaming partial fragments; if you need
streaming XML, consider a custom formatter that emits SAX-like events.

## Classes

- [XMLFormatter](classes/XMLFormatter.md)

## References

### default

Renames and re-exports [XMLFormatter](classes/XMLFormatter.md)
