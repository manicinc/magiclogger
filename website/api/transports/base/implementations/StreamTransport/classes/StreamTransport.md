# Class: StreamTransport

Defined in: [src/transports/base/implementations/StreamTransport.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L43)

Stream transport for piping logs to any Node.js writable stream.

Features:
- Works with any Node.js writable stream (files, network, process)
- Backpressure handling for flow control
- Transform stream support for log processing pipelines
- Multiple encoding formats
- Stream health monitoring
- Automatic stream cleanup

 StreamTransport

## Example

```typescript
// Write to stdout
const stdoutTransport = new StreamTransport({
  name: 'stdout',
  stream: process.stdout
});

// Write to custom stream with transform
const transformStream = new Transform({
  transform(chunk, encoding, callback) {
    // Process log data
    callback(null, chunk.toString().toUpperCase());
  }
});

const streamTransport = new StreamTransport({
  name: 'transform',
  stream: transformStream.pipe(process.stdout)
});
```

## Extends

- [`Transport`](../../../classes/Transport.md)

## Constructors

### Constructor

> **new StreamTransport**(`options`): `StreamTransport`

Defined in: [src/transports/base/implementations/StreamTransport.ts:106](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L106)

Creates a new StreamTransport instance.

#### Parameters

##### options

[`StreamTransportOptions`](../../../../../types/transport/interfaces/StreamTransportOptions.md)

Transport configuration

#### Returns

`StreamTransport`

#### Overrides

[`Transport`](../../../classes/Transport.md).[`constructor`](../../../classes/Transport.md#constructor)

## Properties

### closing

> `protected` **closing**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:156](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L156)

Flag to track if transport is currently closing.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`closing`](../../../classes/Transport.md#closing)

***

### enabled

> **enabled**: `boolean`

Defined in: [src/transports/base/Transport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L70)

Whether this transport is currently active and processing logs.
Can be toggled at runtime to enable/disable specific transports.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`enabled`](../../../classes/Transport.md#enabled)

***

### excludeTags?

> `protected` `readonly` `optional` **excludeTags**: `string`[]

Defined in: [src/transports/base/Transport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L114)

Tags that exclude logs from being processed.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`excludeTags`](../../../classes/Transport.md#excludetags)

***

### filter()?

> `protected` `readonly` `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/transports/base/Transport.ts:120](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L120)

Custom filter function for advanced filtering.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`boolean`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`filter`](../../../classes/Transport.md#filter)

***

### format

> `protected` `readonly` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/transports/base/Transport.ts:138](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L138)

Output format for this transport.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`format`](../../../classes/Transport.md#format)

***

### formatter()?

> `protected` `readonly` `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:144](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L144)

Custom formatter function.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`formatter`](../../../classes/Transport.md#formatter)

***

### initialized

> `protected` **initialized**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L150)

Flag to track if transport has been initialized.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`initialized`](../../../classes/Transport.md#initialized)

***

### level

> `protected` `readonly` **level**: `string`

Defined in: [src/transports/base/Transport.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L96)

Minimum log level for this transport.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`level`](../../../classes/Transport.md#level)

***

### levels?

> `protected` `readonly` `optional` **levels**: `string`[]

Defined in: [src/transports/base/Transport.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L102)

Specific levels this transport handles (if specified).

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`levels`](../../../classes/Transport.md#levels)

***

### name

> `readonly` **name**: `string`

Defined in: [src/transports/base/Transport.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L64)

Unique identifier for this transport instance.
Used for managing multiple transports and debugging.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`name`](../../../classes/Transport.md#name)

***

### options

> `protected` `readonly` **options**: [`TransportOptions`](../../../../../types/transport/interfaces/TransportOptions.md)

Defined in: [src/transports/base/Transport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L76)

Transport configuration options.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`options`](../../../classes/Transport.md#options)

***

### silent

> `protected` `readonly` **silent**: `boolean`

Defined in: [src/transports/base/Transport.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L126)

Whether to suppress errors from this transport.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`silent`](../../../classes/Transport.md#silent)

***

### stats

> `protected` **stats**: [`TransportStats`](../../../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L82)

Statistics tracking for this transport.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`stats`](../../../classes/Transport.md#stats)

***

### tags?

> `protected` `readonly` `optional` **tags**: `string`[]

Defined in: [src/transports/base/Transport.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L108)

Tags that must be present for logs to be processed.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`tags`](../../../classes/Transport.md#tags)

***

### timeout

> `protected` `readonly` **timeout**: `number`

Defined in: [src/transports/base/Transport.ts:132](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L132)

Operation timeout in milliseconds.

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`timeout`](../../../classes/Transport.md#timeout)

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

[`Transport`](../../../classes/Transport.md).[`close`](../../../classes/Transport.md#close)

***

### cork()

> **cork**(): `void`

Defined in: [src/transports/base/implementations/StreamTransport.ts:543](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L543)

Cork the stream (buffer writes).

#### Returns

`void`

***

### disable()

> **disable**(): `void`

Defined in: [src/transports/base/Transport.ts:627](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L627)

Disable the transport.

#### Returns

`void`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`disable`](../../../classes/Transport.md#disable)

***

### doClose()

> `protected` **doClose**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/StreamTransport.ts:607](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L607)

Close the stream transport.

#### Returns

`Promise`\<`void`\>

Resolves when closed

#### Overrides

[`Transport`](../../../classes/Transport.md).[`doClose`](../../../classes/Transport.md#doclose)

***

### doInit()

> `protected` **doInit**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/StreamTransport.ts:140](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L140)

Initialize stream transport.

#### Returns

`Promise`\<`void`\>

Resolves when initialized

#### Overrides

[`Transport`](../../../classes/Transport.md).[`doInit`](../../../classes/Transport.md#doinit)

***

### doLog()

> `protected` **doLog**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/StreamTransport.ts:208](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L208)

Log a single entry to the stream.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

Log entry to write

#### Returns

`Promise`\<`void`\>

Resolves when written

#### Overrides

[`Transport`](../../../classes/Transport.md).[`doLog`](../../../classes/Transport.md#dolog)

***

### doLogBatch()

> `protected` **doLogBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/StreamTransport.ts:229](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L229)

Log multiple entries efficiently.

#### Parameters

##### entries

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)[]

Log entries to write

#### Returns

`Promise`\<`void`\>

Resolves when all written

#### Overrides

[`Transport`](../../../classes/Transport.md).[`doLogBatch`](../../../classes/Transport.md#dologbatch)

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

keyof [`TransportEvents`](../../../../../types/transport/interfaces/TransportEvents.md)

##### args

...`unknown`[]

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`emit`](../../../classes/Transport.md#emit)

***

### enable()

> **enable**(): `void`

Defined in: [src/transports/base/Transport.ts:619](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L619)

Enable the transport.

#### Returns

`void`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`enable`](../../../classes/Transport.md#enable)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/StreamTransport.ts:481](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L481)

Flush any buffered data in the stream.

#### Returns

`Promise`\<`void`\>

Resolves when flushed

#### Overrides

[`Transport`](../../../classes/Transport.md).[`flush`](../../../classes/Transport.md#flush)

***

### formatEntry()

> `protected` **formatEntry**(`entry`): `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:447](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L447)

Format a log entry according to the configured format.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string` \| `Buffer`

Formatted log entry

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`formatEntry`](../../../classes/Transport.md#formatentry)

***

### formatPlain()

> `protected` **formatPlain**(`entry`): `string`

Defined in: [src/transports/base/Transport.ts:473](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L473)

Format a log entry as plain text.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string`

Plain text formatted log entry

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`formatPlain`](../../../classes/Transport.md#formatplain)

***

### generateId()

> `protected` **generateId**(): `string`

Defined in: [src/transports/base/Transport.ts:590](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L590)

Generate a unique ID for tracking purposes.

#### Returns

`string`

A unique identifier

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`generateId`](../../../classes/Transport.md#generateid)

***

### getName()

> **getName**(): `string`

Defined in: [src/transports/base/Transport.ts:436](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L436)

Get the transport name.

#### Returns

`string`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`getName`](../../../classes/Transport.md#getname)

***

### getStats()

> **getStats**(): [`TransportStats`](../../../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/implementations/StreamTransport.ts:630](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L630)

Get stream statistics.

#### Returns

[`TransportStats`](../../../../../types/transport/interfaces/TransportStats.md)

Extended statistics

#### Overrides

[`Transport`](../../../classes/Transport.md).[`getStats`](../../../classes/Transport.md#getstats)

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

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry that caused the error (if applicable)

#### Returns

`void`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`handleError`](../../../classes/Transport.md#handleerror)

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

[`Transport`](../../../classes/Transport.md).[`init`](../../../classes/Transport.md#init)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/transports/base/Transport.ts:637](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L637)

Check if the transport is currently enabled.

#### Returns

`boolean`

True if transport is enabled

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`isEnabled`](../../../classes/Transport.md#isenabled)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/transports/base/implementations/StreamTransport.ts:672](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L672)

Check if transport is healthy.

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`Transport`](../../../classes/Transport.md).[`isHealthy`](../../../classes/Transport.md#ishealthy)

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

[`Transport`](../../../classes/Transport.md).[`isLevelEnabled`](../../../classes/Transport.md#islevelenabled)

***

### log()

> **log**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:217](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L217)

Log a single entry.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<`void`\>

Resolves when the log has been processed

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`log`](../../../classes/Transport.md#log)

***

### logBatch()

> **logBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:257](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L257)

Log multiple entries at once.

#### Parameters

##### entries

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries to process

#### Returns

`Promise`\<`void`\>

Resolves when all logs have been processed

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`logBatch`](../../../classes/Transport.md#logbatch)

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:715](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L715)

Alias for `emitter.removeListener()`.

#### Parameters

##### event

keyof [`TransportEvents`](../../../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Since

v10.0.0

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`off`](../../../classes/Transport.md#off)

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:711](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L711)

Implement EventEmitter methods explicitly for ITransport interface.

#### Parameters

##### event

keyof [`TransportEvents`](../../../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`on`](../../../classes/Transport.md#on)

***

### pipe()

> **pipe**(`destination`, `options?`): `WritableStream`

Defined in: [src/transports/base/implementations/StreamTransport.ts:571](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L571)

Pipe this transport's output to another stream.

#### Parameters

##### destination

`WritableStream`

Destination stream

##### options?

Pipe options

###### end?

`boolean`

#### Returns

`WritableStream`

Destination stream

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/transports/base/Transport.ts:655](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L655)

Reset transport statistics.

#### Returns

`void`

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`resetStats`](../../../classes/Transport.md#resetstats)

***

### shouldLog()

> **shouldLog**(`entry`): `boolean`

Defined in: [src/transports/base/Transport.ts:329](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L329)

Check if this transport should handle a given log entry.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry to check

#### Returns

`boolean`

True if the entry should be logged by this transport

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`shouldLog`](../../../classes/Transport.md#shouldlog)

***

### shouldPropagateErrors()

> `protected` **shouldPropagateErrors**(): `boolean`

Defined in: [src/transports/base/implementations/StreamTransport.ts:248](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L248)

Stream transport should propagate errors so caller can detect write failures.

#### Returns

`boolean`

#### Overrides

[`Transport`](../../../classes/Transport.md).[`shouldPropagateErrors`](../../../classes/Transport.md#shouldpropagateerrors)

***

### supportsBatching()

> **supportsBatching**(): `boolean`

Defined in: [src/transports/base/Transport.ts:646](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L646)

Check if transport supports batching.

#### Returns

`boolean`

True if batching is supported

#### Inherited from

[`Transport`](../../../classes/Transport.md).[`supportsBatching`](../../../classes/Transport.md#supportsbatching)

***

### uncork()

> **uncork**(): `void`

Defined in: [src/transports/base/implementations/StreamTransport.ts:555](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/StreamTransport.ts#L555)

Uncork the stream (flush buffered writes).

#### Returns

`void`

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

[`Transport`](../../../classes/Transport.md).[`withTimeout`](../../../classes/Transport.md#withtimeout)
