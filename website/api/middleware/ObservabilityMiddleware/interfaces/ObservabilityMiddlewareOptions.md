# Interface: ObservabilityMiddlewareOptions

Defined in: [src/middleware/ObservabilityMiddleware.ts:45](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L45)

Observability middleware configuration.

## Properties

### collectMetrics?

> `optional` **collectMetrics**: `boolean`

Defined in: [src/middleware/ObservabilityMiddleware.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L50)

Enable performance metrics collection.

#### Default

```ts
true
```

***

### generateCorrelationId?

> `optional` **generateCorrelationId**: `boolean`

Defined in: [src/middleware/ObservabilityMiddleware.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L62)

Enable automatic correlation ID generation.

#### Default

```ts
true
```

***

### getTraceContext()?

> `optional` **getTraceContext**: () => `undefined` \| [`TraceContext`](TraceContext.md)

Defined in: [src/middleware/ObservabilityMiddleware.ts:72](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L72)

Function to get current trace context (for OpenTelemetry integration).

#### Returns

`undefined` \| [`TraceContext`](TraceContext.md)

***

### includeHealthMetadata?

> `optional` **includeHealthMetadata**: `boolean`

Defined in: [src/middleware/ObservabilityMiddleware.ts:78](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L78)

Enable health check metadata.

#### Default

```ts
false
```

***

### injectTraceContext?

> `optional` **injectTraceContext**: `boolean`

Defined in: [src/middleware/ObservabilityMiddleware.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L56)

Enable trace context injection for OpenTelemetry.

#### Default

```ts
true
```

***

### metricsCollector?

> `optional` **metricsCollector**: [`MetricsCollector`](MetricsCollector.md)

Defined in: [src/middleware/ObservabilityMiddleware.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L67)

Custom metrics collector implementation.

***

### metricsSampleRate?

> `optional` **metricsSampleRate**: `number`

Defined in: [src/middleware/ObservabilityMiddleware.ts:106](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L106)

Sample rate for detailed metrics (0-1).

#### Default

```ts
0.1
```

***

### onMetrics()?

> `optional` **onMetrics**: (`metrics`) => `void`

Defined in: [src/middleware/ObservabilityMiddleware.ts:89](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L89)

Callback for metrics events.

#### Parameters

##### metrics

[`LogMetrics`](LogMetrics.md)

#### Returns

`void`

***

### onSlowLog()?

> `optional` **onSlowLog**: (`entry`, `duration`) => `void`

Defined in: [src/middleware/ObservabilityMiddleware.ts:94](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L94)

Callback for slow log detection.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

##### duration

`number`

#### Returns

`void`

***

### slowLogThreshold?

> `optional` **slowLogThreshold**: `number`

Defined in: [src/middleware/ObservabilityMiddleware.ts:100](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L100)

Slow log threshold in milliseconds.

#### Default

```ts
100
```

***

### trackResourceUsage?

> `optional` **trackResourceUsage**: `boolean`

Defined in: [src/middleware/ObservabilityMiddleware.ts:84](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L84)

Enable resource utilization tracking.

#### Default

```ts
false
```
