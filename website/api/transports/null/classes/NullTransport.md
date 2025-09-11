# Class: NullTransport

Defined in: [src/transports/null/index.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L38)

Null transport that discards all logs without any I/O operations.

This transport is primarily used for:
- Performance benchmarking to measure logging overhead
- Testing logger behavior without side effects
- Disabling logging in specific environments

 NullTransport

## Implements

## Since

1.0.0

## Example

```typescript
// Use for benchmarking pure logging overhead
const logger = new Logger({
  transports: [new NullTransport()]
});

// All logs are discarded with minimal overhead
logger.info('This will be discarded');
```

## Implements

- [`Transport`](../../../types/transport/interfaces/Transport.md)

## Constructors

### Constructor

> **new NullTransport**(): `NullTransport`

#### Returns

`NullTransport`

## Properties

### enabled

> **enabled**: `boolean` = `true`

Defined in: [src/transports/null/index.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L49)

Whether the transport is enabled.

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`enabled`](../../../types/transport/interfaces/Transport.md#enabled)

***

### name

> `readonly` **name**: `"null"`

Defined in: [src/transports/null/index.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L43)

Transport name identifier.

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`name`](../../../types/transport/interfaces/Transport.md#name)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transports/null/index.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L65)

Closes the transport (no-op for null transport).

#### Returns

`Promise`\<`void`\>

Resolves immediately

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`close`](../../../types/transport/interfaces/Transport.md#close)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/null/index.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L96)

Flushes any buffered logs (no-op for null transport).

#### Returns

`Promise`\<`void`\>

Resolves immediately

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`flush`](../../../types/transport/interfaces/Transport.md#flush)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/transports/null/index.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L56)

Initializes the transport (no-op for null transport).

#### Returns

`Promise`\<`void`\>

Resolves immediately

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`init`](../../../types/transport/interfaces/Transport.md#init)

***

### log()

> **log**(`_entry`): `Promise`\<`void`\>

Defined in: [src/transports/null/index.ts:85](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L85)

Discards a log entry without any processing.

#### Parameters

##### \_entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

Log entry to discard

#### Returns

`Promise`\<`void`\>

Resolves immediately

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`log`](../../../types/transport/interfaces/Transport.md#log)

***

### shouldLog()

> **shouldLog**(`_entry?`): `boolean`

Defined in: [src/transports/null/index.ts:75](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/null/index.ts#L75)

Determines if a log entry should be processed.

#### Parameters

##### \_entry?

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

Log entry to check (unused)

#### Returns

`boolean`

Whether transport is enabled

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`shouldLog`](../../../types/transport/interfaces/Transport.md#shouldlog)
