# Function: isBatchingTransport()

> **isBatchingTransport**(`transport`): `transport is Transport & { logBatch: (entries: LogEntry[]) => Promise<void> }`

Defined in: [src/transports/base/Transport.ts:745](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L745)

Type guard for checking if transport supports batching.

## Parameters

### transport

`unknown`

Object to check

## Returns

`transport is Transport & { logBatch: (entries: LogEntry[]) => Promise<void> }`

True if transport supports batching
