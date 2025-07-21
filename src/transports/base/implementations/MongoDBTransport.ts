// File: src/transports/base/implementations/MongoDBTransport.ts

import { NetworkTransport } from '../NetworkTransport';
import type { 
  MongoDBTransportOptions, 
  LogEntry,
  NetworkTransportOptions 
} from '../../../types/transport';

// MongoDB types for better type safety
interface MongoClient {
  connect(): Promise<void>;
  db(name: string): MongoDatabase;
  close(): Promise<void>;
}

interface MongoDatabase {
  collection(name: string): MongoCollection;
  admin(): { ping(): Promise<void> };
}

interface MongoCollection {
  createIndexes(indexes: IndexSpec[]): Promise<void>;
  insertMany(docs: Record<string, unknown>[], options?: InsertManyOptions): Promise<InsertManyResult>;
  find(query: Record<string, unknown>): MongoCursor;
  deleteMany(query: Record<string, unknown>): Promise<{ deletedCount: number }>;
  aggregate(pipeline: Record<string, unknown>[]): MongoCursor;
  watch(pipeline?: Record<string, unknown>[], options?: ChangeStreamOptions): unknown;
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

interface InsertManyOptions {
  ordered?: boolean;
  writeConcern?: { w: number; j: boolean };
}

interface InsertManyResult {
  insertedCount: number;
}

interface ChangeStreamOptions {
  fullDocument?: 'default' | 'updateLookup';
}

interface MongoError extends Error {
  code?: number;
  writeErrors?: Array<{ index: number }>;
}

/**
 * MongoDB transport for storing logs in MongoDB collections.
 * 
 * Features:
 * - Automatic connection management
 * - Index creation for performance
 * - TTL support for automatic log cleanup
 * - Bulk insert operations
 * - Document transformation
 * - Capped collection support
 * - Change stream support for real-time monitoring
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
 *   collection: 'entries',
 *   createIndexes: true,
 *   ttl: 30 * 24 * 60 * 60, // 30 days
 *   transformDocument: (entry) => ({
 *     ...entry,
 *     _timestamp: new Date(entry.timestamp)
 *   })
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
   * Whether to create indexes.
   * @private
   */
  private readonly createIndexes: boolean;

  /**
   * TTL in seconds for automatic cleanup.
   * @private
   */
  private readonly ttl?: number;

  /**
   * Document transformer function.
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
   * Whether indexes have been created.
   * @private
   */
  private indexesCreated = false;

  /**
   * Pending operations during connection.
   * @private
   */
  private pendingOperations: Array<() => Promise<void>> = [];

  /**
   * Creates a new MongoDBTransport instance.
   * 
   * @param {MongoDBTransportOptions} options - Transport configuration
   */
  constructor(options: MongoDBTransportOptions) {
    const networkOptions: NetworkTransportOptions = {
      ...options,
      // MongoDB specific defaults
      maxBatchSize: options.maxBatchSize || 1000,
      maxBatchTime: options.maxBatchTime || 5000,
      maxBatchBytes: options.maxBatchBytes || 16 * 1024 * 1024, // 16MB (MongoDB limit)
    };

    super(networkOptions);

    this.uri = options.uri;
    this.url = options.uri; // Set parent's url property
    this.database = options.database || 'logs';
    this.collection = options.collection || 'entries';
    this.clientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      ...options.clientOptions,
    };
    this.createIndexes = options.createIndexes !== false;
    this.ttl = options.ttl;
    this.transformDocument = options.transformDocument;
  }

  /**
   * Initialize MongoDB connection.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    await this.connect();
  }

  /**
   * Connect to MongoDB.
   * 
   * @returns {Promise<void>} Resolves when connected
   * @protected
   */
  protected async connect(): Promise<void> {
    if (this.connectionState === 'connected') return;
    if (this.connectionState === 'connecting') {
      // Wait for existing connection
      return new Promise((resolve) => {
        this.pendingOperations.push(async () => resolve());
      });
    }

    this.connectionState = 'connecting';

    try {
      // Dynamic import MongoDB driver
      const { MongoClient } = await import('mongodb');
      
      // Create client and connect
      this.client = new MongoClient(this.uri, this.clientOptions);
      await this.client.connect();

      // Get database and collection
      this.db = this.client.db(this.database);
      this.logCollection = this.db.collection(this.collection);

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
    }
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
   * @param {unknown} data - Data to send
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
    if (!this.client || !this.db) {
      throw new Error('MongoDB client not connected');
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
        name: 'level_timestamp' 
      },
      
      // Text index for searching messages
      { 
        key: { message: 'text', 'error.message': 'text' }, 
        name: 'message_text' 
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
        console.warn(`[MongoDBTransport] Only inserted ${result.insertedCount} of ${documents.length} documents`);
      }

    } catch (error: any) {
      const mongoError = error as MongoError;
      // Handle bulk write errors
      if (mongoError.code === 11000) {
        // Duplicate key error - filter and retry
        const uniqueDocs = this.filterDuplicates(documents, mongoError);
        if (uniqueDocs.length > 0) {
          await this.logCollection!.insertMany(uniqueDocs, { ordered: false });
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Filter out documents that caused duplicate key errors.
   * 
   * @param {any[]} documents - Original documents
   * @param {any} error - MongoDB error
   * @returns {any[]} Filtered documents
   * @private
   */
  private filterDuplicates(documents: Record<string, unknown>[], error: MongoError): Record<string, unknown>[] {
    if (!error.writeErrors) return documents;

    const failedIndexes = new Set(error.writeErrors.map((e) => e.index));
    return documents.filter((_, index) => !failedIndexes.has(index));
  }

  /**
   * Query logs from MongoDB.
   * 
   * @param {object} query - MongoDB query
   * @param {object} options - Query options
   * @returns {Promise<LogEntry[]>} Log entries
   */
  public async query(
    query: Record<string, unknown> = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      projection?: Record<string, 0 | 1>;
    } = {}
  ): Promise<LogEntry[]> {
    if (this.connectionState !== 'connected') {
      await this.connect();
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

    return cursor.toArray();
  }

  /**
   * Get aggregated statistics.
   * 
   * @param {object} options - Aggregation options
   * @returns {Promise<any>} Aggregation results
   */
  public async getStatistics(options: {
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'hour' | 'day' | 'level' | 'loggerId';
  } = {}): Promise<Record<string, unknown>[]> {
    if (this.connectionState !== 'connected') {
      await this.connect();
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

    return this.logCollection!.aggregate(pipeline).toArray();
  }

  /**
   * Create a change stream for real-time monitoring.
   * 
   * @param {object} options - Change stream options
   * @returns {any} MongoDB change stream
   */
  public async createChangeStream(options: {
    filter?: Record<string, unknown>;
    fullDocument?: 'default' | 'updateLookup';
  } = {}): Promise<unknown> {
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    const pipeline = options.filter ? [{ $match: options.filter }] : [];
    
    return this.logCollection!.watch(pipeline, {
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
    if (error.message.includes('topology was destroyed') ||
        error.message.includes('server selection timed out')) {
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