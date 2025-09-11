/**
 * @fileoverview HTTP Transport Module
 *
 * Production-ready HTTP transport using worker threads for all network operations.
 * Features batching, compression, retries, and circuit breaker pattern.
 *
 * @module transports/http
 *
 * @example
 * ```typescript
 * import { HTTPTransport } from 'magiclogger/transports/http';
 *
 * const httpTransport = new HTTPTransport({
 *   endpoint: 'https://logs.example.com/api/logs',
 *   batchSize: 100,
 *   compress: true,
 *   headers: {
 *     'Authorization': 'Bearer ' + token
 *   }
 * });
 *
 * // Non-blocking - handled in worker thread
 * httpTransport.log(entry);
 * ```
 */

// Export the HTTP transport
export { HTTPTransport } from './HTTPTransport';
export type { HTTPTransportOptions } from './HTTPTransport';

// Import for internal use
import { HTTPTransport } from './HTTPTransport';

/**
 * Creates an HTTP transport using worker threads.
 *
 * All network operations happen in a dedicated worker thread,
 * including batching, compression, and retries.
 *
 * @param {string} endpoint - HTTP endpoint URL
 * @param {Record<string, unknown>} [options] - Transport options
 * @returns {HTTPTransport} Worker-based HTTP transport
 *
 * @example
 * ```typescript
 * const transport = createHTTPTransport('https://logs.example.com', {
 *   batchSize: 200,
 *   flushInterval: 5000,
 *   compress: true,
 *   maxRetries: 5,
 *   circuitBreakerThreshold: 3
 * });
 * ```
 */
export function createHTTPTransport(endpoint: string, options?: Record<string, unknown>) {
  const hostName = new URL(endpoint).hostname;
  return new HTTPTransport({
    name: `http-${hostName}`,
    endpoint,
    ...options,
  });
}

/**
 * Alias for createHTTPTransport.
 * @see {@link createHTTPTransport}
 */
export const createHTTP = createHTTPTransport;

// Register with TransportRegistry for factory support
import { TransportRegistry } from './index';

TransportRegistry.register('http', config => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, ...httpOptions } = config;

  // Support both 'endpoint' and 'url' for compatibility
  const endpoint = httpOptions.endpoint || httpOptions.url;
  if (!endpoint) {
    throw new Error('HTTPTransport requires url option');
  }

  return new HTTPTransport({
    name: config.name || 'http',
    endpoint: endpoint as string,
    ...httpOptions,
  });
});
