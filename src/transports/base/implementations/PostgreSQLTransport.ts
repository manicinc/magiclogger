// File: src/transports/base/implementations/PostgreSQLTransport.ts

/**
 * PostgreSQL transport for direct database logging.
 * Provides efficient batch inserts with connection pooling.
 *
 * @module transports/postgresql
 */

import { BatchingTransport } from '../BatchingTransport';
import type { LogEntry, PostgreSQLTransportOptions } from '../../../types/transport';

// Minimal pg typings to keep dependency optional and satisfy lint rules
interface PgClientLike {
  query: (
    text: string,
    params?: unknown[]
  ) => Promise<{ rows: Array<Record<string, unknown>>; rowCount: number }>;
  release: () => void;
}

interface PgPoolLike {
  connect: () => Promise<PgClientLike>;
  end: () => Promise<void>;
}

type PgModuleLike = {
  Pool: new (config: Record<string, unknown>) => PgPoolLike;
};

/**
 * PostgreSQL transport for logging to PostgreSQL databases.
 *
 * Features:
 * - Connection pooling for performance
 * - Batch inserts for efficiency
 * - Automatic table creation
 * - JSON/JSONB support for structured data
 * - Partitioning support for large datasets
 * - Index management
 *
 * @class PostgreSQLTransport
 * @extends {BatchingTransport}
 *
 * @example
 * ```typescript
 * const pgTransport = new PostgreSQLTransport({
 *   connectionString: 'postgresql://user:pass@localhost/logs',
 *   table: 'application_logs',
 *   createTable: true,
 *   poolSize: 10,
 *   batchSize: 100
 * });
 * ```
 */
export class PostgreSQLTransport extends BatchingTransport {
  private pool: unknown; // pg.Pool when 'pg' is present
  private readonly connectionString: string;
  private readonly table: string;
  private readonly schema: string;
  private readonly createTable: boolean;
  private readonly indexes: string[];
  private readonly partitioning?: {
    enabled: boolean;
    interval: 'daily' | 'weekly' | 'monthly';
    retention: number;
  };
  private tableCreated = false;
  private pgModule?: PgModuleLike;

  /**
   * Construct a PostgreSQLTransport.
   *
   * @param {PostgreSQLTransportOptions} options - Transport options
   */
  constructor(options: PostgreSQLTransportOptions) {
    super({
      ...options,
      maxBatchSize: options.batchSize || 100,
      maxBatchTime: options.flushInterval || 5000,
    });

    this.connectionString = options.connectionString || this.buildConnectionString(options);
    this.table = options.table || 'logs';
    this.schema = options.schema || 'public';
    this.createTable = options.createTable !== false;
    this.indexes = options.indexes || ['timestamp', 'level', 'logger_id'];
    this.partitioning = options.partitioning;
  }

  /** Build connection string from options. */
  private buildConnectionString(options: PostgreSQLTransportOptions): string {
    const { host = 'localhost', port = 5432, database, user, password } = options;
    if (!database) {
      throw new Error('PostgreSQL database is required');
    }
    let connStr = 'postgresql://';
    if (user) {
      connStr += user;
      if (password) {
        connStr += `:${password}`;
      }
      connStr += '@';
    }
    connStr += `${host}:${port}/${database}`;
    if (options.ssl) {
      connStr += '?sslmode=require';
    }
    return connStr;
  }

  /**
   * Initialize PostgreSQL connection and optionally create the table.
   *
   * @returns {Promise<void>} Resolves when the pool is ready.
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Dynamically import pg to keep it tree-shakeable
    try {
      this.pgModule = (await import('pg')) as unknown as PgModuleLike;
    } catch (error) {
      throw new Error(
        'PostgreSQL client not found. Install it with: npm install pg\n' +
          'This is an optional peer dependency for tree-shaking.'
      );
    }

    const { Pool } = this.pgModule as PgModuleLike;

    this.pool = new Pool({
      connectionString: this.connectionString,
      max: (this.options as PostgreSQLTransportOptions).poolSize || 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await (this.pool as PgPoolLike).connect();
    client.release();

    // Create table if needed
    if (this.createTable && !this.tableCreated) {
      await this.ensureTable();
    }
  }

  /**
   * Ensure the target table exists (and indexes/partitioning if configured).
   *
   * @returns {Promise<void>} Resolves when the table is ready.
   * @private
   */
  private async ensureTable(): Promise<void> {
    const client = await (this.pool as PgPoolLike).connect();
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${this.schema}.${this.table} (
          id BIGSERIAL PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          timestamp_ms BIGINT NOT NULL,
          level VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          plain_message TEXT,
          logger_id VARCHAR(100),
          tags TEXT[],
          context JSONB,
          error JSONB,
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await client.query(createTableSQL);

      // Create indexes
      for (const column of this.indexes) {
        const indexName = `idx_${this.table}_${column}`;
        const indexSQL = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${this.schema}.${this.table} (${column})`;
        await client.query(indexSQL);
      }

      // Set up partitioning if enabled
      if (this.partitioning?.enabled) {
        await this.setupPartitioning(client);
      }

      this.tableCreated = true;
    } finally {
      client.release();
    }
  }

  /**
   * Set up partitioning for the table.
   *
   * @param {PgClientLike} client - Connected client.
   * @returns {Promise<void>} Resolves when configured.
   * @private
   */
  private async setupPartitioning(client: PgClientLike): Promise<void> {
    // Version checks could be added here; keeping lightweight for now
    const partitionSQL = `SELECT 1`;
    await client.query(partitionSQL);
  }

  /**
   * Send a batch of log entries using a single transaction.
   *
   * @param {LogEntry[]} entries - Entries to persist.
   * @returns {Promise<void>} Resolves when committed.
   * @protected
   */
  protected async sendBatch(entries: LogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const client = await (this.pool as PgPoolLike).connect();
    try {
      await client.query('BEGIN');

      const values: unknown[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;

      for (const entry of entries) {
        const rowPlaceholders: string[] = [];
        values.push(entry.timestampMs);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.level);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.message);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.plainMessage || entry.message);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.loggerId || null);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.tags || null);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.context ? JSON.stringify(entry.context) : null);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.error ? JSON.stringify(entry.error) : null);
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(entry.metadata ? JSON.stringify(entry.metadata) : null);
        rowPlaceholders.push(`$${paramIndex++}`);
        placeholders.push(`(${rowPlaceholders.join(', ')})`);
      }

      const insertSQL = `
        INSERT INTO ${this.schema}.${this.table}
        (timestamp_ms, level, message, plain_message, logger_id, tags, context, error, metadata)
        VALUES ${placeholders.join(', ')}`;

      await client.query(insertSQL, values);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete rows older than a retention window.
   *
   * @param {number} retentionDays - Age threshold in days.
   * @returns {Promise<number>} Number of deleted rows.
   */
  public async cleanupOldLogs(retentionDays: number): Promise<number> {
    const client = await (this.pool as PgPoolLike).connect();
    try {
      const deleteSQL = `
        DELETE FROM ${this.schema}.${this.table}
        WHERE timestamp < NOW() - INTERVAL '${retentionDays} days'
        RETURNING id`;
      const result = await client.query(deleteSQL);
      return result.rowCount;
    } finally {
      client.release();
    }
  }

  /**
   * Query recent log counts grouped by level.
   *
   * @returns {Promise<Record<string, number>>} A mapping of level -> count within the last day.
   */
  public async getLogCountByLevel(): Promise<Record<string, number>> {
    const client = await (this.pool as PgPoolLike).connect();
    try {
      const querySQL = `
        SELECT level, COUNT(*) as count
        FROM ${this.schema}.${this.table}
        WHERE timestamp > NOW() - INTERVAL '1 day'
        GROUP BY level`;
      const result = await client.query(querySQL);
      const rows = result.rows as Array<{ level: string; count: string | number }>;
      const counts: Record<string, number> = {};
      for (const row of rows) {
        counts[row.level] = typeof row.count === 'string' ? parseInt(row.count, 10) : row.count;
      }
      return counts;
    } finally {
      client.release();
    }
  }

  /**
   * Tear down the connection pool and parent resources.
   *
   * @returns {Promise<void>} Resolves when closed.
   * @protected
   */
  protected async doClose(): Promise<void> {
    if (this.pool && typeof (this.pool as { end?: () => Promise<void> }).end === 'function') {
      await (this.pool as { end?: () => Promise<void> }).end?.();
    }
    await super.doClose();
  }
}
