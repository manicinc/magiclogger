# Class: PlainTextFormatter

Defined in: [src/transports/formatters/PlainTextFormatter.ts:128](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L128)

Formats log entries as human-readable plain text.

The PlainTextFormatter provides flexible text output with:
- Customizable timestamp formats
- Field inclusion/exclusion
- Template-based formatting
- Line length limits
- Stack trace formatting

## Example

```typescript
const formatter = new PlainTextFormatter({
  timestampFormat: 'locale',
  includeStack: true,
  template: '[{timestamp}] [{level}] {message}'
});

const output = formatter.format(logEntry);
console.log(output);
```

## Constructors

### Constructor

> **new PlainTextFormatter**(`options?`): `PlainTextFormatter`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:159](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L159)

Creates a new PlainTextFormatter instance.

#### Parameters

##### options?

[`PlainTextFormatterOptions`](../interfaces/PlainTextFormatterOptions.md) = `{}`

Formatter options

#### Returns

`PlainTextFormatter`

## Methods

### format()

> **format**(`entry`): `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:186](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L186)

Format a log entry as plain text.

#### Parameters

##### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string`

Plain text formatted string

***

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:200](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L200)

Format multiple log entries.

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries

#### Returns

`string`

Formatted entries joined by EOL
