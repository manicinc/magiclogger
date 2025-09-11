# Interface: AsyncFileTransportOptions

Defined in: [src/transports/AsyncFileTransport.ts:66](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L66)

Configuration options for async file transport.

These options control the behavior of the async file transport,
including buffering, file handling, and performance tuning.

 AsyncFileTransportOptions

## Properties

### append?

> `optional` **append**: `boolean`

Defined in: [src/transports/AsyncFileTransport.ts:137](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L137)

Append to existing file.

#### Default

```ts
true
```

***

### ~~bufferSize?~~

> `optional` **bufferSize**: `number`

Defined in: [src/transports/AsyncFileTransport.ts:147](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L147)

#### Deprecated

Use minLength instead

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/transports/AsyncFileTransport.ts:83](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L83)

Whether transport is enabled.

#### Default

```ts
true
```

***

### filepath

> **filepath**: `string`

Defined in: [src/transports/AsyncFileTransport.ts:77](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L77)

File path for logs. Required.

#### Example

```ts
'/var/log/app.log'
```

***

### ~~flushInterval?~~

> `optional` **flushInterval**: `number`

Defined in: [src/transports/AsyncFileTransport.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L150)

#### Deprecated

Use minLength instead

***

### ~~forceSync?~~

> `optional` **forceSync**: `boolean`

Defined in: [src/transports/AsyncFileTransport.ts:153](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L153)

#### Deprecated

Use fsync instead

***

### fsync?

> `optional` **fsync**: `boolean`

Defined in: [src/transports/AsyncFileTransport.ts:144](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L144)

Force synchronous writes with fsync.
Warning: Enabling this significantly reduces performance.

#### Default

```ts
false
```

***

### level?

> `optional` **level**: `string`

Defined in: [src/transports/AsyncFileTransport.ts:89](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L89)

Minimum log level to process.

#### Default

```ts
'debug'
```

***

### maxWrite?

> `optional` **maxWrite**: `number`

Defined in: [src/transports/AsyncFileTransport.ts:113](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L113)

Maximum bytes to write in a single operation.
Controls the chunk size for each write system call.

Should be larger than minLength to allow efficient batching.
Typical values: 16KB-64KB depending on system I/O characteristics.

#### Default

```ts
16384 (16KB)
```

***

### minLength?

> `optional` **minLength**: `number`

Defined in: [src/transports/AsyncFileTransport.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L102)

Minimum buffer length before auto-flush (minLength in sonic-boom).
Controls when the buffer is automatically flushed to disk.

Performance considerations:
- Smaller values (1-4KB): Lower latency, more frequent writes
- Medium values (4-16KB): Balanced performance (recommended)
- Larger values (16-64KB): Higher throughput, higher memory usage

#### Default

```ts
4096 (4KB)
```

***

### mkdir?

> `optional` **mkdir**: `boolean`

Defined in: [src/transports/AsyncFileTransport.ts:119](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L119)

Create directory if it doesn't exist.

#### Default

```ts
true
```

***

### mode?

> `optional` **mode**: `number`

Defined in: [src/transports/AsyncFileTransport.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L131)

File mode for new files.

#### Default

```ts
0o666
```

***

### name?

> `optional` **name**: `string`

Defined in: [src/transports/AsyncFileTransport.ts:71](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L71)

Transport name for identification.

#### Default

```ts
'async-file'
```

***

### retryEAGAIN?

> `optional` **retryEAGAIN**: `boolean`

Defined in: [src/transports/AsyncFileTransport.ts:125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/AsyncFileTransport.ts#L125)

Retry on EAGAIN errors.

#### Default

```ts
true
```
