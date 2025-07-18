// File: src/transports/implementations/MongoDBTransport.ts

import { NetworkTransport } from '../NetworkTransport';
import type { MongoDBTransportOptions, LogEntry, TransportStats } from '../../../types/transport';

/**
 * Interface for MongoDB document structure.
 */
interface MongoLogDocument {
  _id?: any;
  timestamp: Date;
  timestampMs: number;
  level: string;
  message: string;
  plainMessage?: string;
  loggerId?: string;
  tags?: string[];
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
  transportMetadata?: {
    transport: string;
    batchId?: string;
    insertedAt: Date;
  };
}

/**
 * Transport that stores logs in MongoDB for scalable persistence.
 * 
 * The MongoDBTransport provides reliable log storage in MongoDB with:
 * - Automatic index creation for common queries
 * - TTL support for automatic log expiration
 * - Bulk insert optimization
 * - Connection pooling and retries
 * - Document transformation hooks
 * - Capped collection support
 * 
 * This transport is ideal for:
 * - Centralized log storage with complex queries
 * - Real-time log analysis with aggregation
 * - Long-term storage with automatic cleanup
 * - Integration with existing MongoDB infrastructure
 * 
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
 *   maxBatchSize: 100
 * });
 * 
 * await mongoTransport.log({
 *   level: 'info',
 *   message: 'User action logged',
 *   context: { userId: '12345', action: 'login' }
 * });
 * ```
 */
export class MongoDBTransport extends NetworkTransport {
  /**
   * MongoDB configuration.
   * @private
   */
  private readonly uri: string;
  private readonly database: string;
  private readonly collection: string;
  private readonly clientOptions?: Record<string, any>;
  private readonly createIndexes: boolean;
  private readonly ttl?: number;
  private readonly transformDocument?: (entry: LogEntry) => Record<string, any>;

  /**
   * MongoDB client and connection.
   * @private
   */
  private mongoClient?: any;
  private db?: any;
  private logCollection?: any;

  /**
   * Dynamic imports for MongoDB driver.
   * @private
   */
  private MongoClient?: any;
  private ObjectId?: any;

  /**
   * Flag to track if indexes have been created.
   * @private
   */
  private indexesCreated = false;

  /**
   * Connection state tracking.
   * @private
   */
  private connected = false;
  private connecting = false;
  private connectionPromise?: Promise<void>;

  /**
   * Creates a new MongoDBTransport instance.
   * 
   * @param {MongoDBTransportOptions} options - Transport configuration
   */
  constructor(options: MongoDBTransportOptions) {
    super(options);

    // Validate required options
    if (!options.uri) {
      throw new Error('MongoDBTransport requires uri option');
    }

    // Initialize MongoDB configuration
    this.uri = options.uri;
    this.database = options.database || 'logs';
    this.collection = options.collection || 'entries';
    this.clientOptions = options.clientOptions;
    this.createIndexes = options.createIndexes !== false;
    this.ttl = options.ttl;
    this.transformDocument = options.transformDocument;
  }

  /**
   * Initialize MongoDB client and connection.
   * 
   * @returns {Promise<void>} Resolves when connected
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    // Load MongoDB driver
    await this.loadMongoDBDriver();

    // Connect to MongoDB
    await this.connect();

    // Create indexes if configured
    if (this.createIndexes) {
      await this.createCollectionIndexes();
    }
  }

  /**
   * Individual log method (required by Transport interface).
   * MongoDBTransport uses batching for efficiency.
   * 
   * @param {LogEntry} _entry - Log entry (unused)
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async doLog(_entry: LogEntry): Promise<void> {
    // MongoDB transport uses batching for efficiency
    // Individual logs are queued and sent in batches
    throw new Error('MongoDBTransport uses batching. Use the batch system instead of calling doLog directly.');
  }

  /**
   * Load MongoDB driver dynamically.
   * 
   * @private
   */
  private async loadMongoDBDriver(): Promise<void> {
    try {
      // @ts-expect-error - mongodb is an optional dependency
      const mongodb = await import('mongodb');
      this.MongoClient = mongodb.MongoClient;
      this.ObjectId = mongodb.ObjectId;
    } catch (error) {
      throw new Error(
        'MongoDB driver is required for MongoDBTransport. Install with: npm install mongodb'
      );
    }
  }

  /**
   * Connect to MongoDB with retry logic.
   * 
   * @private
   */
  private async connect(): Promise<void> {
    // Prevent concurrent connection attempts
    if (this.connecting && this.connectionPromise) {
      await this.connectionPromise;
      return;
    }

    if (this.connected) {
      return;
    }

    this.connecting = true;

    this.connectionPromise = this.performConnection();
    
    try {
      await this.connectionPromise;
    } finally {
      this.connecting = false;
      this.connectionPromise = undefined;
    }
  }

  /**
   * Perform the actual MongoDB connection.
   * 
   * @private
   */
  private async performConnection(): Promise<void> {
    // Default connection options
    const defaultOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
    };

    // Merge with user options
    const options = {
      ...defaultOptions,
      ...this.clientOptions,
    };

    try {
      // Create client
      this.mongoClient = new this.MongoClient(this.uri, options);

      // Connect
      await this.mongoClient.connect();

      // Get database and collection references
      this.db = this.mongoClient.db(this.database);
      this.logCollection = this.db.collection(this.collection);

      this.connected = true;

      // Set up connection monitoring
      this.setupConnectionMonitoring();

      this.emit('connected', {
        transport: this.name,
        database: this.database,
        collection: this.collection,
      });
    } catch (error: any) {
      this.connected = false;
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  }

  /**
   * Set up MongoDB connection monitoring.
   * 
   * @private
   */
  private setupConnectionMonitoring(): void {
    if (!this.mongoClient) return;

    // Monitor topology events
    this.mongoClient.on('serverDescriptionChanged', (event: any) => {
      if (event.newDescription.type === 'Unknown') {
        this.connected = false;
        this.emit('disconnected', {
          transport: this.name,
          reason: 'Server became unknown',
        });
      }
    });

    this.mongoClient.on('topologyDescriptionChanged', (event: any) => {
      if (event.newDescription.type === 'ReplicaSetNoPrimary' ||
          event.newDescription.type === 'Unknown') {
        this.connected = false;
      }
    });

    this.mongoClient.on('error', (error: Error) => {
      this.handleError(error);
    });

    this.mongoClient.on('close', () => {
      this.connected = false;
      this.emit('disconnected', {
        transport: this.name,
        reason: 'Connection closed',
      });
    });
  }

  /**
   * Create indexes for efficient querying.
   * 
   * @private
   */
  private async createCollectionIndexes(): Promise<void> {
    if (this.indexesCreated || !this.logCollection) {
      return;
    }

    try {
      const indexes = [];

      // Timestamp index for time-based queries
      indexes.push({
        key: { timestamp: -1 },
        name: 'timestamp_desc',
      });

      // Level index for filtering by severity
      indexes.push({
        key: { level: 1 },
        name: 'level',
      });

      // Logger ID index for filtering by source
      indexes.push({
        key: { loggerId: 1 },
        name: 'logger_id',
        sparse: true,
      });

      // Compound index for common queries
      indexes.push({
        key: { level: 1, timestamp: -1 },
        name: 'level_timestamp',
      });

      // Tags index for tag-based filtering
      indexes.push({
        key: { tags: 1 },
        name: 'tags',
        sparse: true,
      });

      // TTL index if configured
      if (this.ttl && this.ttl > 0) {
        indexes.push({
          key: { timestamp: 1 },
          name: 'ttl',
          expireAfterSeconds: this.ttl,
        });
      }

      // Text index for message search
      indexes.push({
        key: { message: 'text' },
        name: 'message_text',
      });

      // Create all indexes
      await this.logCollection.createIndexes(indexes);

      this.indexesCreated = true;

      this.emit('indexesCreated', {
        transport: this.name,
        indexes: indexes.map(idx => idx.name),
      });
    } catch (error: any) {
      // Log warning but don't fail - indexes might already exist
      console.warn(`MongoDB index creation warning: ${error.message}`);
    }
  }

  /**
   * Send a batch of logs to MongoDB.
   * 
   * @param {any} data - Prepared batch data
   * @param {any} batch - Original batch object
   * @returns {Promise<void>} Resolves when inserted
   * @protected
   */
  protected async performNetworkRequest(data: any, batch: any): Promise<void> {
    // Ensure connection
    if (!this.connected) {
      await this.connect();
    }

    // Transform log entries to MongoDB documents
    const documents = this.transformEntriesToDocuments(batch.entries, batch.id);

    // Perform bulk insert
    const result = await this.logCollection.insertMany(documents, {
      ordered: false, // Continue on error
      writeConcern: {
        w: 1, // Acknowledge write
        j: false, // No journal sync required
      },
    });

    // Verify insertion
    if (result.insertedCount !== documents.length) {
      throw new Error(
        `Partial insert: ${result.insertedCount}/${documents.length} documents inserted`
      );
    }

    // Emit success event
    this.emit('mongoInsert', {
      transport: this.name,
      database: this.database,
      collection: this.collection,
      count: result.insertedCount,
      batchId: batch.id,
    });
  }

  /**
   * Transform log entries to MongoDB documents.
   * 
   * @param {LogEntry[]} entries - Log entries to transform
   * @param {string} batchId - Batch identifier
   * @returns {MongoLogDocument[]} MongoDB documents
   * @private
   */
  private transformEntriesToDocuments(entries: LogEntry[], batchId: string): MongoLogDocument[] {
    const insertedAt = new Date();

    const documents: MongoLogDocument[] = entries.map(entry => {
      // Apply custom transformation if provided
      if (this.transformDocument) {
        const customDoc = this.transformDocument(entry);
        
        // Ensure required fields are present
        const doc: MongoLogDocument = {
          timestamp: new Date(entry.timestamp),
          timestampMs: entry.timestampMs,
          level: entry.level,
          message: entry.message,
          ...customDoc,
          transportMetadata: {
            transport: this.name,
            batchId,
            insertedAt,
          },
        };
        return doc;
      }

      // Default document structure
      const doc: MongoLogDocument = {
        timestamp: new Date(entry.timestamp),
        timestampMs: entry.timestampMs,
        level: entry.level,
        message: entry.message,
        transportMetadata: {
          transport: this.name,
          batchId,
          insertedAt,
        },
      };

      // Add optional fields
      if (entry.plainMessage) {
        doc.plainMessage = entry.plainMessage;
      }

      if (entry.loggerId) {
        doc.loggerId = entry.loggerId;
      }

      if (entry.tags && entry.tags.length > 0) {
        doc.tags = entry.tags;
      }

      if (entry.context && Object.keys(entry.context).length > 0) {
        doc.context = this.sanitizeDocument(entry.context);
      }

      if (entry.error) {
        doc.error = this.sanitizeDocument(entry.error);
      }

      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        doc.metadata = this.sanitizeDocument(entry.metadata);
      }

      return doc;
    });

    return documents;
  }

  /**
   * Sanitize document to ensure MongoDB compatibility.
   * 
   * @param {any} obj - Object to sanitize
   * @returns {any} Sanitized object
   * @private
   */
  private sanitizeDocument(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeDocument(item));
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Remove keys starting with $ or containing .
      const sanitizedKey = key.replace(/^\$/, '_$').replace(/\./g, '_');
      
      // Recursively sanitize nested objects
      sanitized[sanitizedKey] = this.sanitizeDocument(value);
    }

    return sanitized;
  }

  /**
   * Override to handle MongoDB-specific errors.
   * 
   * @param {Error} error - The error to check
   * @returns {boolean} True if error is retryable
   * @protected
   */
  protected defaultRetryCondition(error: Error): boolean {
    // Check for MongoDB-specific retryable errors
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('topology was destroyed') ||
        message.includes('server selection timed out') ||
        message.includes('connection') ||
        message.includes('socket')) {
      return true;
    }

    // Replica set errors
    if (message.includes('not master') ||
        message.includes('node is recovering') ||
        message.includes('replicaset')) {
      return true;
    }

    // Write concern errors that might be transient
    if (message.includes('write concern') && message.includes('timeout')) {
      return true;
    }

    // Call parent implementation
    return super.defaultRetryCondition(error);
  }

  /**
   * Reconnect to MongoDB if disconnected.
   * 
   * @private
   */
  private async reconnect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await this.connect();
    } catch (error) {
      // Reconnection failed, will be retried on next operation
      this.connected = false;
      throw error;
    }
  }

  /**
   * Clean up MongoDB connection.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async closeNetwork(): Promise<void> {
    if (this.mongoClient) {
      try {
        await this.mongoClient.close(true);
      } catch (error) {
        // Log but don't throw - we're closing anyway
        console.error(`MongoDB close error: ${error}`);
      }

      this.mongoClient = undefined;
      this.db = undefined;
      this.logCollection = undefined;
      this.connected = false;
    }
  }

  /**
   * Get transport statistics with MongoDB-specific metrics.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();

    // Add MongoDB-specific stats
    stats.custom = {
      ...stats.custom,
      connected: this.connected,
      database: this.database,
      collection: this.collection,
      indexesCreated: this.indexesCreated,
      ttlEnabled: !!this.ttl,
    };

    return stats;
  }

  /**
   * Query logs from MongoDB (utility method).
   * 
   * @param {any} filter - MongoDB filter query
   * @param {any} [options] - Query options
   * @returns {Promise<any[]>} Array of log documents
   */
  public async query(filter: any = {}, options: any = {}): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
    }

    const defaultOptions = {
      sort: { timestamp: -1 },
      limit: 100,
    };

    const queryOptions = { ...defaultOptions, ...options };

    return this.logCollection
      .find(filter)
      .sort(queryOptions.sort)
      .limit(queryOptions.limit)
      .toArray();
  }

  /**
   * Get aggregated statistics from MongoDB.
   * 
   * @param {Date} [startDate] - Start date for aggregation
   * @param {Date} [endDate] - End date for aggregation
   * @returns {Promise<any>} Aggregation results
   */
  public async getAggregatedStats(startDate?: Date, endDate?: Date): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }

    const pipeline: any[] = [];

    // Date filter if provided
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      
      pipeline.push({ $match: { timestamp: dateFilter } });
    }

    // Aggregation pipeline
    pipeline.push(
      {
        $group: {
          _id: {
            level: '$level',
            hour: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.level',
          hours: {
            $push: {
              hour: '$_id.hour',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
      {
        $sort: { total: -1 },
      }
    );

    return this.logCollection.aggregate(pipeline).toArray();
  }
}

/**
 * Factory function to create a MongoDB transport with common defaults.
 * 
 * @param {Partial<MongoDBTransportOptions>} options - Transport options
 * @returns {MongoDBTransport} Configured MongoDB transport
 */
export function createMongoDBTransport(
  options: Partial<MongoDBTransportOptions>
): MongoDBTransport {
  if (!options.uri) {
    throw new Error('MongoDBTransport requires uri option');
  }

  return new MongoDBTransport({
    name: 'mongodb',
    enabled: true,
    level: 'info',
    maxBatchSize: 100,
    maxBatchTime: 5000,
    maxBatchBytes: 16 * 1024 * 1024, // 16MB (MongoDB document size limit)
    compress: false, // MongoDB handles compression
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
    },
    ...options,
    uri: options.uri,
  } as MongoDBTransportOptions);
}