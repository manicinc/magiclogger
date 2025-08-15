/**
 * MongoDB Transport Entry Point
 *
 * This module provides MongoDB transport functionality for MagicLogger.
 * Import this module directly for optimal tree-shaking.
 *
 * @module transports/mongodb
 */

export { MongoDBTransport } from './base/implementations/MongoDBTransport';
export type { MongoDBTransportOptions } from '../types/transport';
