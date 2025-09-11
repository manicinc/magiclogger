# Class: AsyncFileTransport

Defined in: [src/transports/AsyncFileTransport.ts:210](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L210)

High-performance asynchronous file transport using sonic-boom.

This transport provides enterprise-grade file logging with:
- Non-blocking I/O that doesn't slow down your application
- Automatic buffering and batching for optimal throughput
- Graceful error handling and recovery
- Support for log rotation via reopen()

Technical Implementation:
- Uses sonic-boom for high-performance async I/O
- Buffers writes in memory, flushes automatically
- No worker threads - runs in main thread for zero IPC overhead
- Implements synchronous logSync() method to avoid Promise overhead
- Handles backpressure automatically when buffers fill
- Provides detailed statistics for monitoring

Performance vs Previous Implementation:
- Previous (Worker Threads): ~45-85k ops/sec
- Current (sonic-boom): ~300k+ ops/sec
- 3-6x performance improvement

 AsyncFileTransport

## Examples

```typescript
const transport = new AsyncFileTransport({
  filepath: './logs/app.log'
});
await transport.init();
```

```typescript
const transport = new AsyncFileTransport({
  filepath: './logs/app.log',
  minLength: 4096,       // 4KB buffer before flush
  maxWrite: 16384,       // 16KB max write size
  mkdir: true,           // Create directory if needed
  retryEAGAIN: true,     // Retry on EAGAIN errors
  mode: 0o644,           // File permissions
  append: true           // Append to existing file
});
```

```typescript
// Rotate logs at midnight
setInterval(async () => {
  await transport.reopen();
}, 24 * 60 * 60 * 1000);
```

## Extends

- [`Transport`](../../base/classes/Transport.md)

## Constructors

### Constructor

> **new AsyncFileTransport**(`options`): `AsyncFileTransport`

Defined in: [src/transports/AsyncFileTransport.ts:250](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L250)

Creates a new AsyncFileTransport instance.

#### Parameters

##### options

[`AsyncFileTransportOptions`](../interfaces/AsyncFileTransportOptions.md)

Configuration options

#### Returns

`AsyncFileTransport`

#### Throws

If filepath is not provided

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`constructor`](../../base/classes/Transport.md#constructor)

## Properties

### closing

> `protected` **closing**: `boolean` = `false`

Defined in: [src/transports/AsyncFileTransport.ts:213](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L213)

Flag to track if transport is currently closing.

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`closing`](../../base/classes/Transport.md#closing)

***

### enabled

> **enabled**: `boolean`

Defined in: [src/transports/base/Transport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L70)

Whether this transport is currently active and processing logs.
Can be toggled at runtime to enable/disable specific transports.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`enabled`](../../base/classes/Transport.md#enabled)

***

### excludeTags?

> `protected` `readonly` `optional` **excludeTags**: `string`[]

Defined in: [src/transports/base/Transport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L114)

Tags that exclude logs from being processed.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`excludeTags`](../../base/classes/Transport.md#excludetags)

***

### filter()?

> `protected` `readonly` `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/transports/base/Transport.ts:120](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L120)

Custom filter function for advanced filtering.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`boolean`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`filter`](../../base/classes/Transport.md#filter)

***

### format

> `protected` `readonly` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/transports/base/Transport.ts:138](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L138)

Output format for this transport.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`format`](../../base/classes/Transport.md#format)

***

### formatter()?

> `protected` `readonly` `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:144](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L144)

Custom formatter function.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`formatter`](../../base/classes/Transport.md#formatter)

***

### initialized

> `protected` **initialized**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L150)

Flag to track if transport has been initialized.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`initialized`](../../base/classes/Transport.md#initialized)

***

### level

> `protected` `readonly` **level**: `string`

Defined in: [src/transports/base/Transport.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L96)

Minimum log level for this transport.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`level`](../../base/classes/Transport.md#level)

***

### levels?

> `protected` `readonly` `optional` **levels**: `string`[]

Defined in: [src/transports/base/Transport.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L102)

Specific levels this transport handles (if specified).

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`levels`](../../base/classes/Transport.md#levels)

***

### name

> `readonly` **name**: `string`

Defined in: [src/transports/base/Transport.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L64)

Unique identifier for this transport instance.
Used for managing multiple transports and debugging.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`name`](../../base/classes/Transport.md#name)

***

### options

> `protected` `readonly` **options**: `Required`\<[`AsyncFileTransportOptions`](../interfaces/AsyncFileTransportOptions.md)\>

Defined in: [src/transports/AsyncFileTransport.ts:212](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L212)

Transport configuration options.

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`options`](../../base/classes/Transport.md#options)

***

### silent

> `protected` `readonly` **silent**: `boolean`

Defined in: [src/transports/base/Transport.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L126)

Whether to suppress errors from this transport.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`silent`](../../base/classes/Transport.md#silent)

***

### stats

> `protected` **stats**: [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L82)

Statistics tracking for this transport.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`stats`](../../base/classes/Transport.md#stats)

***

### tags?

> `protected` `readonly` `optional` **tags**: `string`[]

Defined in: [src/transports/base/Transport.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L108)

Tags that must be present for logs to be processed.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`tags`](../../base/classes/Transport.md#tags)

***

### timeout

> `protected` `readonly` **timeout**: `number`

Defined in: [src/transports/base/Transport.ts:132](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L132)

Operation timeout in milliseconds.

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`timeout`](../../base/classes/Transport.md#timeout)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:377](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L377)

Close the transport and clean up resources.

#### Returns

`Promise`\<`void`\>

Resolves when the transport is fully closed

#### Throws

If cleanup fails

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`close`](../../base/classes/Transport.md#close)

***

### disable()

> **disable**(): `void`

Defined in: [src/transports/base/Transport.ts:627](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L627)

Disable the transport.

#### Returns

`void`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`disable`](../../base/classes/Transport.md#disable)

***

### doClose()

> `protected` **doClose**(): `Promise`\<`void`\>

Defined in: [src/transports/AsyncFileTransport.ts:676](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L676)

Close the transport gracefully.

Performs a clean shutdown:
1. Sets closing flag to prevent new logs
2. Flushes all pending data to disk
3. Destroys the sonic-boom instance
4. Releases file handles

#### Returns

`Promise`\<`void`\>

Resolves when fully closed

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`doClose`](../../base/classes/Transport.md#doclose)

***

### doInit()

> `protected` **doInit**(): `Promise`\<`void`\>

Defined in: [src/transports/AsyncFileTransport.ts:316](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L316)

Initialize the transport with sonic-boom.

Creates the sonic-boom instance and sets up event handlers for:
- Error handling and recovery
- Write tracking for statistics
- Ready state management

This method is called automatically by the Transport base class
when the transport is first used or explicitly via init().

sonic-boom provides:
- Internal buffering with configurable size
- Async fs.write() operations (non-blocking)
- Automatic flushing when buffer reaches minLength
- No worker threads - runs in main thread

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`doInit`](../../base/classes/Transport.md#doinit)

***

### ~~doLog()~~

> `protected` **doLog**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/AsyncFileTransport.ts:570](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L570)

Legacy async doLog for compatibility with Transport base class.

This method is not used when log() and logSync() are overridden,
but is kept for compatibility with the Transport interface.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry

#### Returns

`Promise`\<`void`\>

#### Deprecated

Internal use only - use log() or logSync() instead

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`doLog`](../../base/classes/Transport.md#dolog)

***

### doLogBatch()?

> `protected` `optional` **doLogBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:696](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L696)

Optional method for transport-specific batch logging.
Subclasses can implement this for efficient batch processing.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries to process

#### Returns

`Promise`\<`void`\>

Resolves when all logs have been processed

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`doLogBatch`](../../base/classes/Transport.md#dologbatch)

***

### emit()

> **emit**(`event`, ...`args`): `boolean`

Defined in: [src/transports/base/Transport.ts:719](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L719)

Synchronously calls each of the listeners registered for the event named`eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import EventEmitter from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Parameters

##### event

keyof [`TransportEvents`](../../../types/transport/interfaces/TransportEvents.md)

##### args

...`unknown`[]

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`emit`](../../base/classes/Transport.md#emit)

***

### enable()

> **enable**(): `void`

Defined in: [src/transports/base/Transport.ts:619](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L619)

Enable the transport.

#### Returns

`void`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`enable`](../../base/classes/Transport.md#enable)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/AsyncFileTransport.ts:636](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L636)

Flush any buffered data to disk.

Forces all pending log entries to be written immediately.
This is useful for:
- Ensuring critical logs are persisted
- Graceful shutdown sequences
- Before log rotation

#### Returns

`Promise`\<`void`\>

Resolves when all data is written

#### Throws

If flush fails

#### Example

```typescript
// Ensure all logs are written before shutdown
process.on('SIGTERM', async () => {
  await transport.flush();
  await transport.close();
  process.exit(0);
});
```

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`flush`](../../base/classes/Transport.md#flush)

***

### formatEntry()

> `protected` **formatEntry**(`entry`): `string`

Defined in: [src/transports/AsyncFileTransport.ts:596](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L596)

Format log entry for output.

Converts log entries to JSON string format for file storage.
Optimized for minimal overhead with direct JSON serialization.

Supports both:
- MinimalLogEntry: Optimized format from high-performance Logger
- LogEntry: Full format with all metadata

#### Parameters

##### entry

The log entry to format

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md) | [`MinimalLogEntry`](../../../types/transport/interfaces/MinimalLogEntry.md)

#### Returns

`string`

JSON string representation

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`formatEntry`](../../base/classes/Transport.md#formatentry)

***

### formatPlain()

> `protected` **formatPlain**(`entry`): `string`

Defined in: [src/transports/base/Transport.ts:473](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L473)

Format a log entry as plain text.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string`

Plain text formatted log entry

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`formatPlain`](../../base/classes/Transport.md#formatplain)

***

### generateId()

> `protected` **generateId**(): `string`

Defined in: [src/transports/base/Transport.ts:590](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L590)

Generate a unique ID for tracking purposes.

#### Returns

`string`

A unique identifier

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`generateId`](../../base/classes/Transport.md#generateid)

***

### getName()

> **getName**(): `string`

Defined in: [src/transports/base/Transport.ts:436](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L436)

Get the transport name.

#### Returns

`string`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`getName`](../../base/classes/Transport.md#getname)

***

### getStats()

> **getStats**(): `object`

Defined in: [src/transports/AsyncFileTransport.ts:812](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L812)

Get transport statistics including buffer status.

Provides detailed metrics for monitoring and debugging:
- Basic transport statistics (processed, succeeded, failed, queued)
- File path and buffer configuration
- Current buffer usage
- Custom metrics (bytes written, backpressure events, etc.)

#### Returns

Statistics object with buffer info

##### bufferLength

> **bufferLength**: `any`

##### custom?

> `optional` **custom**: `Record`\<`string`, `unknown`\>

Transport-specific metrics.

##### failed

> **failed**: `number`

Total logs that failed to send.

##### filepath

> **filepath**: `string`

##### implementation

> **implementation**: `string` = `'sonic-boom'`

##### isClosing

> **isClosing**: `boolean`

##### isInitialized

> **isInitialized**: `boolean`

##### lastError?

> `optional` **lastError**: `object`

Last error that occurred.

###### lastError.count

> **count**: `number`

###### lastError.message

> **message**: `string`

###### lastError.timestamp

> **timestamp**: `Date`

##### lastSuccess?

> `optional` **lastSuccess**: `Date`

Last successful log timestamp.

##### logged?

> `optional` **logged**: `number`

Alias for succeeded count, provided for readability in some consumers/tests.

##### maxWrite

> **maxWrite**: `number`

##### minLength

> **minLength**: `number`

##### name?

> `optional` **name**: `string`

Optional transport identifier for convenience in tests/metrics.

##### processed

> **processed**: `number`

Total logs processed by this transport.

##### queued?

> `optional` **queued**: `number`

Current number of logs in queue (if applicable).

##### sent?

> `optional` **sent**: `number`

Additional alias for succeeded count expected by some tests/consumers.

##### succeeded

> **succeeded**: `number`

Total logs successfully sent.

#### Example

```typescript
const stats = transport.getStats();
console.log(`Processed: ${stats.processed}`);
console.log(`Buffer usage: ${stats.bufferLength}/${stats.minLength}`);
console.log(`Bytes written: ${stats.custom?.bytesWritten || 0}`);
```

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`getStats`](../../base/classes/Transport.md#getstats)

***

### handleError()

> `protected` **handleError**(`error`, `entry?`): `void`

Defined in: [src/transports/base/Transport.ts:507](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L507)

Handle errors according to the transport's configuration.

#### Parameters

##### error

`Error`

The error that occurred

##### entry?

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry that caused the error (if applicable)

#### Returns

`void`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`handleError`](../../base/classes/Transport.md#handleerror)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:196](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L196)

Initialize the transport.

#### Returns

`Promise`\<`void`\>

Resolves when initialization is complete

#### Throws

If initialization fails

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`init`](../../base/classes/Transport.md#init)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/transports/base/Transport.ts:637](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L637)

Check if the transport is currently enabled.

#### Returns

`boolean`

True if transport is enabled

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`isEnabled`](../../base/classes/Transport.md#isenabled)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/transports/base/Transport.ts:612](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L612)

Check if transport is healthy.

#### Returns

`Promise`\<`boolean`\>

True if transport is healthy

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`isHealthy`](../../base/classes/Transport.md#ishealthy)

***

### isLevelEnabled()

> `protected` **isLevelEnabled**(`level`): `boolean`

Defined in: [src/transports/base/Transport.ts:571](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L571)

Check if a log level is enabled based on minimum level.

#### Parameters

##### level

`string`

The level to check

#### Returns

`boolean`

True if the level is enabled

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`isLevelEnabled`](../../base/classes/Transport.md#islevelenabled)

***

### log()

> **log**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/AsyncFileTransport.ts:550](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L550)

Async log method for compatibility with base Transport interface.

This method delegates to logSync() for performance, then returns
an immediately resolved Promise for API compatibility. When called
directly (not via TransportManager), this still provides async
behavior but with some Promise overhead.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<`void`\>

Immediately resolved promise

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`log`](../../base/classes/Transport.md#log)

***

### logBatch()

> **logBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:257](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L257)

Log multiple entries at once.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries to process

#### Returns

`Promise`\<`void`\>

Resolves when all logs have been processed

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`logBatch`](../../base/classes/Transport.md#logbatch)

***

### logSync()

> **logSync**(`entry`): `void`

Defined in: [src/transports/AsyncFileTransport.ts:410](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L410)

Synchronous log method with application-level batching for maximum performance.

This method implements a two-level batching strategy:
1. Application-level batching: Collects entries in memory
2. sonic-boom batching: Internal buffering for file I/O

Benefits of application-level batching:
- Reduces calls to sonic-boom (less overhead)
- Minimizes string concatenation operations
- Amortizes the cost of buffer management
- Improves cache locality

How it works:
1. Entry is formatted and added to batch buffer
2. When batch reaches batchSize (100) or batchInterval (10ms) expires:
   - All entries are sent to sonic-boom in one operation
   - sonic-boom handles the actual async file write
3. No Promises created, no async context switching

Performance improvements:
- Before: ~130,000 ops/sec (individual writes)
- After: ~250,000+ ops/sec (batched writes)
- 1.9x performance improvement

#### Parameters

##### entry

The log entry to process

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md) | [`MinimalLogEntry`](../../../types/transport/interfaces/MinimalLogEntry.md)

#### Returns

`void`

#### Since

2.1.0

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:715](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L715)

Alias for `emitter.removeListener()`.

#### Parameters

##### event

keyof [`TransportEvents`](../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Since

v10.0.0

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`off`](../../base/classes/Transport.md#off)

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:711](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L711)

Implement EventEmitter methods explicitly for ITransport interface.

#### Parameters

##### event

keyof [`TransportEvents`](../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`on`](../../base/classes/Transport.md#on)

***

### reopen()

> **reopen**(): `Promise`\<`void`\>

Defined in: [src/transports/AsyncFileTransport.ts:768](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L768)

Reopen the log file.

Useful for log rotation scenarios where you want to:
- Start writing to a new file after renaming the old one
- Recover from file system errors
- Implement time-based or size-based rotation

Note: This doesn't rename the file - you need to handle that externally.

#### Returns

`Promise`\<`void`\>

Resolves when file is reopened

#### Example

```typescript
// Rotate logs daily
async function rotateLogs(transport: AsyncFileTransport) {
  const oldPath = './logs/app.log';
  const newPath = `./logs/app-${Date.now()}.log`;

  // Flush pending writes
  await transport.flush();

  // Rename the current file
  fs.renameSync(oldPath, newPath);

  // Reopen to create new file
  await transport.reopen();
}
```

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/transports/base/Transport.ts:655](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L655)

Reset transport statistics.

#### Returns

`void`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`resetStats`](../../base/classes/Transport.md#resetstats)

***

### shouldLog()

> **shouldLog**(`entry`): `boolean`

Defined in: [src/transports/base/Transport.ts:329](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L329)

Check if this transport should handle a given log entry.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to check

#### Returns

`boolean`

True if the entry should be logged by this transport

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`shouldLog`](../../base/classes/Transport.md#shouldlog)

***

### shouldPropagateErrors()

> `protected` **shouldPropagateErrors**(): `boolean`

Defined in: [src/transports/base/Transport.ts:601](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L601)

Whether this transport should rethrow errors encountered during log operations.
Network-based transports typically want propagation so callers/tests can assert failures.
Base transports default to swallowing errors after emitting events and updating stats.

#### Returns

`boolean`

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`shouldPropagateErrors`](../../base/classes/Transport.md#shouldpropagateerrors)

***

### supportsBatching()

> **supportsBatching**(): `boolean`

Defined in: [src/transports/base/Transport.ts:646](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L646)

Check if transport supports batching.

#### Returns

`boolean`

True if batching is supported

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`supportsBatching`](../../base/classes/Transport.md#supportsbatching)

***

### withTimeout()

> `protected` **withTimeout**\<`T`\>(`promise`, `ms`): `Promise`\<`T`\>

Defined in: [src/transports/base/Transport.ts:551](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L551)

Apply a timeout to an async operation.

#### Type Parameters

##### T

`T`

#### Parameters

##### promise

`Promise`\<`T`\>

The promise to apply timeout to

##### ms

`number`

Timeout in milliseconds

#### Returns

`Promise`\<`T`\>

The original promise with timeout applied

#### Throws

If operation times out

#### Inherited from

[`Transport`](../../base/classes/Transport.md).[`withTimeout`](../../base/classes/Transport.md#withtimeout)
