# Function: createNewRelicTransport()

> **createNewRelicTransport**(`serviceName`, `apiKey`, `region?`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L126)

Creates an OTLP transport for New Relic.

## Parameters

### serviceName

`string`

Service name

### apiKey

`string`

New Relic API key

### region?

Region (us or eu)

`"us"` | `"eu"`

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport
