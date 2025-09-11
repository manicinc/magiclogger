# Function: createJaegerTransport()

> **createJaegerTransport**(`serviceName`, `endpoint?`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:79](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L79)

Creates an OTLP transport for Jaeger.

## Parameters

### serviceName

`string`

Service name

### endpoint?

`string` = `'http://localhost:14268'`

Jaeger endpoint

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport
