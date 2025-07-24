/**
 * Base Transport Entry Point
 * 
 * This module provides base transport classes and utilities for MagicLogger.
 * Import this module directly for optimal tree-shaking.
 * 
 * @module transports/base
 */

export { Transport } from './base/Transport';
export { TransportManager } from './base/TransportManager';
export { BatchingTransport } from './base/BatchingTransport';
export { NetworkTransport } from './base/NetworkTransport';

export type { 
  TransportOptions,
  TransportConfig,
  TransportType,
  TransportStats,
  TransportEvents,
  BatchingOptions,
  RetryOptions,
  ConnectionState,
  NetworkTransportOptions,
  LogEntry
} from '../types/transport';
