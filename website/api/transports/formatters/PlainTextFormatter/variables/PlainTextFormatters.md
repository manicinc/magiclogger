# Variable: PlainTextFormatters

> `const` **PlainTextFormatters**: `object`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:469](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L469)

Create plain text formatters with common presets.

## Type Declaration

### apache()

> **apache**: () => [`PlainTextFormatter`](../classes/PlainTextFormatter.md)

Apache-style access log format.

#### Returns

[`PlainTextFormatter`](../classes/PlainTextFormatter.md)

### detailed()

> **detailed**: () => [`PlainTextFormatter`](../classes/PlainTextFormatter.md)

Detailed multi-line format.

#### Returns

[`PlainTextFormatter`](../classes/PlainTextFormatter.md)

### minimal()

> **minimal**: () => [`PlainTextFormatter`](../classes/PlainTextFormatter.md)

Minimal format with just timestamp and message.

#### Returns

[`PlainTextFormatter`](../classes/PlainTextFormatter.md)

### simple()

> **simple**: () => [`PlainTextFormatter`](../classes/PlainTextFormatter.md)

Simple single-line format.

#### Returns

[`PlainTextFormatter`](../classes/PlainTextFormatter.md)

### syslog()

> **syslog**: () => [`PlainTextFormatter`](../classes/PlainTextFormatter.md)

Syslog-style format.

#### Returns

[`PlainTextFormatter`](../classes/PlainTextFormatter.md)
