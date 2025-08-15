// File: src/transports/index.ts

/**
 * MagicLogger Transport System
 *
 * This module exports base transport functionality and types only.
 * Individual transport implementations should be imported directly from their
 * specific entry points to enable tree-shaking.
 *
 * @module transports
 *
 * @example
 * ```typescript
 * // ✅ Good - Tree-shakable imports
 * import { Transport } from 'magiclogger/transports/base';
 * import { ConsoleTransport } from 'magiclogger/console';
 * import { FileTransport } from 'magiclogger/file';
 *
 * // ❌ Bad - Imports everything
 * import { ConsoleTransport, FileTransport } from 'magiclogger/transports';
 * ```
 */

// Base classes only - no implementations
export { Transport } from './base/Transport';
export { TransportManager } from './base/TransportManager';

// Import types for local use
import type {
  TransportConfig,
  TransportManagerOptions,
  Transport as ITransport,
} from '../types/transport';
import { TransportManager } from './base/TransportManager';

// Re-export all types
export type {
  // Core interfaces
  LogEntry,
  TransportOptions,
  TransportStats,
  TransportConfig,
  TransportType,

  // Batching
  BatchingOptions,
  BatchingTransportOptions,

  // Network
  NetworkTransportOptions,
  RetryOptions,

  // Implementation-specific
  ConsoleTransportOptions,
  FileTransportOptions,
  S3TransportOptions,
  HTTPTransportOptions,
  MongoDBTransportOptions,
  WebSocketTransportOptions,
  StreamTransportOptions,

  // Manager
  TransportManagerOptions,
} from '../types/transport';

// OTLP is defined in its own entry; re-export its options type here for convenience
export type { OTLPTransportOptions } from './otlp';

// Re-export Transport interface as ITransport for backwards compatibility
export type { Transport as ITransport } from './base/Transport';

/**
 * Factory type for creating transports dynamically
 */
export type TransportFactory = (config: TransportConfig) => ITransport;

/**
 * Registry for transport factories to enable tree-shaking
 * Transports are registered only when explicitly imported
 */
export class TransportRegistry {
  private static factories = new Map<string, TransportFactory>();

  /**
   * Register a transport factory
   * @param {string} type - Transport type identifier
   * @param {TransportFactory} factory - Factory function
   */
  static register(type: string, factory: TransportFactory): void {
    this.factories.set(type, factory);
  }

  /**
   * Get a transport factory
   * @param {string} type - Transport type identifier
   * @returns {TransportFactory | undefined} Factory function if found
   */
  static get(type: string): TransportFactory | undefined {
    return this.factories.get(type);
  }

  /**
   * Check if a transport type is registered
   * @param {string} type - Transport type identifier
   * @returns {boolean} True if registered
   */
  static has(type: string): boolean {
    return this.factories.has(type);
  }

  /**
   * Get all registered transport types
   * @returns {string[]} Array of registered types
   */
  static getTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Clear all registered factories
   */
  static clear(): void {
    this.factories.clear();
  }
}

// Set up global registry for TransportManager to access
declare global {
  interface Window {
    __MAGICLOGGER_TRANSPORT_REGISTRY__?: typeof TransportRegistry;
  }

  // eslint-disable-next-line no-var
  var __MAGICLOGGER_TRANSPORT_REGISTRY__: typeof TransportRegistry | undefined;
}

/**
 * Internal helper to install the TransportRegistry onto a global-like object.
 * Exposed for tests so we can exercise all environment branches (global/window/none).
 * @internal
 * @param g Global-like object (e.g. globalThis)
 * @param w Window-like object
 * @returns Which target received the registry ('global' | 'window' | 'none')
 */
export function __installTransportRegistry(
  g: Record<string, unknown> | undefined | null,
  w: Record<string, unknown> | undefined | null
): 'global' | 'window' | 'none' {
  if (g) {
    (g as Record<string, unknown>).__MAGICLOGGER_TRANSPORT_REGISTRY__ = TransportRegistry;
    return 'global';
  } else if (w) {
    (w as Record<string, unknown>).__MAGICLOGGER_TRANSPORT_REGISTRY__ = TransportRegistry;
    return 'window';
  }
  return 'none';
}

// Install on real environment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - window may be undefined in Node
const maybeWindow: unknown = typeof window !== 'undefined' ? window : undefined;
__installTransportRegistry(
  // globalThis may not exist in very old runtimes (defensive)
  typeof globalThis !== 'undefined'
    ? (globalThis as unknown as Record<string, unknown>)
    : undefined,
  maybeWindow as Record<string, unknown> | undefined
);

/**
 * Convenience function to create a pre-configured transport manager
 *
 * @param {Partial<TransportManagerOptions>} options - Manager options
 * @returns {TransportManager} Configured transport manager
 */
export function createDefaultTransportManager(
  options: Partial<TransportManagerOptions> = {}
): TransportManager {
  const manager = new TransportManager({
    useExternalRegistry: true,
    ...options,
  });

  return manager;
}
