# Interface: FileTransportOptions

Defined in: [src/transports/FileTransport.ts:26](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L26)

Configuration options for FileWorkerTransport.

 FileWorkerTransportOptions

## Properties

### bufferSize?

> `optional` **bufferSize**: `number`

Defined in: [src/transports/FileTransport.ts:47](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L47)

Buffer size in the worker.

#### Default

```ts
10000
```

***

### compress?

> `optional` **compress**: `boolean`

Defined in: [src/transports/FileTransport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L70)

Whether to compress rotated files.

#### Default

```ts
false
```

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/transports/FileTransport.ts:41](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L41)

Whether this transport is enabled.

#### Default

```ts
true
```

***

### filepath

> **filepath**: `string`

Defined in: [src/transports/FileTransport.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L35)

File path to write logs to.

***

### flushInterval?

> `optional` **flushInterval**: `number`

Defined in: [src/transports/FileTransport.ts:53](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L53)

Flush interval in milliseconds.

#### Default

```ts
100
```

***

### format?

> `optional` **format**: `"json"` \| `"plain"`

Defined in: [src/transports/FileTransport.ts:59](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L59)

Format for log entries.

#### Default

```ts
'json'
```

***

### maxFileSize?

> `optional` **maxFileSize**: `number`

Defined in: [src/transports/FileTransport.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L64)

Maximum file size before rotation (bytes).

***

### name?

> `optional` **name**: `string`

Defined in: [src/transports/FileTransport.ts:30](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/FileTransport.ts#L30)

Transport name.
