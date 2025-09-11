# Interface: LogEntry

Defined in: [src/types/transport.ts:48](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L48)

MAGIC Schema v1 - Core log entry structure.

This interface implements the MAGIC Schema specification for
cross-language compatibility and seamless observability integration.

## See

https://github.com/magiclogger/magiclog-schema

## Properties

### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/transport.ts:121](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L121)

User-provided structured context data.
Can contain any application-specific data.

***

### environment?

> `optional` **environment**: `string`

Defined in: [src/types/transport.ts:109](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L109)

Deployment environment.

#### Example

```ts
"development" | "staging" | "production"
```

***

### error?

> `optional` **error**: `object`

Defined in: [src/types/transport.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L126)

Structured error information.

#### cause?

> `optional` **cause**: `unknown`

#### code?

> `optional` **code**: `string` \| `number`

#### message

> **message**: `string`

#### name

> **name**: `string`

#### stack?

> `optional` **stack**: `string`

***

### id

> **id**: `string`

Defined in: [src/types/transport.ts:54](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L54)

Unique identifier for this log entry.
Format: "timestamp-randomComponent" (e.g., "1733938475123-abc123xyz")

***

### level

> **level**: `string`

Defined in: [src/types/transport.ts:77](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L77)

Log level following syslog RFC5424 severity.

***

### loggerId?

> `optional` **loggerId**: `string`

Defined in: [src/types/transport.ts:97](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L97)

Logger instance identifier.
Useful for multi-logger applications.

***

### message

> **message**: `string`

Defined in: [src/types/transport.ts:83](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L83)

Plain text log message without any formatting codes.
This is the primary message content for all transports.

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/transport.ts:138](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L138)

Automatically collected runtime information.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### health?

> `optional` **health**: `object`

##### health.pid?

> `optional` **pid**: `number`

##### health.timestamp

> **timestamp**: `number`

##### health.uptime?

> `optional` **uptime**: `number`

#### hostname?

> `optional` **hostname**: `string`

#### nodeVersion?

> `optional` **nodeVersion**: `string`

#### pid?

> `optional` **pid**: `number`

#### platform?

> `optional` **platform**: `string`

#### resources?

> `optional` **resources**: `object`

##### resources.cpu?

> `optional` **cpu**: `object`

##### resources.cpu.system

> **system**: `number`

##### resources.cpu.user

> **user**: `number`

##### resources.memory?

> `optional` **memory**: `object`

##### resources.memory.arrayBuffers

> **arrayBuffers**: `number`

##### resources.memory.external

> **external**: `number`

##### resources.memory.heapTotal

> **heapTotal**: `number`

##### resources.memory.heapUsed

> **heapUsed**: `number`

##### resources.memory.rss

> **rss**: `number`

#### trace?

> `optional` **trace**: `object`

##### trace.parentSpanId?

> `optional` **parentSpanId**: `string`

##### trace.spanId?

> `optional` **spanId**: `string`

##### trace.traceFlags?

> `optional` **traceFlags**: `string`

##### trace.traceId?

> `optional` **traceId**: `string`

##### trace.traceState?

> `optional` **traceState**: `string`

#### userAgent?

> `optional` **userAgent**: `string`

***

### schemaVersion?

> `optional` **schemaVersion**: `"v1"`

Defined in: [src/types/transport.ts:71](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L71)

MAGIC schema version for compatibility.

#### Default

```ts
"v1"
```

***

### service?

> `optional` **service**: `string`

Defined in: [src/types/transport.ts:103](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L103)

Service name for microservice architectures.
Maps to service.name in OpenTelemetry.

***

### styles?

> `optional` **styles**: \[`number`, `number`, `string`\][]

Defined in: [src/types/transport.ts:90](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L90)

Optional style ranges for reconstructing formatted output.
Each entry is [startIndex, endIndex, styleDescriptor].
Example: [[0, 6, "red.bold"], [12, 29, "cyan"]]

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L114)

Categorization tags for filtering and routing.

***

### timestamp

> **timestamp**: `string`

Defined in: [src/types/transport.ts:60](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L60)

ISO 8601 timestamp when the log was created.

#### Example

```ts
"2025-08-14T12:34:35.123Z"
```

***

### timestampMs

> **timestampMs**: `number`

Defined in: [src/types/transport.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L65)

Unix timestamp in milliseconds for efficient sorting/filtering.

***

### trace?

> `optional` **trace**: `object`

Defined in: [src/types/transport.ts:184](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L184)

Distributed tracing context.
Follows OpenTelemetry trace context specification.

#### parentSpanId?

> `optional` **parentSpanId**: `string`

#### spanId?

> `optional` **spanId**: `string`

#### traceFlags?

> `optional` **traceFlags**: `string`

#### traceId?

> `optional` **traceId**: `string`

#### traceState?

> `optional` **traceState**: `string`
