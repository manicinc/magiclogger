# Function: createXRayTransport()

> **createXRayTransport**(`serviceName`, `region`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:180](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L180)

Creates an OTLP transport for AWS X-Ray.

## Parameters

### serviceName

`string`

Service name

### region

`string`

AWS region

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport
