/**
 * Console Transport Entry Point
 *
 * This module provides console transport functionality for MagicLogger.
 * Import this module directly for optimal tree-shaking.
 *
 * @module transports/console
 */

// Re-export console transport functionality
export { ConsoleTransport } from './base/implementations/ConsoleTransport';
export type { ConsoleTransportOptions } from './base/implementations/ConsoleTransport';

// Import for internal use
import { ConsoleTransport } from './base/implementations/ConsoleTransport';

// Factory function for convenience
export function createConsoleTransport(options?: Record<string, unknown>) {
  return new ConsoleTransport({ name: 'console', ...options });
}

// Register with TransportRegistry for factory support
import { TransportRegistry } from './index';

TransportRegistry.register('console', config => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, ...consoleOptions } = config;
  return new ConsoleTransport({ name: config.name || 'console', ...consoleOptions });
});
