# Interface: PlainTextFormatterOptions

Defined in: [src/transports/formatters/PlainTextFormatter.ts:8](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L8)

Options for plain text formatting.

## Properties

### customTimestamp()?

> `optional` **customTimestamp**: (`date`) => `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L19)

Custom timestamp formatter function.
Used when timestampFormat is 'custom'.

#### Parameters

##### date

`Date`

#### Returns

`string`

***

### eol?

> `optional` **eol**: `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:85](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L85)

Line ending character.

#### Default

```ts
'\n'
```

***

### fieldSeparator?

> `optional` **fieldSeparator**: `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:79](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L79)

Field separator.

#### Default

```ts
' '
```

***

### includeContext?

> `optional` **includeContext**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L67)

Whether to include context data.

#### Default

```ts
true
```

***

### includeLevel?

> `optional` **includeLevel**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L31)

Whether to include log level.

#### Default

```ts
true
```

***

### includeLoggerId?

> `optional` **includeLoggerId**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L43)

Whether to include logger ID.

#### Default

```ts
true
```

***

### includeMetadata?

> `optional` **includeMetadata**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:73](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L73)

Whether to include metadata.

#### Default

```ts
false
```

***

### includeStack?

> `optional` **includeStack**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:61](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L61)

Whether to include error stack traces.

#### Default

```ts
true
```

***

### includeTags?

> `optional` **includeTags**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L49)

Whether to include tags.

#### Default

```ts
true
```

***

### includeTimestamp?

> `optional` **includeTimestamp**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:25](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L25)

Whether to include timestamp.

#### Default

```ts
true
```

***

### maxLineLength?

> `optional` **maxLineLength**: `number`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:91](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L91)

Maximum line length (0 = no limit).

#### Default

```ts
0
```

***

### tagSeparator?

> `optional` **tagSeparator**: `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L55)

Separator for tags.

#### Default

```ts
','
```

***

### template?

> `optional` **template**: `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:103](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L103)

Template string for custom formatting.
Supports placeholders: {timestamp}, {level}, {message}, etc.

***

### timestampFormat?

> `optional` **timestampFormat**: `"custom"` \| `"ISO"` \| `"unix"` \| `"locale"`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L13)

Timestamp format.

#### Default

```ts
'ISO' - ISO 8601 format
```

***

### truncationIndicator?

> `optional` **truncationIndicator**: `string`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:97](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L97)

Truncation indicator.

#### Default

```ts
'...'
```

***

### uppercaseLevel?

> `optional` **uppercaseLevel**: `boolean`

Defined in: [src/transports/formatters/PlainTextFormatter.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/PlainTextFormatter.ts#L37)

Whether to uppercase log level.

#### Default

```ts
true
```
