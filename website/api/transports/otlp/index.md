# transports/otlp

OTLP Transport Entry Point

Provides OpenTelemetry Protocol transport for sending logs to OTLP-compatible backends.

## Example

```typescript
import { OTLPTransport } from 'magiclogger/transports/otlp';

const transport = new OTLPTransport({
  endpoint: 'http://localhost:4318',
  serviceName: 'my-service',
  resource: {
    'deployment.environment': 'production'
  }
});
```

## Functions

- [createDatadogTransport](functions/createDatadogTransport.md)
- [createElasticAPMTransport](functions/createElasticAPMTransport.md)
- [createGoogleCloudTransport](functions/createGoogleCloudTransport.md)
- [createGrafanaCloudTransport](functions/createGrafanaCloudTransport.md)
- [createHoneycombTransport](functions/createHoneycombTransport.md)
- [createJaegerTransport](functions/createJaegerTransport.md)
- [createNewRelicTransport](functions/createNewRelicTransport.md)
- [createOTLPTransport](functions/createOTLPTransport.md)
- [createXRayTransport](functions/createXRayTransport.md)

## References

### OTLPTransport

Re-exports [OTLPTransport](../base/implementations/OTLPTransport/classes/OTLPTransport.md)

***

### OTLPTransportOptions

Re-exports [OTLPTransportOptions](../base/implementations/OTLPTransport/interfaces/OTLPTransportOptions.md)
