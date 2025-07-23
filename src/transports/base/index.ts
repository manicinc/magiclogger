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
import { TransportRegistry } from '../index';
if (typeof globalThis !== 'undefined') {
  (globalThis as { __MAGICLOGGER_TRANSPORT_REGISTRY__?: typeof TransportRegistry }).__MAGICLOGGER_TRANSPORT_REGISTRY__ = TransportRegistry;
}