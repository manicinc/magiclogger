# Interface: W3CTraceContext

Defined in: [src/utils/trace-context.ts:26](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L26)

W3C Trace Context structure containing all trace correlation data.

 W3CTraceContext

## Properties

### parentSpanId?

> `optional` **parentSpanId**: `string`

Defined in: [src/utils/trace-context.ts:29](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L29)

Parent span ID for nested spans

***

### sampled?

> `optional` **sampled**: `boolean`

Defined in: [src/utils/trace-context.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L32)

Whether this trace is being sampled

***

### spanId?

> `optional` **spanId**: `string`

Defined in: [src/utils/trace-context.ts:28](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L28)

16 hex character span identifier

***

### traceFlags?

> `optional` **traceFlags**: `string`

Defined in: [src/utils/trace-context.ts:30](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L30)

Trace flags (01 = sampled, 00 = not sampled)

***

### traceId

> **traceId**: `string`

Defined in: [src/utils/trace-context.ts:27](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L27)

32 hex character trace identifier

***

### traceState?

> `optional` **traceState**: `string`

Defined in: [src/utils/trace-context.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L31)

Vendor-specific trace state
