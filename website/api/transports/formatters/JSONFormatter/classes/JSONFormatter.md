# Class: JSONFormatter

Defined in: [src/transports/formatters/JSONFormatter.ts:91](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L91)

Formats log entries as JSON with various options.

The JSONFormatter provides flexible JSON output with:
- Field filtering and exclusion
- Object flattening for easier parsing
- Custom replacer functions
- Pretty printing for readability
- Schema versioning

## Example

```typescript
const formatter = new JSONFormatter({
  pretty: true,
  excludeFields: ['metadata'],
  flatten: true
});

const output = formatter.format(logEntry);
console.log(output);
```

## Constructors

### Constructor

> **new JSONFormatter**(`options?`): `JSONFormatter`

Defined in: [src/transports/formatters/JSONFormatter.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L114)

Creates a new JSONFormatter instance.

#### Parameters

##### options?

[`JSONFormatterOptions`](../interfaces/JSONFormatterOptions.md) = `{}`

Formatter options

#### Returns

`JSONFormatter`

## Methods

### createReplacer()

> **createReplacer**(`userReplacer?`): (`key`, `value`) => `unknown`

Defined in: [src/transports/formatters/JSONFormatter.ts:278](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L278)

Create a custom replacer function that combines with user replacer.

#### Parameters

##### userReplacer?

(`key`, `value`) => `unknown`

User-provided replacer

#### Returns

Combined replacer function

> (`key`, `value`): `unknown`

##### Parameters

###### key

`string`

###### value

`unknown`

##### Returns

`unknown`

***

### format()

> **format**(`entry`): `string`

Defined in: [src/transports/formatters/JSONFormatter.ts:135](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L135)

Format a log entry as JSON.

#### Parameters

##### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string`

JSON formatted string

***

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: [src/transports/formatters/JSONFormatter.ts:161](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L161)

Format multiple log entries as a JSON array.

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries

#### Returns

`string`

JSON array string

***

### formatNDJSON()

> **formatNDJSON**(`entries`): `string`

Defined in: [src/transports/formatters/JSONFormatter.ts:189](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L189)

Format entries as newline-delimited JSON (NDJSON).

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries

#### Returns

`string`

NDJSON string

***

### getStreamFormatter()

> **getStreamFormatter**(): (`entry`) => `string`

Defined in: [src/transports/formatters/JSONFormatter.ts:311](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L311)

Get a streaming formatter function for use with streams.

#### Returns

Formatter function

> (`entry`): `string`

##### Parameters

###### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

##### Returns

`string`
