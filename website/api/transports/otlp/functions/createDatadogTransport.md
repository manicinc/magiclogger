# Function: createDatadogTransport()

> **createDatadogTransport**(`serviceName`, `apiKey`, `site?`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:223](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L223)

Creates an OTLP transport for Datadog.

## Parameters

### serviceName

`string`

Service name

### apiKey

`string`

Datadog API key

### site?

`string` = `'datadoghq.com'`

Datadog site

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport
