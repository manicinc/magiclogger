# Class: HTTPTransport

Defined in: [src/transports/HTTPTransport.ts:172](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L172)

HTTP transport that uses a worker thread for all network operations.

This transport ensures zero blocking of the main thread by delegating
all CPU and I/O intensive operations to a dedicated worker thread.
The worker handles batching, compression, serialization, and HTTP requests.

 HTTPWorkerTransport

## Examples

```typescript
const httpTransport = new HTTPWorkerTransport({
  endpoint: 'https://logs.example.com/api/logs',
  batchSize: 100,
  flushInterval: 5000
});

// Logs are automatically batched and sent
httpTransport.log(entry);  // Non-blocking
```

```typescript
const httpTransport = new HTTPWorkerTransport({
  endpoint: 'https://logs.example.com/api/logs',
  headers: {
    'Authorization': 'Bearer ' + process.env.LOG_API_TOKEN,
    'Content-Type': 'application/json'
  },
  compress: true,  // Enable compression
  maxRetries: 5,   // More retries for critical logs
  timeout: 60000   // Longer timeout
});
```

```typescript
const httpTransport = new HTTPWorkerTransport({
  endpoint: 'https://logs.example.com/api/logs',
  circuitBreakerThreshold: 3,      // Open after 3 failures
  circuitBreakerResetTimeout: 30000 // Try again after 30s
});
```

## Extends

- [`Transport`](../../base/classes/Transport.md)

## Constructors

### Constructor

> **new HTTPTransport**(`options`): `HTTPTransport`

Defined in: [src/transports/HTTPTransport.ts:207](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L207)

Creates a new HTTPWorkerTransport instance.

#### Parameters

##### options

[`HTTPTransportOptions`](../interfaces/HTTPTransportOptions.md)

Transport configuration

#### Returns

`HTTPTransport`

#### Throws

If endpoint is not provided or invalid

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`constructor`](../../base/classes/Transport.md#constructor)

## Properties

### closing

> `protected` **closing**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:156](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L156)

Flag to track if transport is currently closing.

#### Inherited from

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

> `protected` `readonly` **options**: [`TransportOptions`](../../../types/transport/interfaces/TransportOptions.md)

Defined in: [src/transports/base/Transport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L76)

Transport configuration options.

#### Inherited from

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

Defined in: [src/transports/HTTPTransport.ts:663](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L663)

Closes the transport and terminates the worker.

Ensures all buffered logs are sent before shutting down.

#### Returns

`Promise`\<`void`\>

Resolves when fully closed

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`doClose`](../../base/classes/Transport.md#doclose)

***

### doInit()

> `protected` **doInit**(): `Promise`\<`void`\>

Defined in: [src/transports/HTTPTransport.ts:701](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L701)

Initializes the transport.

Waits for the worker to be ready before returning.

#### Returns

`Promise`\<`void`\>

Resolves when initialized

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`doInit`](../../base/classes/Transport.md#doinit)

***

### doLog()

> `protected` **doLog**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/HTTPTransport.ts:601](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L601)

Logs an entry by passing it to the worker thread.

This method is non-blocking and returns immediately.
The entry is passed to the worker using structured cloning,
which is efficient for passing objects between threads.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to send

#### Returns

`Promise`\<`void`\>

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

Defined in: [src/transports/HTTPTransport.ts:629](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L629)

Flushes the worker's batch immediately.

Forces the worker to send any buffered logs immediately,
regardless of batch size or timer.

#### Returns

`Promise`\<`void`\>

Resolves when flush completes

#### Overrides

[`Transport`](../../base/classes/Transport.md).[`flush`](../../base/classes/Transport.md#flush)

***

### formatEntry()

> `protected` **formatEntry**(`entry`): `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:447](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L447)

Format a log entry according to the configured format.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string` \| `Buffer`

Formatted log entry

#### Inherited from

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

> **getStats**(): [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:420](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L420)

Get current transport statistics.

#### Returns

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Current statistics for this transport

#### Inherited from

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

Defined in: [src/transports/base/Transport.ts:217](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L217)

Log a single entry.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<`void`\>

Resolves when the log has been processed

#### Inherited from

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
