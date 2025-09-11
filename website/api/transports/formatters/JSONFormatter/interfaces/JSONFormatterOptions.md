# Interface: JSONFormatterOptions

Defined in: [src/transports/formatters/JSONFormatter.ts:8](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L8)

Options for JSON formatting.

## Properties

### excludeFields?

> `optional` **excludeFields**: keyof [`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

Defined in: [src/transports/formatters/JSONFormatter.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L31)

Fields to exclude from the output.
Takes precedence over includeFields.

***

### flatten?

> `optional` **flatten**: `boolean`

Defined in: [src/transports/formatters/JSONFormatter.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L37)

Whether to flatten nested objects.

#### Default

```ts
false
```

***

### flattenSeparator?

> `optional` **flattenSeparator**: `string`

Defined in: [src/transports/formatters/JSONFormatter.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L43)

Separator for flattened keys.

#### Default

```ts
'.'
```

***

### includeFields?

> `optional` **includeFields**: keyof [`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

Defined in: [src/transports/formatters/JSONFormatter.ts:25](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L25)

Fields to include in the output.
If not specified, all fields are included.

***

### includeSchema?

> `optional` **includeSchema**: `boolean`

Defined in: [src/transports/formatters/JSONFormatter.ts:60](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L60)

Whether to include a schema version.

#### Default

```ts
true
```

***

### indent?

> `optional` **indent**: `number`

Defined in: [src/transports/formatters/JSONFormatter.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L19)

Number of spaces for indentation when pretty-printing.

#### Default

```ts
2
```

***

### maxFlattenDepth?

> `optional` **maxFlattenDepth**: `number`

Defined in: [src/transports/formatters/JSONFormatter.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L49)

Maximum depth for flattening.

#### Default

```ts
3
```

***

### pretty?

> `optional` **pretty**: `boolean`

Defined in: [src/transports/formatters/JSONFormatter.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L13)

Whether to pretty-print JSON with indentation.

#### Default

```ts
false
```

***

### replacer()?

> `optional` **replacer**: (`key`, `value`) => `unknown`

Defined in: [src/transports/formatters/JSONFormatter.ts:54](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L54)

Custom replacer function for JSON.stringify.

#### Parameters

##### key

`string`

##### value

`unknown`

#### Returns

`unknown`

***

### schemaVersion?

> `optional` **schemaVersion**: `string`

Defined in: [src/transports/formatters/JSONFormatter.ts:66](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/JSONFormatter.ts#L66)

Schema version string.

#### Default

```ts
'1.0'
```
