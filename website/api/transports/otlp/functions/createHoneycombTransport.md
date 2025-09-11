# Function: createHoneycombTransport()

> **createHoneycombTransport**(`serviceName`, `apiKey`, `dataset?`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:154](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L154)

Creates an OTLP transport for Honeycomb.

## Parameters

### serviceName

`string`

Service name

### apiKey

`string`

Honeycomb API key

### dataset?

`string` = `'logs'`

Dataset name

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport
