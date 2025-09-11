# Class: AsyncLogger

Defined in: [src/async/AsyncLogger.ts:314](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L314)

High-performance asynchronous logger using worker threads.

Offloads CPU-intensive operations like serialization and I/O to worker
threads, keeping the main event loop responsive. Ideal for high-throughput
applications that cannot afford blocking operations.

 AsyncLogger

## Since

1.0.0

## Examples

```typescript
const logger = new AsyncLogger({
  transports: [new ConsoleTransport()],
  worker: { poolSize: 2 }
});

// Non-blocking log operations
logger.info('Server started');
logger.error('Connection failed', { host: 'db.example.com' });

// Graceful shutdown
await logger.close();
```

```typescript
const logger = new AsyncLogger({
  enableMetrics: true,
  worker: {
    poolSize: 4,
    batchSize: 1000
  }
});

// Monitor performance
logger.on('metrics', (metrics) => {
  console.log(`Processed: ${metrics.totalLogs}`);
  console.log(`Worker utilization: ${metrics.workerUtilization}%`);
});
```

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new AsyncLogger**(`options?`): `AsyncLogger`

Defined in: [src/async/AsyncLogger.ts:397](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L397)

Creates a new AsyncLogger instance.

#### Parameters

##### options?

[`AsyncLoggerOptions`](../interfaces/AsyncLoggerOptions.md) = `{}`

Configuration options

#### Returns

`AsyncLogger`

#### Throws

If worker thread creation fails

#### Overrides

`EventEmitter.constructor`

## Accessors

### fmt

#### Get Signature

> **get** **fmt**(): [`TemplateFormatter`](../../../types/styling/type-aliases/TemplateFormatter.md)

Defined in: [src/async/AsyncLogger.ts:1146](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1146)

Template literal formatter for inline styling.
Uses the same TemplateParser as Logger for consistency.

##### Example

```typescript
const user = 'john';
logger.info(logger.fmt`@green.bold{User ${user}} logged in`);
logger.error(logger.fmt`@red{Error:} @yellow{${errorMessage}}`);
```

##### Returns

[`TemplateFormatter`](../../../types/styling/type-aliases/TemplateFormatter.md)

Template formatter function

***

### s

#### Get Signature

> **get** **s**(): [`IStyleBuilder`](../../../types/styling/interfaces/IStyleBuilder.md)

Defined in: [src/async/AsyncLogger.ts:1116](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1116)

Style chain for creating styled messages (matches Logger API).
Provides chainable style methods for text formatting.

##### Example

```typescript
logger.info(logger.s.red.bold('Error:') + ' Connection failed');
```

##### Returns

[`IStyleBuilder`](../../../types/styling/interfaces/IStyleBuilder.md)

Chainable style builder

***

### style

#### Get Signature

> **get** **style**(): [`IStyleBuilder`](../../../types/styling/interfaces/IStyleBuilder.md)

Defined in: [src/async/AsyncLogger.ts:1128](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1128)

Alias for the style builder (s).
Provides a more descriptive name for the chainable style API.

##### Returns

[`IStyleBuilder`](../../../types/styling/interfaces/IStyleBuilder.md)

Chainable style builder

## Methods

### addTransport()

> **addTransport**(`transport`): `void`

Defined in: [src/async/AsyncLogger.ts:1072](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1072)

Adds a transport to the logger.

#### Parameters

##### transport

[`Transport`](../../../types/transport/interfaces/Transport.md)

Transport to add

#### Returns

`void`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/async/AsyncLogger.ts:1175](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1175)

Closes the logger and terminates worker threads.

#### Returns

`Promise`\<`void`\>

Resolves when closed

#### Example

```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.close();
  process.exit(0);
});
```

***

### debug()

> **debug**(`message`, `meta?`): `object`

Defined in: [src/async/AsyncLogger.ts:963](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L963)

Logs a debug-level message.

#### Parameters

##### message

`string`

Debug message

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata

#### Returns

`object`

Result of the log operation

##### success

> **success**: `boolean`

***

