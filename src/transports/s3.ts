/**
 * S3 Transport Entry Point
 * 
 * This module provides AWS S3 logging transport for MagicLogger.
 * Import this module directly for optimal tree-shaking.
 * 
 * @module transports/s3
 */

export { S3Transport } from './base/implementations/S3Transport';
export type { S3TransportOptions } from './base/implementations/S3Transport';
