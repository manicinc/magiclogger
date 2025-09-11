# Function: createGrafanaCloudTransport()

> **createGrafanaCloudTransport**(`serviceName`, `instanceId`, `apiKey`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:100](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L100)

Creates an OTLP transport for Grafana Cloud.

## Parameters

### serviceName

`string`

Service name

### instanceId

`string`

Grafana instance ID

### apiKey

`string`

API key

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport
