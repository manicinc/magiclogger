/**
 * HTTP Transport Entry Point
 *
 * This module provides HTTP transport functionality for MagicLogger.
 * Import this module directly for optimal tree-shaking.
 *
 * @module transports/http
 */

// Re-export HTTP transport functionality
export { HTTPTransport } from './base/implementations/HttpTransport';
export type { HTTPTransportOptions } from '../types/transport';

// Import for internal use
import { HTTPTransport } from './base/implementations/HttpTransport';

// Factory function for convenience
export function createHTTPTransport(url: string, options?: Record<string, unknown>) {
  const hostName = new URL(url).hostname;
  return new HTTPTransport({ name: `http-${hostName}`, url, ...options });
}

// Register with TransportRegistry for factory support
import { TransportRegistry } from './index';

TransportRegistry.register('http', config => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, ...httpOptions } = config;
  if (!httpOptions.url) {
    throw new Error('HTTPTransport requires url option');
  }
  return new HTTPTransport({
    name: config.name || 'http',
    url: httpOptions.url as string,
    ...httpOptions,
  });
});
