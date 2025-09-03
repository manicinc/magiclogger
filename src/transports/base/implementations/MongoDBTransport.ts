// File: src/transports/base/implementations/MongoDBTransport.ts

import { NetworkTransport } from '../NetworkTransport';
import type {
  MongoDBTransportOptions,
  LogEntry,
  // TransportStats
} from '../../../types/transport';

// MongoDB type definitions (since mongodb package is optional)
interface MongoClient {
  connect(): Promise<void>;
  close(): Promise<void>;
  db(name: string): MongoDatabase;
}

interface MongoDatabase {
  collection(name: string): MongoCollection;
  admin(): { ping(): Promise<void> };
}

interface MongoCollection {
  insertMany(
    docs: Record<string, unknown>[],
    options?: {
      ordered?: boolean;
      writeConcern?: { w: number; j: boolean };
    }
  ): Promise<{ insertedCount: number }>;
  createIndexes(indexes: IndexSpec[]): Promise<void>;
  find(query: Record<string, unknown>): MongoCursor;
  deleteMany(query: Record<string, unknown>): Promise<{ deletedCount: number }>;
  aggregate(pipeline: Record<string, unknown>[]): MongoCursor;
  watch(
    pipeline?: Record<string, unknown>[],
    options?: {
      fullDocument?: string;
    }
  ): unknown;
}

interface MongoCursor {
  sort(sort: Record<string, 1 | -1>): MongoCursor;
  skip(skip: number): MongoCursor;
  limit(limit: number): MongoCursor;
  project(projection: Record<string, 0 | 1>): MongoCursor;
  toArray(): Promise<LogEntry[]>;
}

interface IndexSpec {
  key: Record<string, unknown>;
  name: string;
  expireAfterSeconds?: number;
}

interface MongoError extends Error {
  code?: number;
  writeErrors?: Array<{ index: number }>;
}

interface WriteError {
  index: number;
}

/**
 * MongoDB transport for storing logs in MongoDB collections.
 *
 * Features:
 * - Automatic connection management with reconnection
 * - Bulk insert operations for performance
 * - Configurable indexes for efficient querying
 * - TTL (Time To Live) support for automatic cleanup
 * - Aggregation support for analytics
 * - Change streams for real-time monitoring
 * - Duplicate handling and error recovery
 *
 * @class MongoDBTransport
 * @extends {NetworkTransport}
 *
 * @example
 * ```typescript
 * const mongoTransport = new MongoDBTransport({
 *   name: 'mongodb',
 *   uri: 'mongodb://localhost:27017',
 *   database: 'logs',
 *   collection: 'application_logs',
 *   ttl: 30 * 24 * 60 * 60, // 30 days
 *   createIndexes: true
 * });
 * ```
 */
export class MongoDBTransport extends NetworkTransport {
  /**
   * MongoDB connection URI.
   * @private
   */
  private readonly uri: string;

  /**
   * Database name.
   * @private
   */
  private readonly database: string;

  /**
   * Collection name.
   * @private
   */
  private readonly collection: string;

  /**
   * MongoDB client options.
   * @private
   */
  private readonly clientOptions: Record<string, unknown>;

  /**
   * TTL in seconds for automatic document expiration.
   * @private
   */
  private readonly ttl?: number;

  /**
   * Whether to create indexes automatically.
   * @private
   */
  private readonly createIndexes: boolean;

  /**
   * Custom document transformation function.
   * @private
   */
  private readonly transformDocument?: (entry: LogEntry) => Record<string, unknown>;

  /**
   * MongoDB client instance.
   * @private
   */
  private client?: MongoClient;

  /**
   * Database instance.
   * @private
   */
  private db?: MongoDatabase;

  /**
   * Collection instance.
   * @private
   */
  private logCollection?: MongoCollection;

  /**
   * Connection state tracking.
   * @protected
   */
  protected connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  /**
   * Whether indexes have been created.
   * @private
   */
  private indexesCreated = false;

  /**
   * Queue for operations during connection.
   * @private
   */
  private pendingOperations: Array<() => Promise<void>> = [];

  /**
   * Internal flag to guard against parallel connect() calls.
   * @private
   */
  private isConnecting = false;

  /**
   * Creates a new MongoDBTransport instance.
   *
   * @param {MongoDBTransportOptions} options - Transport configuration
   */
  constructor(options: MongoDBTransportOptions) {
    super(options);

    this.uri = options.uri;
    this.database = options.database || 'logs'; // Provide default value
    this.collection = options.collection || 'logs';
    this.clientOptions = options.clientOptions || {};
    this.ttl = options.ttl;
    this.createIndexes = options.createIndexes ?? true;
    this.transformDocument = options.transformDocument;
  }

  /**
   * Connect to MongoDB.
   *
   * @returns {Promise<void>} Resolves when connected
   * @protected
   */
  protected async connect(): Promise<void> {
    if (this.connectionState === 'connected') {
      return;
    }

    // If a connect attempt is already in progress, wait for it to finish
    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        this.pendingOperations.push(async () => {
          if (this.connectionState === 'connected') {
            resolve();
          } else {
            reject(new Error('Connection failed'));
          }
        });
      });
    }

    this.connectionState = 'connecting';
    this.isConnecting = true;

    try {
      // Dynamic import of mongodb with require fallback for Jest
      let MongoClientCtor: unknown;
      // Try require first - this works better with Jest mocks
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('mongodb') as { MongoClient: new (...args: unknown[]) => MongoClient };
        MongoClientCtor = mod.MongoClient;
        if (process.env.NODE_ENV === 'test') {
          // Debug: confirm which MongoClient is used
          // eslint-disable-next-line no-console
          // Narrow type for debug logging without using `any`.
          const ctor = MongoClientCtor as { name?: string; _isMockFunction?: boolean } | undefined;
          console.log(
            '[MongoDBTransport] Using mocked MongoClient:',
            typeof ctor,
            ctor?.name,
            'isMockFn:',
            !!ctor?._isMockFunction
          );
        }
      } catch {
        // Fall back to dynamic import if require fails (ESM environments)
        try {
          const mod = await import('mongodb');
          MongoClientCtor = (
            mod as unknown as { MongoClient: new (...args: unknown[]) => MongoClient }
          ).MongoClient;
          if (process.env.NODE_ENV === 'test') {
            // Debug: confirm which MongoClient is used
            // eslint-disable-next-line no-console
            const ctor = MongoClientCtor as
              | { name?: string; _isMockFunction?: boolean }
              | undefined;
            console.log(
              '[MongoDBTransport] Using imported MongoClient:',
              typeof ctor,
              ctor?.name,
              'isMockFn:',
              !!ctor?._isMockFunction
            );
          }
        } catch (importError) {
          throw new Error(
            `MongoDB package not found. Please install it: npm install mongodb. Error: ${importError}`
          );
        }
      }

      // Create client and connect
      this.client = new (MongoClientCtor as new (...args: unknown[]) => MongoClient)(
        this.uri,
        this.clientOptions
      );
      if (process.env.NODE_ENV === 'test') {
        // Debug: confirm mockClient shape
        // eslint-disable-next-line no-console
        const dbFn = this.client.db as unknown as
          | { _isMockFunction?: boolean }
          | ((...args: unknown[]) => unknown);
        console.log(
          '[MongoDBTransport] client.db:',
          typeof dbFn,
          'isMockFn:',
          !!(dbFn as { _isMockFunction?: boolean })?._isMockFunction
        );
      }
      // Ensure client was created successfully
      if (!this.client) {
        throw new Error('Failed to create MongoDB client');
      }
      await this.client.connect();
      // Initialize database and collection
      await this.initializeDatabaseConnection();
      // Create indexes if needed
      if (this.createIndexes && !this.indexesCreated) {
        await this.createCollectionIndexes();
        this.indexesCreated = true;
      }
      this.connectionState = 'connected';
      // Process pending operations
      const pending = this.pendingOperations;
      this.pendingOperations = [];
      await Promise.all(pending.map(op => op()));
      this.emit('connected', {
        database: this.database,
        collection: this.collection,
      });
    } catch (error) {
      this.connectionState = 'disconnected';
      throw new Error(`MongoDB connection failed: ${error}`);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Get database and collection
   *
   * @returns {Promise<void>} Resolves when database and collection are set
   * @private
   */
  private async initializeDatabaseConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('MongoDB client not connected');
    }

    this.db = this.client.db(this.database);
    this.logCollection = this.db.collection(this.collection);
  }

  /**
   * Disconnect from MongoDB.
   *
   * @returns {Promise<void>} Resolves when disconnected
   * @protected
   */
  protected async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      this.db = undefined;
      this.logCollection = undefined;
      this.connectionState = 'disconnected';
    }
  }

  /**
   * Send data to MongoDB (not used, see performNetworkRequest).
   *
   * @param {unknown} _data - Data to send (unused)
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendData(_data: unknown): Promise<void> {
    // Not used - see performNetworkRequest
    throw new Error('Use performNetworkRequest instead');
  }

  /**
   * Check MongoDB connection health.
   *
   * @returns {Promise<void>} Resolves if healthy
   * @protected
   */
  protected async checkHealth(): Promise<void> {
    if (!this.client) {
      throw new Error('MongoDB client not connected');
    }

    if (!this.db) {
      throw new Error('MongoDB database not initialized');
    }

    // Ping the database
    await this.db.admin().ping();
  }

  /**
   * Create indexes for the collection.
   *
   * @returns {Promise<void>} Resolves when indexes are created
   * @private
   */
  private async createCollectionIndexes(): Promise<void> {
    if (!this.logCollection) {
      throw new Error('Collection not initialized');
    }

    const indexes: IndexSpec[] = [
      // Timestamp index for time-based queries
      { key: { timestamp: -1 }, name: 'timestamp_desc' },

      // Level index for filtering by severity
      { key: { level: 1 }, name: 'level' },

      // Logger ID index for multi-service setups
      { key: { loggerId: 1 }, name: 'logger_id' },

      // Tags index for categorization
      { key: { tags: 1 }, name: 'tags' },

      // Compound index for common queries
      {
        key: { level: 1, timestamp: -1 },
        name: 'level_timestamp',
      },

      // Text index for searching messages
      {
        key: { message: 'text', 'error.message': 'text' },
        name: 'message_text',
      },
    ];

    // Add TTL index if configured
    if (this.ttl) {
      indexes.push({
        key: { timestamp: 1 },
        name: 'ttl',
        expireAfterSeconds: this.ttl,
      });
    }

    try {
      await this.logCollection.createIndexes(indexes);
    } catch (error) {
      console.warn('[MongoDBTransport] Failed to create some indexes:', error);
    }
  }

  /**
   * Perform the network request to insert logs.
   *
   * @param {LogEntry[]} entries - Log entries to insert
   * @returns {Promise<void>} Resolves when inserted
   * @protected
   */
  protected async performNetworkRequest(entries: LogEntry[]): Promise<void> {
    // Ensure connection
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    if (!this.logCollection) {
      throw new Error('Collection not initialized');
    }

    // Transform documents if needed
    const documents = entries.map(entry => {
      const doc = this.transformDocument ? this.transformDocument(entry) : { ...entry };

      // Ensure _id is not duplicated
      if ('id' in doc && !('_id' in doc)) {
        (doc as Record<string, unknown>)._id = doc.id;
      }

      // Convert ISO timestamp to Date object for better querying
      if (typeof doc.timestamp === 'string') {
        (doc as Record<string, unknown>)._timestamp = new Date(doc.timestamp);
      }

      return doc;
    });

    // Insert with retry logic
    try {
      const result = await this.logCollection.insertMany(documents, {
        ordered: false, // Continue on error
        writeConcern: { w: 1, j: false }, // Balance durability and performance
      });

      this.emit('inserted', {
        database: this.database,
        collection: this.collection,
        inserted: result.insertedCount,
        total: documents.length,
      });

      if (result.insertedCount < documents.length) {
        console.warn(
          `[MongoDBTransport] Only inserted ${result.insertedCount} of ${documents.length} documents`
        );
      }
    } catch (error: unknown) {
      const mongoError = error as MongoError;
      // Handle bulk write errors
      if (mongoError.code === 11000) {
        // Duplicate key error - filter and retry
        const uniqueDocs = this.filterDuplicates(documents, mongoError);
        if (uniqueDocs.length > 0) {
          await this.logCollection.insertMany(uniqueDocs, { ordered: false });
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Filter out documents that caused duplicate key errors.
   *
   * @param {Record<string, unknown>[]} documents - Original documents
   * @param {MongoError} error - MongoDB error
   * @returns {Record<string, unknown>[]} Filtered documents
   * @private
   */
  private filterDuplicates(
    documents: Record<string, unknown>[],
    error: MongoError
  ): Record<string, unknown>[] {
    if (!error.writeErrors) return documents;

    const failedIndexes = new Set(error.writeErrors.map((e: WriteError) => e.index));
    return documents.filter((_, index) => !failedIndexes.has(index));
  }

  /**
   * Query logs from MongoDB.
   *
   * @param {Record<string, unknown>} query - MongoDB query
   * @param {object} options - Query options
   * @returns {Promise<Record<string, unknown>[]>} Query results as generic records
   */
  public async query(
    query: Record<string, unknown> = {},
    options: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
      projection?: Record<string, 0 | 1>;
    } = {}
  ): Promise<Record<string, unknown>[]> {
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    if (!this.logCollection) {
      throw new Error('Collection not initialized');
    }

    const cursor = this.logCollection.find(query);

    if (options.sort) {
      cursor.sort(options.sort);
    }

    if (options.skip) {
      cursor.skip(options.skip);
    }

    if (options.limit) {
      cursor.limit(options.limit);
    }

    if (options.projection) {
      cursor.project(options.projection);
    }

    const results = await cursor.toArray();
    return results as unknown as Record<string, unknown>[];
  }

  /**
   * Get aggregated statistics.
   *
   * @param {object} options - Aggregation options
   * @returns {Promise<Record<string, unknown>[]>} Aggregation results
   */
  public async getStatistics(
    options: {
      startDate?: Date;
      endDate?: Date;
      groupBy?: 'hour' | 'day' | 'level' | 'loggerId';
    } = {}
  ): Promise<Record<string, unknown>[]> {
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    if (!this.logCollection) {
      throw new Error('Collection not initialized');
    }

    const pipeline: Record<string, unknown>[] = [];

    // Date filter
    if (options.startDate || options.endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (options.startDate) {
        dateFilter.$gte = options.startDate;
      }
      if (options.endDate) {
        dateFilter.$lte = options.endDate;
      }
      pipeline.push({ $match: { _timestamp: dateFilter } });
    }

    // Grouping
    let groupId: Record<string, unknown> | string | null = null;

    switch (options.groupBy) {
      case 'hour':
        groupId = {
          year: { $year: '$_timestamp' },
          month: { $month: '$_timestamp' },
          day: { $dayOfMonth: '$_timestamp' },
          hour: { $hour: '$_timestamp' },
        };
        break;

      case 'day':
        groupId = {
          year: { $year: '$_timestamp' },
          month: { $month: '$_timestamp' },
          day: { $dayOfMonth: '$_timestamp' },
        };
        break;

      case 'level':
        groupId = '$level';
        break;

      case 'loggerId':
        groupId = '$loggerId';
        break;

      default:
        groupId = null;
    }

    pipeline.push({
      $group: {
        _id: groupId,
        count: { $sum: 1 },
        levels: {
          $push: '$level',
        },
        errors: {
          $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] },
        },
      },
    });

    pipeline.push({
      $sort: { _id: 1 },
    });

    const results = await this.logCollection.aggregate(pipeline).toArray();
    return results as unknown as Record<string, unknown>[];
  }

  /**
   * Create a change stream for real-time monitoring.
   *
   * @param {object} options - Change stream options
   * @returns {Promise<unknown>} MongoDB change stream
   */
  public async createChangeStream(
    options: {
      filter?: Record<string, unknown>;
      fullDocument?: 'default' | 'updateLookup';
    } = {}
  ): Promise<unknown> {
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    if (!this.logCollection) {
      throw new Error('Collection not initialized');
    }

    const pipeline = options.filter ? [{ $match: options.filter }] : [];

    return this.logCollection.watch(pipeline, {
      fullDocument: options.fullDocument || 'default',
    });
  }

  /**
   * Clean up old logs manually.
   *
   * @param {Date} before - Delete logs before this date
   * @returns {Promise<number>} Number of deleted documents
   */
  public async cleanup(before: Date): Promise<number> {
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    if (!this.logCollection) {
      throw new Error('Collection not initialized');
    }

    const result = await this.logCollection.deleteMany({
      _timestamp: { $lt: before },
    });

    return result.deletedCount;
  }

  /**
   * Close MongoDB connection.
   *
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async closeNetwork(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Handle connection errors with reconnection.
   *
   * @param {Error} error - The error that occurred
   * @param {LogEntry} [entry] - The log entry that caused the error
   * @protected
   */
  protected handleError(error: Error, entry?: LogEntry): void {
    super.handleError(error, entry);

    // Check for connection errors
    if (
      error.message.includes('topology was destroyed') ||
      error.message.includes('server selection timed out')
    ) {
      this.connectionState = 'disconnected';

      // Attempt reconnection
      setTimeout(() => {
        this.connect().catch(err => {
          console.error('[MongoDBTransport] Reconnection failed:', err);
        });
      }, 5000);
    }
  }
}
