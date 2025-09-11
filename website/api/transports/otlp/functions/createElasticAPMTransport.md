# Function: createElasticAPMTransport()

> **createElasticAPMTransport**(`serviceName`, `serverUrl`, `secretToken?`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:253](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L253)

Creates an OTLP transport for Elastic APM.

## Parameters

### serviceName

`string`

Service name

### serverUrl

`string`

APM server URL

### secretToken?

`string`

Secret token

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport
