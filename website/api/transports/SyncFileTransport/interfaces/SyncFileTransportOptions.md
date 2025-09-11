# Interface: SyncFileTransportOptions

Defined in: [src/transports/SyncFileTransport.ts:51](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L51)

Configuration options for the synchronous file transport.

 SyncFileTransportOptions

## Since

1.0.0

## Properties

### bufferSize?

> `optional` **bufferSize**: `number`

Defined in: [src/transports/SyncFileTransport.ts:87](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L87)

Number of log entries to buffer before writing.
Higher values improve throughput but increase memory usage and risk of data loss.

WARNING: Buffered logs can be lost if the process crashes!
- bufferSize=1: Immediate write (safest, ~20k ops/sec)
- bufferSize=100: Small buffer (balanced, ~40k ops/sec)
- bufferSize=1000: Large buffer (fastest but risky, ~25k ops/sec)

#### Default

```ts
1000
```

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/transports/SyncFileTransport.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L68)

Whether the transport is enabled.

#### Default

```ts
true
```

***

### filepath

> **filepath**: `string`

Defined in: [src/transports/SyncFileTransport.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L62)

Path to the log file.
Directories will be created automatically if they don't exist.

***

### flushInterval?

> `optional` **flushInterval**: `number`

Defined in: [src/transports/SyncFileTransport.ts:94](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L94)

Interval in milliseconds between automatic flushes.
Set to 0 to disable time-based flushing.

#### Default

```ts
100
```

***

### forceSync?

> `optional` **forceSync**: `boolean`

Defined in: [src/transports/SyncFileTransport.ts:135](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L135)

Force fsync after each write for maximum durability.
This guarantees logs are on disk but reduces performance to ~1000 ops/sec.
Only use for critical audit logs.

#### Default

```ts
false
```

***

### formatter()?

> `optional` **formatter**: (`entry`) => `string`

Defined in: [src/transports/SyncFileTransport.ts:127](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L127)

Custom formatter for log entries.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string`

Formatted string to write

***

### highWaterMark?

> `optional` **highWaterMark**: `number`

Defined in: [src/transports/SyncFileTransport.ts:101](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L101)

Size of the kernel write buffer in bytes.
Larger buffers reduce system calls and improve performance.

#### Default

```ts
65536 (64KB)
```

***

### level?

> `optional` **level**: `string`

Defined in: [src/transports/SyncFileTransport.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L74)

Minimum log level to write.

#### Default

```ts
'debug'
```

***

### maxFiles?

> `optional` **maxFiles**: `number`

Defined in: [src/transports/SyncFileTransport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L114)

Maximum number of rotated files to keep.

#### Default

```ts
5
```

***

### maxFileSize?

> `optional` **maxFileSize**: `number`

Defined in: [src/transports/SyncFileTransport.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L108)

Maximum file size in bytes before rotation.
Set to 0 to disable rotation.

#### Default

```ts
0
```

***

### name?

> `optional` **name**: `string`

Defined in: [src/transports/SyncFileTransport.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L56)

Transport identifier.

#### Default

```ts
'sync-file'
```

***

### timestamp?

> `optional` **timestamp**: `boolean`

Defined in: [src/transports/SyncFileTransport.ts:120](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L120)

Whether to append timestamp to filename.

#### Default

```ts
false
```
