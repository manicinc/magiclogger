// File: src/transports/postgresql.ts

/**
 * PostgreSQL transport entry point.
 * Tree-shakeable module that's only included when explicitly imported.
 *
 * @module transports/postgresql
 */

export { PostgreSQLTransport } from './base/implementations/PostgreSQLTransport';
export type { PostgreSQLTransportOptions } from '../types/transport';