### error()

> **error**(`message`, `error?`): `object`

Defined in: [src/async/AsyncLogger.ts:935](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L935)

Logs an error-level message.

#### Parameters

##### message

`string`

Error message

##### error?

Error or metadata

`Error` | `Record`\<`string`, `unknown`\>

#### Returns

`object`

Result of the log operation

##### success

> **success**: `boolean`

#### Example

```typescript
try {
  await database.connect();
} catch (error) {
  logger.error('Database connection failed', error);
}
```

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/async/AsyncLogger.ts:779](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L779)

Flushes the current batch to workers or transports.

#### Returns

`Promise`\<`void`\>

Promise that resolves when flush is complete

***

### flushAndWait()

> **flushAndWait**(): `Promise`\<`void`\>

Defined in: [src/async/AsyncLogger.ts:1060](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1060)

Flushes all pending logs and waits for completion.

#### Returns

`Promise`\<`void`\>

Promise that resolves when flush is complete

***

### getMetrics()

> **getMetrics**(): `AsyncLoggerMetrics`

Defined in: [src/async/AsyncLogger.ts:1017](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1017)

Gets current performance metrics.

#### Returns

`AsyncLoggerMetrics`

Current metrics

***

### getStats()

> **getStats**(): `object`

Defined in: [src/async/AsyncLogger.ts:1027](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1027)

Gets current logger statistics including buffer information.

#### Returns

`object`

Statistics object with buffer and performance info

##### buffer

> **buffer**: `object`

###### buffer.capacity

> **capacity**: `number`

###### buffer.current

> **current**: `number`

###### buffer.dropped

> **dropped**: `number`

###### buffer.size

> **size**: `number`

###### buffer.utilization

> **utilization**: `number`

##### metrics

> **metrics**: `AsyncLoggerMetrics`

***

### getUtilization()

> **getUtilization**(): `number`

Defined in: [src/async/AsyncLogger.ts:994](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L994)

Gets the current buffer utilization percentage.

#### Returns

`number`

Utilization percentage (0-100)

***

### info()

> **info**(`message`, `meta?`): `object`

Defined in: [src/async/AsyncLogger.ts:914](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L914)

Logs an info-level message.

#### Parameters

##### message

`string`

Message to log

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata

#### Returns

`object`

Result of the log operation

##### success

> **success**: `boolean`

#### Example

```typescript
logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });
```

***

### isBackpressured()

> **isBackpressured**(): `boolean`

Defined in: [src/async/AsyncLogger.ts:1006](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1006)

Checks if the logger is experiencing backpressure.

#### Returns

`boolean`

True if backpressured

***

### listTransports()

> **listTransports**(): `string`[]

Defined in: [src/async/AsyncLogger.ts:1100](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1100)

Lists all transport names.

#### Returns

`string`[]

Array of transport names

***

### logCritical()

> **logCritical**(`level`, `message`, `meta?`): `Promise`\<`void`\>

Defined in: [src/async/AsyncLogger.ts:976](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L976)

Logs a critical message with retry on failure.

#### Parameters

##### level

`string`

Log level

##### message

`string`

Log message

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata

#### Returns

`Promise`\<`void`\>

Promise that resolves when logged

***

### removeTransport()

> **removeTransport**(`name`): `void`

Defined in: [src/async/AsyncLogger.ts:1086](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1086)

Removes a transport from the logger.

#### Parameters

##### name

`string`

Name of transport to remove

#### Returns

`void`

***

### waitForReady()

> **waitForReady**(): `Promise`\<`void`\>

Defined in: [src/async/AsyncLogger.ts:1156](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1156)

Waits for logger initialization to complete.

#### Returns

`Promise`\<`void`\>

Resolves when ready

***

### warn()

> **warn**(`message`, `meta?`): `object`

Defined in: [src/async/AsyncLogger.ts:951](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L951)

Logs a warning-level message.

#### Parameters

##### message

`string`

Warning message

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata

#### Returns

`object`

Result of the log operation

##### success

> **success**: `boolean`
