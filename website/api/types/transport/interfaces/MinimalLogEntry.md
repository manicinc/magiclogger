# Interface: MinimalLogEntry

Defined in: [src/types/transport.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L13)

Minimal log entry for maximum performance.
This is what Logger creates internally.
Transports can enrich this to full LogEntry if needed.

## Indexable

\[`key`: `string`\]: `any`

Any additional properties are metadata

## Properties

### level

> **level**: `number`

Defined in: [src/types/transport.ts:15](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L15)

Integer log level (10=trace, 20=debug, 30=info, 40=warn, 50=error, 60=fatal)

***

### msg

> **msg**: `string`

Defined in: [src/types/transport.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L19)

Log message

***

### time

> **time**: `number`

Defined in: [src/types/transport.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L17)

Unix timestamp in milliseconds
