# Function: createOTLPObservability()

> **createOTLPObservability**(`options`): [`ObservabilityMiddleware`](../classes/ObservabilityMiddleware.md)

Defined in: [src/middleware/ObservabilityMiddleware.ts:454](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L454)

OpenTelemetry helper for easy integration.

## Parameters

### options

#### api?

\{ `trace?`: \{ `getActiveSpan?`: () => `undefined` \| \{ `spanContext`: \{ `spanId`: `string`; `traceFlags`: `number`; `traceId`: `string`; `traceState?`: ... \| ...; \}; \}; \}; \}

#### api.trace?

\{ `getActiveSpan?`: () => `undefined` \| \{ `spanContext`: \{ `spanId`: `string`; `traceFlags`: `number`; `traceId`: `string`; `traceState?`: ... \| ...; \}; \}; \}

#### api.trace.getActiveSpan?

() => `undefined` \| \{ `spanContext`: \{ `spanId`: `string`; `traceFlags`: `number`; `traceId`: `string`; `traceState?`: ... \| ...; \}; \}

#### config?

`Partial`\<[`ObservabilityMiddlewareOptions`](../interfaces/ObservabilityMiddlewareOptions.md)\>

#### metricsCollector?

[`MetricsCollector`](../interfaces/MetricsCollector.md)

#### onMetrics?

(`metrics`) => `void`

## Returns

[`ObservabilityMiddleware`](../classes/ObservabilityMiddleware.md)

## Example

```typescript
import { trace } from '@opentelemetry/api';
import { createOTLPObservability } from 'magiclogger/middleware';

const observability = createOTLPObservability({
  api: { trace },
  onMetrics: (metrics) => console.log('Metrics:', metrics)
});

logger.addMiddleware(observability);
```
