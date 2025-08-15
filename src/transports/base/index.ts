// File: src/transports/base/index.ts

/**
 * Base transport module exports
 *
 * This module exports only the base classes and types needed for transport
 * development and type checking. Individual transport implementations should
 * be imported from their specific entry points.
 *
 * @module transports/base
 */

// Base classes
export { Transport } from './Transport';
export { BatchingTransport } from './BatchingTransport';
export { NetworkTransport } from './NetworkTransport';
export { TransportManager } from './TransportManager';

// Transport registry (tree-shakable)
export { TransportRegistry } from '../index';

// Type guards
export { isAsyncTransport, isBatchingTransport, hasStats } from './Transport';

// Re-export essential types
export type {
  Transport as ITransport,
  TransportOptions,
  TransportEvents,
  TransportStats,
  LogEntry,
} from '../../types/transport';

/**
 * Initialize the global transport registry
 * This enables TransportManager to use the registry
 */
import { __installTransportRegistry } from '../index';
// Install using shared helper to unify code path & enable branch coverage
__installTransportRegistry(
  typeof globalThis !== 'undefined'
    ? (globalThis as unknown as Record<string, unknown>)
    : undefined,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : undefined
);
