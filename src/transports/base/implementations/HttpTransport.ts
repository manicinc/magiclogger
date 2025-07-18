// File: src/transports/implementations/HTTPTransport.ts

import { NetworkTransport } from '../NetworkTransport';
import type { HTTPTransportOptions, LogEntry, TransportStats } from '../../../types/transport';

/**
 * Interface for HTTP request configuration.
 */
interface HTTPRequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | Buffer;
  timeout: number;
}

/**
 * Transport that sends logs to HTTP/HTTPS endpoints.
 * 
 * The HTTPTransport provides flexible HTTP-based log delivery with:
 * - Multiple authentication methods (Basic, Bearer, API Key, Custom)
 * - Configurable request formats (JSON, NDJSON, Form data)
 * - Request/response transformation hooks
 * - Automatic retry with exponential backoff
 * - Connection pooling and keep-alive
 * - Custom header support
 * 
 * This transport is ideal for:
 * - Sending logs to log aggregation services
 * - Custom logging endpoints
 * - Webhooks and notifications
 * - Real-time log streaming services
 * 
 * @extends {NetworkTransport}
 * 
 * @example
 * ```typescript
 * const httpTransport = new HTTPTransport({
 *   name: 'http-logs',
 *   url: 'https://logs.example.com/ingest',
 *   method: 'POST',
 *   auth: {
 *     type: 'bearer',
 *     token: 'your-api-token'
 *   },
 *   bodyFormat: 'json',
 *   compress: true
 * });
 * 
 * await httpTransport.log({
 *   level: 'error',
 *   message: 'Database connection failed',
 *   error: { code: 'ECONNREFUSED' }
 * });
 * ```
 */
export class HTTPTransport extends NetworkTransport {
  /**
   * HTTP configuration.
   * @private
   */
  private readonly url: string;
  private readonly method: 'POST' | 'PUT' | 'PATCH';
  private readonly auth?: HTTPTransportOptions['auth'];
  private readonly bodyFormat: 'json' | 'ndjson' | 'form' | 'custom';
  private readonly transformRequest?: (logs: LogEntry[]) => any;

  /**
   * HTTP client instance.
   * @private
   */
  private httpAgent?: any;
  private httpsAgent?: any;

  /**
   * Dynamic imports for HTTP libraries.
   * @private
   */
  private axios?: any;
  private FormData?: any;

  /**
   * Parsed URL components.
   * @private
   */
  private urlParts: URL;

  /**
   * Creates a new HTTPTransport instance.
   * 
   * @param {HTTPTransportOptions} options - Transport configuration
   */
  constructor(options: HTTPTransportOptions) {
    super(options);

    // Validate required options
    if (!options.url) {
      throw new Error('HTTPTransport requires url option');
    }

    // Parse and validate URL
    try {
      this.urlParts = new URL(options.url);
    } catch (error) {
      throw new Error(`Invalid URL: ${options.url}`);
    }

    // Initialize HTTP configuration
    this.url = options.url;
    this.method = options.method || 'POST';
    this.auth = options.auth;
    this.bodyFormat = options.bodyFormat || 'json';
    this.transformRequest = options.transformRequest;
  }

  /**
   * Initialize HTTP client and verify configuration.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    // Load HTTP client library
    await this.loadHTTPClient();

    // Create HTTP agents for connection pooling
    await this.createHTTPAgents();

    // Verify endpoint connectivity (optional)
    if (process.env.NODE_ENV !== 'production') {
      await this.verifyEndpoint();
    }
  }

  /**
   * Load HTTP client library dynamically.
   * 
   * @private
   */
  private async loadHTTPClient(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Browser environment - use fetch API
      // No additional imports needed
    } else {
      // Node.js environment - use axios
      // Use dynamic imports with proper error handling
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - axios is an optional dependency loaded at runtime
      const axiosModule = await import('axios').catch(() => {
        throw new Error('axios package is required for HTTPTransport in Node.js. Install with: npm install axios');
      });
      this.axios = axiosModule.default || axiosModule;
      
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - form-data is an optional dependency loaded at runtime
      const formDataModule = await import('form-data').catch(() => {
        throw new Error('form-data package is required for HTTPTransport in Node.js. Install with: npm install form-data');
      });
      this.FormData = formDataModule.default || formDataModule;
    }
  }

  /**
   * Create HTTP/HTTPS agents for connection pooling.
   * 
   * @private
   */
  private async createHTTPAgents(): Promise<void> {
    if (typeof window !== 'undefined') {
      return; // Not needed in browser
    }

    const http = await import('http');
    const https = await import('https');

    // HTTP agent
    this.httpAgent = new http.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: this.timeout,
    });

    // HTTPS agent with TLS options
    this.httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: this.timeout,
      rejectUnauthorized: this.tls?.rejectUnauthorized !== false,
      cert: this.tls?.cert,
      key: this.tls?.key,
      ca: this.tls?.ca,
    });
  }

  /**
   * Verify endpoint connectivity.
   * 
   * @private
   */
  private async verifyEndpoint(): Promise<void> {
    try {
      const testConfig: HTTPRequestConfig = {
        url: this.url,
        method: 'OPTIONS',
        headers: await this.buildRequestHeaders(),
        body: '',
        timeout: 5000,
      };

      await this.executeRequest(testConfig);
    } catch (error: any) {
      // OPTIONS might not be supported, which is okay
      if (error.response?.status === 405) {
        return; // Method not allowed is fine
      }
      
      // Log warning but don't fail initialization
      console.warn(`HTTPTransport: Unable to verify endpoint ${this.url}:`, error.message);
    }
  }

  /**
   * Send a batch of logs to the HTTP endpoint.
   * 
   * @param {any} data - Prepared batch data
   * @param {any} batch - Original batch object
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async performNetworkRequest(data: any, batch: any): Promise<void> {
    // Build request configuration
    const config: HTTPRequestConfig = {
      url: this.url,
      method: this.method,
      headers: await this.buildRequestHeaders(),
      body: await this.buildRequestBody(batch.entries),
      timeout: this.timeout,
    };

    // Execute HTTP request
    const response = await this.executeRequest(config);

    // Validate response
    this.validateResponse(response);

    // Emit success event
    this.emit('httpSuccess', {
      url: this.url,
      method: this.method,
      status: response.status,
      entryCount: batch.entries.length,
    });
  }

  /**
   * Log a single entry (required by Transport base class).
   * HTTPTransport uses batching, so this method adds the entry to the batch.
   * 
   * @param {LogEntry} _entry - Log entry to process
   * @returns {Promise<void>} Resolves when entry is queued
   * @protected
   */
  protected async doLog(_entry: LogEntry): Promise<void> {
    // HTTPTransport uses batching - individual entries are handled by the batch system
    // This method is required by the Transport interface but not used directly
    throw new Error('HTTPTransport uses batching. Use the batch system instead of calling doLog directly.');
  }

  /**
   * Build headers for HTTP request.
   * 
   * @returns {Promise<Record<string, string>>} Headers object
   * @private
   */
  private async buildRequestHeaders(): Promise<Record<string, string>> {
    const headers = await this.buildHeaders();

    // Add content type based on body format
    switch (this.bodyFormat) {
      case 'json':
        headers['Content-Type'] = 'application/json';
        break;
      case 'ndjson':
        headers['Content-Type'] = 'application/x-ndjson';
        break;
      case 'form':
        // Content-Type set by FormData
        break;
      case 'custom':
        // User must set Content-Type in headers
        break;
    }

    // Add authentication headers
    if (this.auth) {
      const authHeaders = await this.buildAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    // Add compression header if needed
    if (this.compress) {
      headers['Content-Encoding'] = 'gzip';
    }

    return headers;
  }

  /**
   * Build authentication headers.
   * 
   * @returns {Promise<Record<string, string>>} Auth headers
   * @private
   */
  private async buildAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (!this.auth) {
      return headers;
    }

    switch (this.auth.type) {
      case 'basic':
        if (this.auth.username && this.auth.password) {
          const credentials = Buffer.from(
            `${this.auth.username}:${this.auth.password}`
          ).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case 'bearer':
        if (this.auth.token) {
          headers['Authorization'] = `Bearer ${this.auth.token}`;
        }
        break;

      case 'apikey':
        if (this.auth.apiKey) {
          const headerName = this.auth.apiKeyHeader || 'X-API-Key';
          headers[headerName] = this.auth.apiKey;
        }
        break;

      case 'custom':
        if (this.auth.customAuth) {
          const customHeaders = await this.auth.customAuth();
          Object.assign(headers, customHeaders);
        }
        break;
    }

    return headers;
  }

  /**
   * Build request body from log entries.
   * 
   * @param {LogEntry[]} entries - Log entries to send
   * @returns {Promise<string | Buffer>} Request body
   * @private
   */
  private async buildRequestBody(entries: LogEntry[]): Promise<string | Buffer> {
    let body: any;

    // Apply custom transform if provided
    if (this.transformRequest) {
      body = this.transformRequest(entries);
    } else {
      body = entries;
    }

    // Format body based on configuration
    let formatted: string | Buffer;

    switch (this.bodyFormat) {
      case 'json':
        formatted = JSON.stringify(body);
        break;

      case 'ndjson':
        if (Array.isArray(body)) {
          formatted = body.map(item => JSON.stringify(item)).join('\n') + '\n';
        } else {
          formatted = JSON.stringify(body) + '\n';
        }
        break;

      case 'form':
        formatted = await this.buildFormData(body);
        break;

      case 'custom':
        // Assume transform returns properly formatted body
        formatted = typeof body === 'string' || Buffer.isBuffer(body) 
          ? body 
          : JSON.stringify(body);
        break;

      default:
        formatted = JSON.stringify(body);
    }

    // Compress if enabled
    if (this.compress && typeof formatted === 'string') {
      formatted = await this.compressContent(Buffer.from(formatted, 'utf8'));
    }

    return formatted;
  }

  /**
   * Build form data from body.
   * 
   * @param {any} body - Body data
   * @returns {Promise<any>} Form data
   * @private
   */
  private async buildFormData(body: any): Promise<any> {
    if (typeof window !== 'undefined') {
      // Browser FormData
      const formData = new FormData();
      
      if (Array.isArray(body)) {
        formData.append('logs', JSON.stringify(body));
      } else {
        for (const [key, value] of Object.entries(body)) {
          formData.append(key, String(value));
        }
      }
      
      return formData;
    } else {
      // Node.js form-data
      const formData = new this.FormData();
      
      if (Array.isArray(body)) {
        formData.append('logs', JSON.stringify(body));
      } else {
        for (const [key, value] of Object.entries(body)) {
          formData.append(key, String(value));
        }
      }
      
      return formData;
    }
  }

  /**
   * Compress content using gzip.
   * 
   * @param {Buffer} content - Content to compress
   * @returns {Promise<Buffer>} Compressed content
   * @private
   */
  private async compressContent(content: Buffer): Promise<Buffer> {
    if (typeof window !== 'undefined') {
      // Browser environment
      if ('CompressionStream' in window) {
        const cs = new (window as any).CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(content);
        writer.close();
        
        const chunks: Uint8Array[] = [];
        const reader = cs.readable.getReader();
        
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        return Buffer.concat(chunks);
      }
      return content; // No compression available
    } else {
      // Node.js environment
      const zlib = await import('zlib');
      return new Promise((resolve, reject) => {
        zlib.gzip(content, (err, compressed) => {
          if (err) reject(err);
          else resolve(compressed);
        });
      });
    }
  }

  /**
   * Execute HTTP request with appropriate client.
   * 
   * @param {HTTPRequestConfig} config - Request configuration
   * @returns {Promise<any>} Response object
   * @private
   */
  private async executeRequest(config: HTTPRequestConfig): Promise<any> {
    if (typeof window !== 'undefined') {
      // Browser - use fetch API
      return this.executeFetchRequest(config);
    } else {
      // Node.js - use axios
      return this.executeAxiosRequest(config);
    }
  }

  /**
   * Execute request using fetch API (browser).
   * 
   * @param {HTTPRequestConfig} config - Request configuration
   * @returns {Promise<any>} Response object
   * @private
   */
  private async executeFetchRequest(config: HTTPRequestConfig): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: await response.text(),
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${config.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Execute request using axios (Node.js).
   * 
   * @param {HTTPRequestConfig} config - Request configuration
   * @returns {Promise<any>} Response object
   * @private
   */
  private async executeAxiosRequest(config: HTTPRequestConfig): Promise<any> {
    const isHTTPS = this.urlParts.protocol === 'https:';
    
    const axiosConfig: any = {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.body,
      timeout: config.timeout,
      maxRedirects: 5,
      validateStatus: () => true, // Don't throw on any status
      httpAgent: isHTTPS ? undefined : this.httpAgent,
      httpsAgent: isHTTPS ? this.httpsAgent : undefined,
    };

    // Handle form data - check if it's actually FormData with getHeaders method
    if (this.bodyFormat === 'form' && this.FormData && config.body instanceof this.FormData) {
      // Only call getHeaders if the body is actually a FormData instance
      if (typeof (config.body as any).getHeaders === 'function') {
        Object.assign(axiosConfig.headers, (config.body as any).getHeaders());
      }
    }

    const response = await this.axios.request(axiosConfig);

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    };
  }

  /**
   * Validate HTTP response.
   * 
   * @param {any} response - Response object
   * @throws {Error} If response indicates failure
   * @private
   */
  private validateResponse(response: any): void {
    if (response.status >= 200 && response.status < 300) {
      return; // Success
    }

    // Build error message
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    
    // Try to extract error details from response
    if (response.data) {
      try {
        const errorData = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;
        
        if (errorData.error) {
          errorMessage += `: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
      } catch {
        // If not JSON, include raw response
        if (typeof response.data === 'string' && response.data.length < 200) {
          errorMessage += `: ${response.data}`;
        }
      }
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).response = response;
    
    throw error;
  }

  /**
   * Clean up HTTP client resources.
   * 
   * @returns {Promise<void>} Resolves when cleaned up
   * @protected
   */
  protected async closeNetwork(): Promise<void> {
    // Destroy HTTP agents to close connections
    if (this.httpAgent) {
      this.httpAgent.destroy();
      this.httpAgent = undefined;
    }

    if (this.httpsAgent) {
      this.httpsAgent.destroy();
      this.httpsAgent = undefined;
    }
  }

  /**
   * Get transport statistics with HTTP-specific metrics.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();

    // Add HTTP-specific stats
    stats.custom = {
      ...stats.custom,
      url: this.url,
      method: this.method,
      authType: this.auth?.type || 'none',
      bodyFormat: this.bodyFormat,
      compressed: this.compress,
    };

    return stats;
  }
}

/**
 * Factory function to create an HTTP transport with common defaults.
 * 
 * @param {Partial<HTTPTransportOptions>} options - Transport options
 * @returns {HTTPTransport} Configured HTTP transport
 */
export function createHTTPTransport(options: Partial<HTTPTransportOptions>): HTTPTransport {
  if (!options.url) {
    throw new Error('HTTPTransport requires url option');
  }

  return new HTTPTransport({
    name: 'http',
    enabled: true,
    level: 'info',
    maxBatchSize: 100,
    maxBatchTime: 5000,
    maxBatchBytes: 1024 * 1024, // 1MB
    compress: false,
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
    },
    ...options,
    url: options.url,
  } as HTTPTransportOptions);
}