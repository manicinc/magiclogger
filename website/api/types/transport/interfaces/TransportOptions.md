# Interface: TransportOptions

Defined in: [src/types/transport.ts:197](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L197)

Transport configuration base interface.
All transports must implement these core options.

## Extended by

- [`BatchingTransportOptions`](BatchingTransportOptions.md)
- [`ConsoleTransportOptions`](ConsoleTransportOptions.md)
- [`FileTransportOptions`](FileTransportOptions.md)
- [`WebSocketTransportOptions`](WebSocketTransportOptions.md)
- [`StreamTransportOptions`](StreamTransportOptions.md)

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/types/transport.ts:209](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L209)

Whether this transport is currently active.
Allows runtime enabling/disabling of transports.

#### Default

```ts
true
```

***

### excludeTags?

> `optional` **excludeTags**: `string`[]

Defined in: [src/types/transport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L234)

Tags that exclude logs from this transport.
Logs with any of these tags are skipped.

***

### filter()?

> `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/types/transport.ts:240](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L240)

Custom filter function for advanced filtering logic.
Return true to process the log, false to skip.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`boolean`

***

### format?

> `optional` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/types/transport.ts:246](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L246)

Output format for this transport.

#### Default

```ts
'json'
```

***

### formatter()?

> `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/types/transport.ts:252](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L252)

Custom formatter function.
Used when format is 'custom'.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`string` \| `Buffer`

***

### level?

> `optional` **level**: `string`

Defined in: [src/types/transport.ts:216](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L216)

Minimum log level this transport will handle.
Logs below this level are ignored by this transport.

#### Default

```ts
'info'
```

***

### levels?

> `optional` **levels**: `string`[]

Defined in: [src/types/transport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L222)

Custom levels this transport should handle.
Allows fine-grained control over what gets logged where.

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L202)

Unique name identifier for this transport instance.
Used for managing multiple transports.

***

### silent?

> `optional` **silent**: `boolean`

Defined in: [src/types/transport.ts:258](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L258)

Whether to handle errors silently or propagate them.

#### Default

```ts
true
```

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L228)

Tags that must be present for this transport to handle a log.
If specified, only logs with at least one matching tag are processed.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/transport.ts:264](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L264)

Timeout for transport operations in milliseconds.

#### Default

```ts
30000 (30 seconds)
```
