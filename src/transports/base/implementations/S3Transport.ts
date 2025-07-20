// File: src/transports/base/implementations/S3Transport.ts

import { NetworkTransport } from '../NetworkTransport';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import type { 
  S3TransportOptions, 
  LogEntry,
  NetworkTransportOptions 
} from '../../../types/transport';

/**
 * AWS S3 transport for archiving logs to S3 buckets.
 * 
 * Features:
 * - Direct S3 API integration (no SDK dependency)
 * - Multiple key naming strategies
 * - Server-side encryption support
 * - Automatic retry with exponential backoff
 * - Compression before upload
 * - Tagging and metadata support
 * - Multiple storage classes
 * - Batch uploads for efficiency
 * 
 * @class S3Transport
 * @extends {NetworkTransport}
 * 
 * @example
 * ```typescript
 * const s3Transport = new S3Transport({
 *   name: 's3-logs',
 *   bucket: 'my-app-logs',
 *   region: 'us-east-1',
 *   prefix: 'logs/',
 *   keyStrategy: 'date-hierarchy',
 *   storageClass: 'INTELLIGENT_TIERING',
 *   encryption: {
 *     type: 'AES256'
 *   },
 *   credentials: {
 *     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 *     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
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
   * S3 key prefix.
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
  private credentials: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };

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
   * Key naming strategy.
   * @private
   */
  private readonly keyStrategy: S3TransportOptions['keyStrategy'];

  /**
   * Custom key generator.
   * @private
   */
  private readonly keyGenerator?: S3TransportOptions['keyGenerator'];

  /**
   * File format for uploads.
   * @private
   */
  private readonly fileFormat: S3TransportOptions['fileFormat'];

  /**
   * Object tags.
   * @private
   */
  private readonly objectTags?: Record<string, string>;

  /**
   * S3 endpoint URL.
   * @private
   */
  private readonly endpoint: string;

  /**
   * HTTP agent for connection pooling.
   * @private
   */
  private agent: https.Agent;

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
      maxBatchTime: options.maxBatchTime || 30000, // 30 seconds
      maxBatchBytes: options.maxBatchBytes || 5 * 1024 * 1024, // 5MB
      compress: options.compress ?? true,
    };

    super(networkOptions);

    this.bucket = options.bucket;
    this.prefix = options.prefix || 'logs/';
    this.region = options.region || 'us-east-1';
    this.credentials = options.credentials || {};
    this.storageClass = options.storageClass || 'STANDARD';
    this.encryption = options.encryption;
    this.keyStrategy = options.keyStrategy || 'timestamp';
    this.keyGenerator = options.keyGenerator;
    this.fileFormat = options.fileFormat || 'jsonl';
    this.objectTags = options.objectTags;

    // Set endpoint based on region
    this.endpoint = `s3.${this.region}.amazonaws.com`;

    // Initialize HTTP agent
    this.agent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 60000,
    });
  }

  /**
   * Initialize S3 transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    // Load credentials from environment if not provided
    if (!this.credentials.accessKeyId) {
      this.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      };
    }

    // Validate credentials
    if (!this.credentials.accessKeyId || !this.credentials.secretAccessKey) {
      throw new Error('AWS credentials not provided');
    }

    // Test bucket access
    await this.testBucketAccess();
  }

  /**
   * Test access to the S3 bucket.
   * 
   * @returns {Promise<void>} Resolves if bucket is accessible
   * @private
   */
  private async testBucketAccess(): Promise<void> {
    const method = 'HEAD';
    const path = `/${this.bucket}`;
    
    try {
      await this.makeS3Request(method, path);
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw new Error(`Bucket '${this.bucket}' not found`);
      } else if (error.statusCode === 403) {
        throw new Error(`Access denied to bucket '${this.bucket}'`);
      }
      throw error;
    }
  }

  /**
   * Perform the network request to upload logs to S3.
   * 
   * @param {any} data - Prepared log data
   * @param {any} batch - Batch metadata
   * @returns {Promise<void>} Resolves when uploaded
   * @protected
   */
  protected async performNetworkRequest(data: any, batch: any): Promise<void> {
    // Generate S3 key
    const key = this.generateS3Key(batch.entries);

    // Format data based on file format
    const body = await this.formatData(batch.entries);

    // Prepare S3 request
    const method = 'PUT';
    const path = `/${this.bucket}/${key}`;
    const headers = await this.buildS3Headers(method, path, body);

    // Add storage class header
    if (this.storageClass !== 'STANDARD') {
      headers['x-amz-storage-class'] = this.storageClass;
    }

    // Add encryption headers
    if (this.encryption) {
      if (this.encryption.type === 'AES256') {
        headers['x-amz-server-side-encryption'] = 'AES256';
      } else if (this.encryption.type === 'KMS' && this.encryption.kmsKeyId) {
        headers['x-amz-server-side-encryption'] = 'aws:kms';
        headers['x-amz-server-side-encryption-aws-kms-key-id'] = this.encryption.kmsKeyId;
      }
    }

    // Add object tags
    if (this.objectTags) {
      const tags = Object.entries(this.objectTags)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      headers['x-amz-tagging'] = tags;
    }

    // Make request
    await this.makeS3Request(method, path, headers, body);

    this.emit('uploaded', {
      bucket: this.bucket,
      key,
      size: body.length,
      count: batch.entries.length,
    });
  }

  /**
   * Generate S3 key based on strategy.
   * 
   * @param {LogEntry[]} entries - Log entries in the batch
   * @returns {string} Generated S3 key
   * @private
   */
  private generateS3Key(entries: LogEntry[]): string {
    // Use custom generator if provided
    if (this.keyGenerator) {
      return this.prefix + this.keyGenerator(entries);
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    
    let key = this.prefix;

    switch (this.keyStrategy) {
      case 'timestamp':
        key += `${timestamp}-${this.generateId()}.${this.getFileExtension()}`;
        break;

      case 'date-hierarchy':
        key += `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/`;
        key += `${timestamp}-${this.generateId()}.${this.getFileExtension()}`;
        break;

      case 'hourly':
        key += `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/`;
        key += `${String(now.getHours()).padStart(2, '0')}/`;
        key += `${timestamp}-${this.generateId()}.${this.getFileExtension()}`;
        break;

      case 'custom':
        // Should have custom generator
        throw new Error('Custom key strategy requires keyGenerator function');

      default:
        key += `${timestamp}-${this.generateId()}.${this.getFileExtension()}`;
    }

    return key;
  }

  /**
   * Get file extension based on format.
   * 
   * @returns {string} File extension
   * @private
   */
  private getFileExtension(): string {
    const extensions: Record<string, string> = {
      json: 'json',
      jsonl: 'jsonl',
      csv: 'csv',
      parquet: 'parquet',
    };

    let ext = extensions[this.fileFormat] || 'log';
    
    if (this.compress) {
      ext += '.gz';
    }

    return ext;
  }

  /**
   * Format log data based on file format.
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
        content = this.convertToCSV(entries);
        break;

      case 'parquet':
        // Would require parquet library
        throw new Error('Parquet format not implemented');

      default:
        content = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
    }

    const buffer = Buffer.from(content, 'utf8');

    // Compress if enabled
    if (this.compress) {
      const zlib = await import('zlib');
      return new Promise((resolve, reject) => {
        zlib.gzip(buffer, (err, compressed) => {
          if (err) reject(err);
          else resolve(compressed);
        });
      });
    }

    return buffer;
  }

  /**
   * Convert log entries to CSV format.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {string} CSV content
   * @private
   */
  private convertToCSV(entries: LogEntry[]): string {
    if (entries.length === 0) return '';

    // Define CSV columns
    const columns = [
      'id',
      'timestamp',
      'level',
      'message',
      'loggerId',
      'tags',
      'error',
      'context',
    ];

    // Header row
    let csv = columns.join(',') + '\n';

    // Data rows
    for (const entry of entries) {
      const row = columns.map(col => {
        let value = entry[col as keyof LogEntry];
        
        if (value === null || value === undefined) {
          return '';
        }

        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

        // Escape CSV values
        value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      });

      csv += row.join(',') + '\n';
    }

    return csv;
  }

  /**
   * Build headers for S3 request.
   * 
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {Buffer} body - Request body
   * @returns {Promise<Record<string, string>>} Headers
   * @private
   */
  private async buildS3Headers(
    method: string,
    path: string,
    body: Buffer
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      Host: this.endpoint,
      'Content-Type': this.getContentType(),
      'Content-Length': String(body.length),
      'x-amz-date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''),
      'x-amz-content-sha256': crypto.createHash('sha256').update(body).digest('hex'),
    };

    // Add base headers
    Object.assign(headers, await this.buildHeaders());

    // Sign request (AWS Signature V4)
    await this.signRequest(method, path, headers, body);

    return headers;
  }

  /**
   * Sign S3 request using AWS Signature V4.
   * 
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {Record<string, string>} headers - Request headers
   * @param {Buffer} body - Request body
   * @returns {Promise<void>} Adds authorization header
   * @private
   */
  private async signRequest(
    method: string,
    path: string,
    headers: Record<string, string>,
    body: Buffer
  ): Promise<void> {
    const datetime = headers['x-amz-date'];
    const date = datetime.substring(0, 8);
    
    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
      .join('\n');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(k => k.toLowerCase())
      .join(';');

    const canonicalRequest = [
      method,
      path,
      '', // query string
      canonicalHeaders + '\n',
      signedHeaders,
      headers['x-amz-content-sha256'],
    ].join('\n');

    // Create string to sign
    const credentialScope = `${date}/${this.region}/s3/aws4_request`;
    const hashedRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      datetime,
      credentialScope,
      hashedRequest,
    ].join('\n');

    // Calculate signature
    const kDate = this.hmac(`AWS4${this.credentials.secretAccessKey}`, date);
    const kRegion = this.hmac(kDate, this.region);
    const kService = this.hmac(kRegion, 's3');
    const kSigning = this.hmac(kService, 'aws4_request');
    const signature = this.hmac(kSigning, stringToSign, 'hex');

    // Add authorization header
    headers.Authorization = [
      `AWS4-HMAC-SHA256 Credential=${this.credentials.accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');

    // Add session token if present
    if (this.credentials.sessionToken) {
      headers['x-amz-security-token'] = this.credentials.sessionToken;
    }
  }

  /**
   * HMAC helper for AWS signing.
   * 
   * @param {string | Buffer} key - HMAC key
   * @param {string} data - Data to sign
   * @param {string} encoding - Output encoding
   * @returns {any} HMAC result
   * @private
   */
  private hmac(key: string | Buffer, data: string, encoding?: any): any {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return encoding ? hmac.digest(encoding) : hmac.digest();
  }

  /**
   * Make S3 API request.
   * 
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {Record<string, string>} headers - Request headers
   * @param {Buffer} body - Request body
   * @returns {Promise<any>} Response data
   * @private
   */
  private async makeS3Request(
    method: string,
    path: string,
    headers?: Record<string, string>,
    body?: Buffer
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        hostname: this.endpoint,
        path,
        headers: headers || {},
        agent: this.agent,
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data ? JSON.parse(data) : null);
          } else {
            const error: any = new Error(`S3 request failed: ${res.statusCode} ${res.statusMessage}`);
            error.statusCode = res.statusCode;
            error.response = data;
            reject(error);
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Get content type for uploads.
   * 
   * @returns {string} Content type
   * @private
   */
  private getContentType(): string {
    const types: Record<string, string> = {
      json: 'application/json',
      jsonl: 'application/x-ndjson',
      csv: 'text/csv',
      parquet: 'application/octet-stream',
    };

    let contentType = types[this.fileFormat] || 'application/octet-stream';
    
    if (this.compress) {
      contentType = 'application/gzip';
    }

    return contentType;
  }

  /**
   * Close the S3 transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async closeNetwork(): Promise<void> {
    this.agent.destroy();
  }
}