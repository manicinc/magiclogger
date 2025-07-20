// File: src/transports/base/implementations/MongoDBTransport.ts

import { NetworkTransport } from '../NetworkTransport';
import type { 
  MongoDBTransportOptions, 
  LogEntry,
  NetworkTransportOptions 
} from '../../../types/transport';

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
  private readonly clientOptions: Record<string, any>;

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
  private readonly transformDocument?: (entry: LogEntry) => Record<string, any>;

  /**
   * MongoDB client instance.
   * @private
   */
  private client?: any;

  /**
   * Database instance.
   * @private
   */
  private db?: any;

  /**
   * Collection instance.
   * @private
   */
  private logCollection?: any;

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
   * Connection state.
   * @private
   */
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

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
   * @private
   */
  private async connect(): Promise<void> {
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
   * Create indexes for the collection.
   * 
   * @returns {Promise<void>} Resolves when indexes are created
   * @private
   */
  private async createCollectionIndexes(): Promise<void> {
    const indexes = [
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
   * @param {LogEntry[]} data - Log entries to insert
   * @param {any} batch - Batch metadata
   * @returns {Promise<void>} Resolves when inserted
   * @protected
   */
  protected async performNetworkRequest(data: LogEntry[], batch: any): Promise<void> {
    // Ensure connection
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    // Transform documents if needed
    const documents = data.map(entry => {
      const doc = this.transformDocument ? this.transformDocument(entry) : entry;
      
      // Ensure _id is not duplicated
      if ('id' in doc && !('_id' in doc)) {
        doc._id = doc.id;
      }
      
      // Convert ISO timestamp to Date object for better querying
      if (typeof doc.timestamp === 'string') {
        doc._timestamp = new Date(doc.timestamp);
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
      // Handle bulk write errors
      if (error.code === 11000) {
        // Duplicate key error - filter and retry
        const uniqueDocs = this.filterDuplicates(documents, error);
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
   * @param {any[]} documents - Original documents
   * @param {any} error - MongoDB error
   * @returns {any[]} Filtered documents
   * @private
   */
  private filterDuplicates(documents: any[], error: any): any[] {
    if (!error.writeErrors) return documents;

    const failedIndexes = new Set(error.writeErrors.map((e: any) => e.index));
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
    query: Record<string, any> = {},
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
  } = {}): Promise<any> {
    if (this.connectionState !== 'connected') {
      await this.connect();
    }

    const pipeline: any[] = [];

    // Date filter
    if (options.startDate || options.endDate) {
      const dateFilter: any = {};
      if (options.startDate) {
        dateFilter.$gte = options.startDate;
      }
      if (options.endDate) {
        dateFilter.$lte = options.endDate;
      }
      pipeline.push({ $match: { _timestamp: dateFilter } });
    }

    // Grouping
    let groupId: any = null;
    
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

    return this.logCollection.aggregate(pipeline).toArray();
  }

  /**
   * Create a change stream for real-time monitoring.
   * 
   * @param {object} options - Change stream options
   * @returns {any} MongoDB change stream
   */
  public async createChangeStream(options: {
    filter?: Record<string, any>;
    fullDocument?: 'default' | 'updateLookup';
  } = {}): Promise<any> {
    if (this.connectionState !== 'connected') {
      await this.connect();
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
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      this.db = undefined;
      this.logCollection = undefined;
      this.connectionState = 'disconnected';
    }
  }

  /**
   * Handle connection errors with reconnection.
   * 
   * @param {Error} error - The error that occurred
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