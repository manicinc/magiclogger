# Class: PostgreSQLTransport

Defined in: [src/transports/base/implementations/PostgreSQLTransport.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/PostgreSQLTransport.ts#L56)

PostgreSQL transport for logging to PostgreSQL databases.

Features:
- Connection pooling for performance
- Batch inserts for efficiency
- Automatic table creation
- JSON/JSONB support for structured data
- Partitioning support for large datasets
- Index management

 PostgreSQLTransport

## Example

```typescript
const pgTransport = new PostgreSQLTransport({
  connectionString: 'postgresql://user:pass@localhost/logs',
  table: 'application_logs',
  createTable: true,
  poolSize: 10,
  batchSize: 100
});
```

## Extends

- [`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md)

## Constructors

### Constructor

> **new PostgreSQLTransport**(`options`): `PostgreSQLTransport`

Defined in: [src/transports/base/implementations/PostgreSQLTransport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/PostgreSQLTransport.ts#L76)

Construct a PostgreSQLTransport.

#### Parameters

##### options

[`PostgreSQLTransportOptions`](../../../types/transport/interfaces/PostgreSQLTransportOptions.md)

Transport options

#### Returns

`PostgreSQLTransport`

#### Overrides

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`constructor`](../../base/BatchingTransport/classes/BatchingTransport.md#constructor)

## Properties

### closing

> `protected` **closing**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:156](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L156)

Flag to track if transport is currently closing.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`closing`](../../base/BatchingTransport/classes/BatchingTransport.md#closing)

***

### enabled

> **enabled**: `boolean`

Defined in: [src/transports/base/Transport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L70)

Whether this transport is currently active and processing logs.
Can be toggled at runtime to enable/disable specific transports.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`enabled`](../../base/BatchingTransport/classes/BatchingTransport.md#enabled)

***

### excludeTags?

> `protected` `readonly` `optional` **excludeTags**: `string`[]

Defined in: [src/transports/base/Transport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L114)

Tags that exclude logs from being processed.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`excludeTags`](../../base/BatchingTransport/classes/BatchingTransport.md#excludetags)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`filter`](../../base/BatchingTransport/classes/BatchingTransport.md#filter)

***

### format

> `protected` `readonly` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/transports/base/Transport.ts:138](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L138)

Output format for this transport.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`format`](../../base/BatchingTransport/classes/BatchingTransport.md#format)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`formatter`](../../base/BatchingTransport/classes/BatchingTransport.md#formatter)

***

### initialized

> `protected` **initialized**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L150)

Flag to track if transport has been initialized.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`initialized`](../../base/BatchingTransport/classes/BatchingTransport.md#initialized)

***

### level

> `protected` `readonly` **level**: `string`

Defined in: [src/transports/base/Transport.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L96)

Minimum log level for this transport.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`level`](../../base/BatchingTransport/classes/BatchingTransport.md#level)

***

### levels?

> `protected` `readonly` `optional` **levels**: `string`[]

Defined in: [src/transports/base/Transport.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L102)

Specific levels this transport handles (if specified).

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`levels`](../../base/BatchingTransport/classes/BatchingTransport.md#levels)

***

### maxBatchBytes

> `protected` `readonly` **maxBatchBytes**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L55)

Maximum size in bytes per batch.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`maxBatchBytes`](../../base/BatchingTransport/classes/BatchingTransport.md#maxbatchbytes)

***

### maxBatchSize

> `protected` `readonly` **maxBatchSize**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L43)

Maximum number of entries per batch.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`maxBatchSize`](../../base/BatchingTransport/classes/BatchingTransport.md#maxbatchsize)

***

### maxBatchTime

> `protected` `readonly` **maxBatchTime**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L49)

Maximum time to wait before sending a batch (ms).

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`maxBatchTime`](../../base/BatchingTransport/classes/BatchingTransport.md#maxbatchtime)

***

### maxQueueSize

> `protected` `readonly` **maxQueueSize**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:79](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L79)

Maximum queue size.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`maxQueueSize`](../../base/BatchingTransport/classes/BatchingTransport.md#maxqueuesize)

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:61](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L61)

Maximum retry attempts for failed batches.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`maxRetries`](../../base/BatchingTransport/classes/BatchingTransport.md#maxretries)

***

### name

> `readonly` **name**: `string`

Defined in: [src/transports/base/Transport.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L64)

Unique identifier for this transport instance.
Used for managing multiple transports and debugging.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`name`](../../base/BatchingTransport/classes/BatchingTransport.md#name)

***

### options

> `protected` `readonly` **options**: [`TransportOptions`](../../../types/transport/interfaces/TransportOptions.md)

Defined in: [src/transports/base/Transport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L76)

Transport configuration options.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`options`](../../base/BatchingTransport/classes/BatchingTransport.md#options)

***

### retryDelay

> `protected` `readonly` **retryDelay**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L67)

Initial retry delay in milliseconds.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`retryDelay`](../../base/BatchingTransport/classes/BatchingTransport.md#retrydelay)

***

### retryOnFailure

> `protected` `readonly` **retryOnFailure**: `boolean`

Defined in: [src/transports/base/BatchingTransport.ts:73](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L73)

Whether to retry on failure.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`retryOnFailure`](../../base/BatchingTransport/classes/BatchingTransport.md#retryonfailure)

***

### silent

> `protected` `readonly` **silent**: `boolean`

Defined in: [src/transports/base/Transport.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L126)

Whether to suppress errors from this transport.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`silent`](../../base/BatchingTransport/classes/BatchingTransport.md#silent)

***

### stats

> `protected` **stats**: [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L82)

Statistics tracking for this transport.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`stats`](../../base/BatchingTransport/classes/BatchingTransport.md#stats)

***

### tags?

> `protected` `readonly` `optional` **tags**: `string`[]

Defined in: [src/transports/base/Transport.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L108)

Tags that must be present for logs to be processed.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`tags`](../../base/BatchingTransport/classes/BatchingTransport.md#tags)

***

### timeout

> `protected` `readonly` **timeout**: `number`

Defined in: [src/transports/base/Transport.ts:132](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L132)

Operation timeout in milliseconds.

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`timeout`](../../base/BatchingTransport/classes/BatchingTransport.md#timeout)

## Methods

### cleanupOldLogs()

> **cleanupOldLogs**(`retentionDays`): `Promise`\<`number`\>

Defined in: [src/transports/base/implementations/PostgreSQLTransport.ts:267](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/PostgreSQLTransport.ts#L267)

Delete rows older than a retention window.

#### Parameters

##### retentionDays

`number`

Age threshold in days.

#### Returns

`Promise`\<`number`\>

Number of deleted rows.

***

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`close`](../../base/BatchingTransport/classes/BatchingTransport.md#close)

***

### disable()

> **disable**(): `void`

Defined in: [src/transports/base/Transport.ts:627](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L627)

Disable the transport.

#### Returns

`void`

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`disable`](../../base/BatchingTransport/classes/BatchingTransport.md#disable)

***

### doClose()

> `protected` **doClose**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/PostgreSQLTransport.ts:312](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/PostgreSQLTransport.ts#L312)

Tear down the connection pool and parent resources.

#### Returns

`Promise`\<`void`\>

Resolves when closed.

#### Overrides

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`doClose`](../../base/BatchingTransport/classes/BatchingTransport.md#doclose)

***

### doInit()

> `protected` **doInit**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/PostgreSQLTransport.ts:118](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/PostgreSQLTransport.ts#L118)

Initialize PostgreSQL connection and optionally create the table.

#### Returns

`Promise`\<`void`\>

Resolves when the pool is ready.

#### Overrides

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`doInit`](../../base/BatchingTransport/classes/BatchingTransport.md#doinit)

***

### doLog()

> `protected` **doLog**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/BatchingTransport.ts:143](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L143)

Log a single entry.

Adds the entry to the current batch and triggers sending if limits are reached.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<`void`\>

Resolves when the entry is queued

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`doLog`](../../base/BatchingTransport/classes/BatchingTransport.md#dolog)

***

### doLogBatch()

> `protected` **doLogBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/BatchingTransport.ts:184](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L184)

Log multiple entries at once.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries to process

#### Returns

`Promise`\<`void`\>

Resolves when all entries are queued

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`doLogBatch`](../../base/BatchingTransport/classes/BatchingTransport.md#dologbatch)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`emit`](../../base/BatchingTransport/classes/BatchingTransport.md#emit)

***

### enable()

> **enable**(): `void`

Defined in: [src/transports/base/Transport.ts:619](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L619)

Enable the transport.

#### Returns

`void`

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`enable`](../../base/BatchingTransport/classes/BatchingTransport.md#enable)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/base/BatchingTransport.ts:383](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L383)

Flush any pending logs.

#### Returns

`Promise`\<`void`\>

Resolves when all pending logs are sent

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`flush`](../../base/BatchingTransport/classes/BatchingTransport.md#flush)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`formatEntry`](../../base/BatchingTransport/classes/BatchingTransport.md#formatentry)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`formatPlain`](../../base/BatchingTransport/classes/BatchingTransport.md#formatplain)

***

### generateId()

> `protected` **generateId**(): `string`

Defined in: [src/transports/base/Transport.ts:590](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L590)

Generate a unique ID for tracking purposes.

#### Returns

`string`

A unique identifier

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`generateId`](../../base/BatchingTransport/classes/BatchingTransport.md#generateid)

***

### getLogCountByLevel()

> **getLogCountByLevel**(): `Promise`\<`Record`\<`string`, `number`\>\>

Defined in: [src/transports/base/implementations/PostgreSQLTransport.ts:286](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/PostgreSQLTransport.ts#L286)

Query recent log counts grouped by level.

#### Returns

`Promise`\<`Record`\<`string`, `number`\>\>

A mapping of level -> count within the last day.

***

### getName()

> **getName**(): `string`

Defined in: [src/transports/base/Transport.ts:436](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L436)

Get the transport name.

#### Returns

`string`

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`getName`](../../base/BatchingTransport/classes/BatchingTransport.md#getname)

***

### getStats()

> **getStats**(): [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/BatchingTransport.ts:420](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L420)

Get transport statistics.

#### Returns

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Current statistics

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`getStats`](../../base/BatchingTransport/classes/BatchingTransport.md#getstats)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`handleError`](../../base/BatchingTransport/classes/BatchingTransport.md#handleerror)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`init`](../../base/BatchingTransport/classes/BatchingTransport.md#init)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/transports/base/Transport.ts:637](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L637)

Check if the transport is currently enabled.

#### Returns

`boolean`

True if transport is enabled

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`isEnabled`](../../base/BatchingTransport/classes/BatchingTransport.md#isenabled)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/transports/base/Transport.ts:612](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L612)

Check if transport is healthy.

#### Returns

`Promise`\<`boolean`\>

True if transport is healthy

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`isHealthy`](../../base/BatchingTransport/classes/BatchingTransport.md#ishealthy)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`isLevelEnabled`](../../base/BatchingTransport/classes/BatchingTransport.md#islevelenabled)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`log`](../../base/BatchingTransport/classes/BatchingTransport.md#log)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`logBatch`](../../base/BatchingTransport/classes/BatchingTransport.md#logbatch)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`off`](../../base/BatchingTransport/classes/BatchingTransport.md#off)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`on`](../../base/BatchingTransport/classes/BatchingTransport.md#on)

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/transports/base/Transport.ts:655](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L655)

Reset transport statistics.

#### Returns

`void`

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`resetStats`](../../base/BatchingTransport/classes/BatchingTransport.md#resetstats)

***

### sendBatch()

> `protected` **sendBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/PostgreSQLTransport.ts:212](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/PostgreSQLTransport.ts#L212)

Send a batch of log entries using a single transaction.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Entries to persist.

#### Returns

`Promise`\<`void`\>

Resolves when committed.

#### Overrides

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`sendBatch`](../../base/BatchingTransport/classes/BatchingTransport.md#sendbatch)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`shouldLog`](../../base/BatchingTransport/classes/BatchingTransport.md#shouldlog)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`shouldPropagateErrors`](../../base/BatchingTransport/classes/BatchingTransport.md#shouldpropagateerrors)

***

### supportsBatching()

> **supportsBatching**(): `boolean`

Defined in: [src/transports/base/BatchingTransport.ts:443](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L443)

Check if transport supports batching.

#### Returns

`boolean`

Always true for batching transports

#### Inherited from

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`supportsBatching`](../../base/BatchingTransport/classes/BatchingTransport.md#supportsbatching)

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

[`BatchingTransport`](../../base/BatchingTransport/classes/BatchingTransport.md).[`withTimeout`](../../base/BatchingTransport/classes/BatchingTransport.md#withtimeout)
