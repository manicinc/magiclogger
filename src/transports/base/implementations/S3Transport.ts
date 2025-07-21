// File: src/transports/base/implementations/S3Transport.ts

import { NetworkTransport } from '../NetworkTransport';
import { createHash } from 'crypto';
import type { 
  S3TransportOptions, 
  LogEntry,
  NetworkTransportOptions 
} from '../../../types/transport';

/**
 * S3 transport for archiving logs to Amazon S3.
 * 
 * Features:
 * - Automatic key generation with multiple strategies
 * - Server-side encryption support
 * - Object lifecycle management via tags
 * - Multiple file formats (JSON, JSONL, CSV)
 * - Compression support
 * - S3-compatible storage support (MinIO, etc.)
 * - Batch uploads for efficiency
 * 
 * @class S3Transport
 * @extends {NetworkTransport}
 * 
 * @example
 * ```typescript
 * const s3Transport = new S3Transport({
 *   name: 's3-archive',
 *   bucket: 'my-logs',
 *   region: 'us-east-1',
 *   prefix: 'app-logs/',
 *   keyStrategy: 'date-hierarchy',
 *   fileFormat: 'jsonl',
 *   compress: true,
 *   encryption: {
 *     type: 'AES256'
 *   }
 * });
 * ```
 */
export class S3Transport extends NetworkTransport {
  /**
   * S3 bucket name.
   * @private
   */
  private readonly bucket: string;

  /**
   * Key prefix for all objects.
   * @private
   */
  private readonly prefix: string;

  /**
   * AWS region.
   * @private
   */
  private readonly region: string;

  /**
   * AWS credentials.
   * @private
   */
  private readonly credentials?: S3TransportOptions['credentials'];

  /**
   * Storage class for objects.
   * @private
   */
  private readonly storageClass: S3TransportOptions['storageClass'];

  /**
   * Encryption settings.
   * @private
   */
  private readonly encryption?: S3TransportOptions['encryption'];

  /**
   * Key generation strategy.
   * @private
   */
  private readonly keyStrategy: S3TransportOptions['keyStrategy'];

  /**
   * Custom key generator.
   * @private
   */
  private readonly keyGenerator?: S3TransportOptions['keyGenerator'];

  /**
   * File format for storage.
   * @private
   */
  private readonly fileFormat: S3TransportOptions['fileFormat'];

  /**
   * Object tags.
   * @private
   */
  private readonly objectTags?: Record<string, string>;

  /**
   * Whether compression is enabled.
   * @private
   */
  private readonly compress: boolean;

  /**
   * S3 client instance.
   * @private
   */
  private s3Client?: any;

  /**
   * Creates a new S3Transport instance.
   * 
   * @param {S3TransportOptions} options - Transport configuration
   */
  constructor(options: S3TransportOptions) {
    const networkOptions: NetworkTransportOptions = {
      ...options,
      // S3 specific defaults
      maxBatchSize: options.maxBatchSize || 1000,
      maxBatchTime: options.maxBatchTime || 60000, // 1 minute
      maxBatchBytes: options.maxBatchBytes || 5 * 1024 * 1024, // 5MB
    };

    super(networkOptions);

    this.bucket = options.bucket;
    this.prefix = options.prefix || '';
    this.region = options.region || 'us-east-1';
    this.credentials = options.credentials;
    this.storageClass = options.storageClass || 'STANDARD';
    this.encryption = options.encryption;
    this.keyStrategy = options.keyStrategy || 'timestamp';
    this.keyGenerator = options.keyGenerator;
    this.fileFormat = options.fileFormat || 'jsonl';
    this.objectTags = options.objectTags;
    this.compress = options.compress ?? false;

    // Set URL for parent class
    this.url = `s3://${this.bucket}/${this.prefix}`;
  }

  /**
   * Initialize S3 client.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    await this.connect();
  }

  /**
   * Connect to S3 (initialize client).
   * 
   * @returns {Promise<void>} Resolves when connected
   * @protected
   */
  protected async connect(): Promise<void> {
    try {
      // Dynamic import AWS SDK
      const AWS = await import('aws-sdk');
      
      // Configure S3 client
      const config: any = {
        region: this.region,
        apiVersion: '2006-03-01',
      };

      if (this.credentials) {
        config.credentials = {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
          sessionToken: this.credentials.sessionToken,
        };
      }

      this.s3Client = new AWS.S3(config);
      
      // Test connection by checking bucket exists
      await this.s3Client.headBucket({ Bucket: this.bucket }).promise();
      
      this.connectionState = 'connected';
      this.emit('connected', { bucket: this.bucket });
      
    } catch (error) {
      this.connectionState = 'disconnected';
      throw new Error(`S3 connection failed: ${error}`);
    }
  }

  /**
   * Disconnect from S3 (no-op for S3).
   * 
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async disconnect(): Promise<void> {
    this.s3Client = undefined;
    this.connectionState = 'disconnected';
  }

  /**
   * Send data to S3 (not used, see performNetworkRequest).
   * 
   * @param {unknown} data - Data to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendData(data: unknown): Promise<void> {
    // Not used - see performNetworkRequest
    throw new Error('Use performNetworkRequest instead');
  }

  /**
   * Check S3 connection health.
   * 
   * @returns {Promise<void>} Resolves if healthy
   * @protected
   */
  protected async checkHealth(): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    // Check bucket accessibility
    await this.s3Client.headBucket({ Bucket: this.bucket }).promise();
  }

  /**
   * Perform the network request to upload logs.
   * 
   * @param {LogEntry[]} entries - Log entries to upload
   * @returns {Promise<void>} Resolves when uploaded
   * @protected
   */
  protected async performNetworkRequest(entries: LogEntry[]): Promise<void> {
    if (!this.s3Client) {
      await this.connect();
    }

    // Generate key for this batch
    const key = this.generateKey(entries);

    // Format and optionally compress data
    let body = await this.formatData(entries);
    let contentEncoding: string | undefined;

    if (this.compress) {
      const zlib = await import('zlib');
      body = await new Promise<Buffer>((resolve, reject) => {
        zlib.gzip(body, (error, compressed) => {
          if (error) reject(error);
          else resolve(compressed);
        });
      });
      contentEncoding = 'gzip';
    }

    // Prepare upload parameters
    const params: any = {
      Bucket: this.bucket,
      Key: key,
      Body: body,
      StorageClass: this.storageClass,
      ContentType: this.getContentType(),
      Metadata: {
        'log-count': String(entries.length),
        'log-format': this.fileFormat,
        'log-transport': 'magiclogger',
      },
    };

    // Add encryption
    if (this.encryption) {
      if (this.encryption.type === 'AES256') {
        params.ServerSideEncryption = 'AES256';
      } else if (this.encryption.type === 'KMS') {
        params.ServerSideEncryption = 'aws:kms';
        if (this.encryption.kmsKeyId) {
          params.SSEKMSKeyId = this.encryption.kmsKeyId;
        }
      }
    }

    // Add content encoding if compressed
    if (contentEncoding) {
      params.ContentEncoding = contentEncoding;
    }

    // Add tags
    if (this.objectTags) {
      const tags = Object.entries(this.objectTags)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      params.Tagging = tags;
    }

    // Upload to S3
    const result = await this.s3Client.upload(params).promise();

    this.emit('uploaded', {
      bucket: this.bucket,
      key,
      location: result.Location,
      etag: result.ETag,
      size: Buffer.byteLength(body),
      entries: entries.length,
    });
  }

  /**
   * Generate S3 key based on strategy.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {string} S3 object key
   * @private
   */
  private generateKey(entries: LogEntry[]): string {
    let key = this.prefix;

    if (this.keyGenerator) {
      key += this.keyGenerator(entries);
    } else {
      const now = new Date();
      const timestamp = entries[0]?.timestamp || now.toISOString();
      const date = new Date(timestamp);

      switch (this.keyStrategy) {
        case 'timestamp':
          key += `${date.getTime()}-${this.generateHash(entries)}.${this.getFileExtension()}`;
          break;

        case 'date-hierarchy':
          key += `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/`;
          key += `${date.getTime()}-${this.generateHash(entries)}.${this.getFileExtension()}`;
          break;

        case 'hourly':
          key += `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/`;
          key += `${String(date.getHours()).padStart(2, '0')}/`;
          key += `${date.getTime()}-${this.generateHash(entries)}.${this.getFileExtension()}`;
          break;

        case 'custom':
          throw new Error('Custom key strategy requires keyGenerator function');

        default:
          key += `${date.getTime()}-${this.generateHash(entries)}.${this.getFileExtension()}`;
      }
    }

    return key;
  }

  /**
   * Generate hash for uniqueness.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {string} Hash string
   * @private
   */
  private generateHash(entries: LogEntry[]): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(entries.map(e => e.id)));
    return hash.digest('hex').substring(0, 8);
  }

  /**
   * Get file extension based on format.
   * 
   * @returns {string} File extension
   * @private
   */
  private getFileExtension(): string {
    const ext = this.fileFormat === 'jsonl' ? 'jsonl' : this.fileFormat;
    return this.compress ? `${ext}.gz` : ext;
  }

  /**
   * Get content type for S3 object.
   * 
   * @returns {string} Content type
   * @private
   */
  private getContentType(): string {
    switch (this.fileFormat) {
      case 'json':
      case 'jsonl':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'parquet':
        return 'application/octet-stream';
      default:
        return 'application/json';
    }
  }

  /**
   * Format data based on file format.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {Promise<Buffer>} Formatted data
   * @private
   */
  private async formatData(entries: LogEntry[]): Promise<Buffer> {
    let content: string;

    switch (this.fileFormat) {
      case 'json':
        content = JSON.stringify(entries, null, 2);
        break;

      case 'jsonl':
        content = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
        break;

      case 'csv':
        content = await this.formatAsCSV(entries);
        break;

      case 'parquet':
        throw new Error('Parquet format not yet implemented');

      default:
        content = JSON.stringify(entries);
    }

    return Buffer.from(content, 'utf8');
  }

  /**
   * Format entries as CSV.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {Promise<string>} CSV content
   * @private
   */
  private async formatAsCSV(entries: LogEntry[]): Promise<string> {
    if (entries.length === 0) return '';

    // Get all unique keys from entries
    const allKeys = new Set<string>();
    entries.forEach(entry => {
      Object.keys(entry).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const rows: string[] = [headers.join(',')];

    // Add data rows
    for (const entry of entries) {
      const values = headers.map(key => {
        const value = (entry as any)[key];
        if (value === undefined || value === null) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).includes(',') ? `"${String(value).replace(/"/g, '""')}"` : String(value);
      });
      rows.push(values.join(','));
    }

    return rows.join('\n') + '\n';
  }

  /**
   * List objects in bucket with prefix.
   * 
   * @param {object} options - List options
   * @returns {Promise<any[]>} S3 objects
   */
  public async listObjects(options: {
    prefix?: string;
    maxKeys?: number;
    continuationToken?: string;
  } = {}): Promise<any[]> {
    if (!this.s3Client) {
      await this.connect();
    }

    const params: any = {
      Bucket: this.bucket,
      Prefix: this.prefix + (options.prefix || ''),
      MaxKeys: options.maxKeys || 1000,
    };

    if (options.continuationToken) {
      params.ContinuationToken = options.continuationToken;
    }

    const result = await this.s3Client.listObjectsV2(params).promise();
    return result.Contents || [];
  }

  /**
   * Download object from S3.
   * 
   * @param {string} key - Object key
   * @returns {Promise<Buffer>} Object data
   */
  public async getObject(key: string): Promise<Buffer> {
    if (!this.s3Client) {
      await this.connect();
    }

    const result = await this.s3Client.getObject({
      Bucket: this.bucket,
      Key: key,
    }).promise();

    return result.Body as Buffer;
  }

  /**
   * Delete objects from S3.
   * 
   * @param {string[]} keys - Object keys to delete
   * @returns {Promise<void>} Resolves when deleted
   */
  public async deleteObjects(keys: string[]): Promise<void> {
    if (!this.s3Client || keys.length === 0) return;

    const params = {
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
      },
    };

    await this.s3Client.deleteObjects(params).promise();
  }

  /**
   * Close S3 transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async closeNetwork(): Promise<void> {
    await this.disconnect();
  }
}