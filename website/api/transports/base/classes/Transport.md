# Abstract Class: Transport

Defined in: [src/transports/base/Transport.ts:59](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L59)

Abstract base class for all MagicLogger transports.

This class provides the foundational functionality that all transports share:
- Event emission for lifecycle management
- Filtering logic based on levels, tags, and custom filters
- Statistics tracking for monitoring
- Error handling and silent mode support
- Lifecycle methods for initialization and cleanup

Concrete transport implementations should extend this class and implement
the abstract methods for their specific transport mechanism.

 Transport

## Implements

## Example

```typescript
class ConsoleTransport extends Transport {
  protected async doInit(): Promise<void> {
    // Initialize console-specific resources
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    console.log(this.formatEntry(entry));
  }

  protected async doClose(): Promise<void> {
    // Clean up console-specific resources
  }
}
```

## Extends

- `EventEmitter`

## Extended by

- [`AsyncFileTransport`](../../AsyncFileTransport/classes/AsyncFileTransport.md)
- [`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md)
- [`ConsoleTransport`](../implementations/ConsoleTransport/classes/ConsoleTransport.md)
- [`StreamTransport`](../implementations/StreamTransport/classes/StreamTransport.md)
- [`FileTransport`](../../FileTransport/classes/FileTransport.md)
- [`HTTPTransport`](../../HTTPTransport/classes/HTTPTransport.md)
- [`NullTransport`](../../null/classes/NullTransport-1.md)
- [`SyncConsoleTransport`](../../SyncConsoleTransport/classes/SyncConsoleTransport.md)
- [`SyncFileTransport`](../../SyncFileTransport/classes/SyncFileTransport.md)
- [`FileWorkerTransport`](../../worker/FileWorkerTransport/classes/FileWorkerTransport.md)
- [`WorkerTransport`](../../WorkerTransport/classes/WorkerTransport.md)
- [`NetworkTransport`](../../classes/NetworkTransport.md)
- [`BatchingTransport`](../../classes/BatchingTransport.md)

## Implements

- [`Transport`](../../../types/transport/interfaces/Transport.md)

## Constructors

### Constructor

> **new Transport**(`options`): `Transport`

Defined in: [src/transports/base/Transport.ts:164](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L164)

Creates a new Transport instance.

#### Parameters

##### options

[`TransportOptions`](../../../types/transport/interfaces/TransportOptions.md)

Configuration options for the transport

#### Returns

`Transport`

#### Throws

If required options are missing or invalid

#### Overrides

`EventEmitter.constructor`

## Properties

### closing

> `protected` **closing**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:156](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L156)

Flag to track if transport is currently closing.

***

### enabled

> **enabled**: `boolean`

Defined in: [src/transports/base/Transport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L70)

Whether this transport is currently active and processing logs.
Can be toggled at runtime to enable/disable specific transports.

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`enabled`](../../../types/transport/interfaces/Transport.md#enabled)

***

### excludeTags?

> `protected` `readonly` `optional` **excludeTags**: `string`[]

Defined in: [src/transports/base/Transport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L114)

Tags that exclude logs from being processed.

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

***

### format

> `protected` `readonly` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/transports/base/Transport.ts:138](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L138)

Output format for this transport.

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

***

### initialized

> `protected` **initialized**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L150)

Flag to track if transport has been initialized.

***

### level

> `protected` `readonly` **level**: `string`

Defined in: [src/transports/base/Transport.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L96)

Minimum log level for this transport.

***

### levels?

> `protected` `readonly` `optional` **levels**: `string`[]

Defined in: [src/transports/base/Transport.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L102)

Specific levels this transport handles (if specified).

***

### name

> `readonly` **name**: `string`

Defined in: [src/transports/base/Transport.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L64)

Unique identifier for this transport instance.
Used for managing multiple transports and debugging.

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`name`](../../../types/transport/interfaces/Transport.md#name)

***

### options

> `protected` `readonly` **options**: [`TransportOptions`](../../../types/transport/interfaces/TransportOptions.md)

Defined in: [src/transports/base/Transport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L76)

Transport configuration options.

***

### silent

> `protected` `readonly` **silent**: `boolean`

Defined in: [src/transports/base/Transport.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L126)

Whether to suppress errors from this transport.

***

### stats

> `protected` **stats**: [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L82)

Statistics tracking for this transport.

***

### tags?

> `protected` `readonly` `optional` **tags**: `string`[]

Defined in: [src/transports/base/Transport.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L108)

Tags that must be present for logs to be processed.

***

### timeout

> `protected` `readonly` **timeout**: `number`

Defined in: [src/transports/base/Transport.ts:132](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L132)

Operation timeout in milliseconds.

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`close`](../../../types/transport/interfaces/Transport.md#close)

***

### disable()

> **disable**(): `void`

Defined in: [src/transports/base/Transport.ts:627](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L627)

Disable the transport.

#### Returns

`void`

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`disable`](../../../types/transport/interfaces/Transport.md#disable)

***

### doClose()

> `abstract` `protected` **doClose**(): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:706](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L706)

Abstract method for transport-specific cleanup.
Subclasses must implement this method.

#### Returns

`Promise`\<`void`\>

Resolves when cleanup is complete

***

### doInit()

> `abstract` `protected` **doInit**(): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:675](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L675)

Abstract method for transport-specific initialization.
Subclasses must implement this method.

#### Returns

`Promise`\<`void`\>

Resolves when initialization is complete

***

### doLog()

> `abstract` `protected` **doLog**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:686](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L686)

Abstract method for transport-specific logging.
Subclasses must implement this method.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<`void`\>

Resolves when the log has been processed

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`emit`](../../../types/transport/interfaces/Transport.md#emit)

#### Overrides

`EventEmitter.emit`

***

### enable()

> **enable**(): `void`

Defined in: [src/transports/base/Transport.ts:619](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L619)

Enable the transport.

#### Returns

`void`

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`enable`](../../../types/transport/interfaces/Transport.md#enable)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:410](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L410)

Flush any buffered logs immediately.

#### Returns

`Promise`\<`void`\>

Resolves when flush is complete

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`flush`](../../../types/transport/interfaces/Transport.md#flush)

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

***

### generateId()

> `protected` **generateId**(): `string`

Defined in: [src/transports/base/Transport.ts:590](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L590)

Generate a unique ID for tracking purposes.

#### Returns

`string`

A unique identifier

***

### getName()

> **getName**(): `string`

Defined in: [src/transports/base/Transport.ts:436](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L436)

Get the transport name.

#### Returns

`string`

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`getName`](../../../types/transport/interfaces/Transport.md#getname)

***

### getStats()

> **getStats**(): [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:420](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L420)

Get current transport statistics.

#### Returns

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Current statistics for this transport

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`getStats`](../../../types/transport/interfaces/Transport.md#getstats)

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`init`](../../../types/transport/interfaces/Transport.md#init)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/transports/base/Transport.ts:637](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L637)

Check if the transport is currently enabled.

#### Returns

`boolean`

True if transport is enabled

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`isEnabled`](../../../types/transport/interfaces/Transport.md#isenabled)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/transports/base/Transport.ts:612](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L612)

Check if transport is healthy.

#### Returns

`Promise`\<`boolean`\>

True if transport is healthy

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`isHealthy`](../../../types/transport/interfaces/Transport.md#ishealthy)

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`log`](../../../types/transport/interfaces/Transport.md#log)

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`logBatch`](../../../types/transport/interfaces/Transport.md#logbatch)

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`off`](../../../types/transport/interfaces/Transport.md#off)

#### Overrides

`EventEmitter.off`

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`on`](../../../types/transport/interfaces/Transport.md#on)

#### Overrides

`EventEmitter.on`

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/transports/base/Transport.ts:655](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L655)

Reset transport statistics.

#### Returns

`void`

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`resetStats`](../../../types/transport/interfaces/Transport.md#resetstats)

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

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`shouldLog`](../../../types/transport/interfaces/Transport.md#shouldlog)

***

### shouldPropagateErrors()

> `protected` **shouldPropagateErrors**(): `boolean`

Defined in: [src/transports/base/Transport.ts:601](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L601)

Whether this transport should rethrow errors encountered during log operations.
Network-based transports typically want propagation so callers/tests can assert failures.
Base transports default to swallowing errors after emitting events and updating stats.

#### Returns

`boolean`

***

### supportsBatching()

> **supportsBatching**(): `boolean`

Defined in: [src/transports/base/Transport.ts:646](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L646)

Check if transport supports batching.

#### Returns

`boolean`

True if batching is supported

#### Implementation of

[`Transport`](../../../types/transport/interfaces/Transport.md).[`supportsBatching`](../../../types/transport/interfaces/Transport.md#supportsbatching)

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
