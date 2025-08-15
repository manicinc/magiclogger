/**
 * Base Transport Entry Point
 *
 * This module provides base transport functionality for MagicLogger.
 * Import this module directly for optimal tree-shaking.
 *
 * @module transports/base
 */

export { Transport } from './base/Transport';
export { TransportManager } from './base/TransportManager';
export type { TransportOptions, TransportEvents } from '../types/transport';
