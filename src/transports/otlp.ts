// File: src/transports/otlp.ts

/**
 * OTLP Transport Entry Point
 * 
 * Provides OpenTelemetry Protocol transport for sending logs to OTLP-compatible backends.
 * 
 * @module transports/otlp
 * 
 * @example
 * ```typescript
 * import { OTLPTransport } from 'magiclogger/transports/otlp';
 * 
 * const transport = new OTLPTransport({
 *   endpoint: 'http://localhost:4318',
 *   serviceName: 'my-service',
 *   resource: {
 *     'deployment.environment': 'production'
 *   }
 * });
 * ```
 */

export { OTLPTransport } from './base/implementations/OTLPTransport';
export type { OTLPTransportOptions } from './base/implementations/OTLPTransport';

// Re-export for convenience
import { OTLPTransport } from './base/implementations/OTLPTransport';
import type { OTLPTransportOptions } from './base/implementations/OTLPTransport';
import { TransportRegistry } from './index';

/**
 * Creates an OTLP transport with common defaults.
 * 
 * @param {string} serviceName - Service name
 * @param {Partial<OTLPTransportOptions>} options - Additional options
 * @returns {OTLPTransport} Configured transport
 * 
 * @example
 * ```typescript
 * const transport = createOTLPTransport('my-service', {
 *   endpoint: 'https://otlp.example.com:4318',
 *   headers: { 'x-api-key': 'secret' }
 * });
 * ```
 */
export function createOTLPTransport(
  serviceName: string,
  options: Partial<OTLPTransportOptions> = {}
): OTLPTransport {
  return new OTLPTransport({
    name: options.name || 'otlp',
    serviceName,
    ...options
  });
}

// Register with TransportRegistry for factory support
TransportRegistry.register('otlp', (config) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, name, serviceName, ...rest } = config as Record<string, unknown>;
  if (!serviceName || typeof serviceName !== 'string') {
    throw new Error('OTLPTransport requires serviceName');
  }
  return new OTLPTransport({
    name: (name as string) || 'otlp',
    serviceName: serviceName as string,
    ...(rest as Partial<OTLPTransportOptions>),
  });
});

/**
 * Creates an OTLP transport for Jaeger.
 * 
 * @param {string} serviceName - Service name
 * @param {string} [endpoint] - Jaeger endpoint
 * @returns {OTLPTransport} Configured transport
 */
export function createJaegerTransport(
  serviceName: string,
  endpoint = 'http://localhost:14268'
): OTLPTransport {
  return new OTLPTransport({
    name: 'otlp-jaeger',
    serviceName,
    endpoint,
    exportPath: '/api/v2/logs',
    protocol: 'http/json'
  });
}

/**
 * Creates an OTLP transport for Grafana Cloud.
 * 
 * @param {string} serviceName - Service name
 * @param {string} instanceId - Grafana instance ID
 * @param {string} apiKey - API key
 * @returns {OTLPTransport} Configured transport
 */
export function createGrafanaCloudTransport(
  serviceName: string,
  instanceId: string,
  apiKey: string
): OTLPTransport {
  return new OTLPTransport({
    name: 'otlp-grafana',
    serviceName,
    endpoint: `https://${instanceId}.grafana.net`,
    exportPath: '/otlp/v1/logs',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    protocol: 'http/protobuf',
    compression: 'gzip'
  });
}

/**
 * Creates an OTLP transport for New Relic.
 * 
 * @param {string} serviceName - Service name
 * @param {string} apiKey - New Relic API key
 * @param {string} [region] - Region (us or eu)
 * @returns {OTLPTransport} Configured transport
 */
export function createNewRelicTransport(
  serviceName: string,
  apiKey: string,
  region: 'us' | 'eu' = 'us'
): OTLPTransport {
  const endpoint = region === 'eu' 
    ? 'https://otlp.eu01.nr-data.net'
    : 'https://otlp.nr-data.net';

  return new OTLPTransport({
    name: 'otlp-newrelic',
    serviceName,
    endpoint,
    exportPath: '/v1/logs',
    headers: {
      'Api-Key': apiKey
    },
    protocol: 'http/protobuf',
    compression: 'gzip'
  });
}

/**
 * Creates an OTLP transport for Honeycomb.
 * 
 * @param {string} serviceName - Service name
 * @param {string} apiKey - Honeycomb API key
 * @param {string} [dataset] - Dataset name
 * @returns {OTLPTransport} Configured transport
 */
export function createHoneycombTransport(
  serviceName: string,
  apiKey: string,
  dataset = 'logs'
): OTLPTransport {
  return new OTLPTransport({
    name: 'otlp-honeycomb',
    serviceName,
    endpoint: 'https://api.honeycomb.io',
    exportPath: '/v1/logs',
    headers: {
      'x-honeycomb-team': apiKey,
      'x-honeycomb-dataset': dataset
    },
    protocol: 'http/protobuf',
    compression: 'gzip'
  });
}

/**
 * Creates an OTLP transport for AWS X-Ray.
 * 
 * @param {string} serviceName - Service name
 * @param {string} region - AWS region
 * @returns {OTLPTransport} Configured transport
 */
export function createXRayTransport(
  serviceName: string,
  region: string
): OTLPTransport {
  return new OTLPTransport({
    name: 'otlp-xray',
    serviceName,
    endpoint: `https://xray.${region}.amazonaws.com`,
    exportPath: '/v1/logs',
    protocol: 'http/protobuf',
    resource: {
      'cloud.provider': 'aws',
      'cloud.region': region
    }
  });
}

/**
 * Creates an OTLP transport for Google Cloud Operations.
 * 
 * @param {string} serviceName - Service name
 * @param {string} projectId - GCP project ID
 * @returns {OTLPTransport} Configured transport
 */
export function createGoogleCloudTransport(
  serviceName: string,
  projectId: string
): OTLPTransport {
  return new OTLPTransport({
    name: 'otlp-gcp',
    serviceName,
    endpoint: 'https://cloudtrace.googleapis.com',
    exportPath: `/v2/projects/${projectId}/logs`,
    protocol: 'http/json',
    resource: {
      'cloud.provider': 'gcp',
      'cloud.project': projectId
    }
  });
}

/**
 * Creates an OTLP transport for Datadog.
 * 
 * @param {string} serviceName - Service name
 * @param {string} apiKey - Datadog API key
 * @param {string} [site] - Datadog site
 * @returns {OTLPTransport} Configured transport
 */
export function createDatadogTransport(
  serviceName: string,
  apiKey: string,
  site = 'datadoghq.com'
): OTLPTransport {
  return new OTLPTransport({
    name: 'otlp-datadog',
    serviceName,
    endpoint: `https://http-intake.logs.${site}`,
    exportPath: '/api/v2/logs',
    headers: {
      'DD-API-KEY': apiKey
    },
    protocol: 'http/json',
    resource: {
      'service': serviceName,
      'ddsource': 'nodejs',
      'ddtags': `service:${serviceName}`
    }
  });
}

/**
 * Creates an OTLP transport for Elastic APM.
 * 
 * @param {string} serviceName - Service name
 * @param {string} serverUrl - APM server URL
 * @param {string} [secretToken] - Secret token
 * @returns {OTLPTransport} Configured transport
 */
export function createElasticAPMTransport(
  serviceName: string,
  serverUrl: string,
  secretToken?: string
): OTLPTransport {
  const headers: Record<string, string> = {};
  if (secretToken) {
    headers['Authorization'] = `Bearer ${secretToken}`;
  }

  return new OTLPTransport({
    name: 'otlp-elastic',
    serviceName,
    endpoint: serverUrl,
    exportPath: '/intake/v2/logs',
    headers,
    protocol: 'http/json'
  });
}