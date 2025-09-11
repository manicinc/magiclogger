# Function: createOTLPTransport()

> **createOTLPTransport**(`serviceName`, `options`): [`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Defined in: [src/transports/otlp.ts:47](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/otlp.ts#L47)

Creates an OTLP transport with common defaults.

## Parameters

### serviceName

`string`

Service name

### options

`Partial`\<[`OTLPTransportOptions`](../../base/implementations/OTLPTransport/interfaces/OTLPTransportOptions.md)\> = `{}`

Additional options

## Returns

[`OTLPTransport`](../../base/implementations/OTLPTransport/classes/OTLPTransport.md)

Configured transport

## Example

```typescript
const transport = createOTLPTransport('my-service', {
  endpoint: 'https://otlp.example.com:4318',
  headers: { 'x-api-key': 'secret' }
});
```
