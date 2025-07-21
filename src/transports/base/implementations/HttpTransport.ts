// File: src/transports/base/implementations/HttpTransport.ts

import { NetworkTransport } from '../NetworkTransport';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import * as zlib from 'zlib';
import type { 
  HTTPTransportOptions, 
  LogEntry,
  NetworkTransportOptions 
} from '../../../types/transport';

/**
 * HTTP transport for sending logs to HTTP endpoints.
 * 
 * Features:
 * - Multiple authentication methods (Basic, Bearer, API Key, Custom)
 * - Request transformation and batching
 * - Automatic retry with exponential backoff
 * - Connection pooling for performance
 * - Multiple body formats (JSON, NDJSON, Form)
 * - Custom headers and request options
 * - Circuit breaker for failing endpoints
 * 
 * @class HTTPTransport
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
 *     token: process.env.LOG_API_TOKEN
 *   },
 *   bodyFormat: 'json',
 *   headers: {
 *     'X-Service-Name': 'my-app'
 *   }
 * });
 * ```
 */
export class HTTPTransport extends NetworkTransport {
  /**
   * Target URL for log delivery.
   * @private
   */
  private readonly targetUrl: URL;

  /**
   * HTTP method to use.
   * @private
   */
  private readonly method: string;

  /**
   * Authentication configuration.
   * @private
   */
  private readonly auth?: HTTPTransportOptions['auth'];

  /**
   * Request body format.
   * @private
   */
  private readonly bodyFormat: HTTPTransportOptions['bodyFormat'];

  /**
   * Custom request transformer.
   * @private
   */
  private readonly transformRequest?: HTTPTransportOptions['transformRequest'];

  /**
   * HTTP/HTTPS agent for connection pooling.
   * @private
   */
  private agent: http.Agent | https.Agent;

  /**
   * Cached auth headers.
   * @private
   */
  private authHeaders?: Record<string, string>;

  /**
   * Last auth refresh time.
   * @private
   */
  private lastAuthRefresh = 0;

  /**
   * Auth refresh interval (5 minutes).
   * @private
   */
  private readonly authRefreshInterval = 5 * 60 * 1000;

  /**
   * Creates a new HTTPTransport instance.
   * 
   * @param {HTTPTransportOptions} options - Transport configuration
   */
  constructor(options: HTTPTransportOptions) {
    const networkOptions: NetworkTransportOptions = {
      ...options,
      // HTTP specific defaults
      maxBatchSize: options.maxBatchSize || 100,
      maxBatchTime: options.maxBatchTime || 5000,
      maxBatchBytes: options.maxBatchBytes || 1024 * 1024, // 1MB
    };

    super(networkOptions);

    this.targetUrl = new URL(options.url);
    this.url = options.url; // Set parent's url property
    this.method = options.method || 'POST';
    this.auth = options.auth;
    this.bodyFormat = options.bodyFormat || 'json';
    this.transformRequest = options.transformRequest;

    // Create appropriate agent
    const isHttps = this.targetUrl.protocol === 'https:';
    const AgentClass = isHttps ? https.Agent : http.Agent;
    
    this.agent = new AgentClass({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 100,
      maxFreeSockets: 10,
      timeout: this.requestTimeout,
      // Add TLS options for HTTPS
      ...(isHttps && this.tls ? {
        rejectUnauthorized: this.tls.rejectUnauthorized ?? true,
        cert: this.tls.cert,
        key: this.tls.key,
        ca: this.tls.ca,
      } : {}),
    });
  }

  /**
   * Initialize HTTP transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    // Initialize auth headers
    if (this.auth) {
      await this.refreshAuthHeaders();
    }

    // Test endpoint connectivity
    await this.testEndpoint();
  }

  /**
   * Establish connection (HTTP doesn't maintain persistent connections).
   * 
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async connect(): Promise<void> {
    // HTTP doesn't maintain persistent connections
    // Connection is established per request
  }

  /**
   * Disconnect (HTTP doesn't maintain persistent connections).
   * 
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async disconnect(): Promise<void> {
    // Clean up agent
    this.agent.destroy();
  }

  /**
   * Send data over HTTP.
   * 
   * @param {unknown} data - Data to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendData(data: unknown): Promise<void> {
    const body = typeof data === 'string' || Buffer.isBuffer(data) 
      ? data 
      : JSON.stringify(data);

    const headers = await this.buildRequestHeaders(body);
    
    await this.makeHttpRequest(this.method, this.targetUrl, headers, body);
  }

  /**
   * Check connection health.
   * 
   * @returns {Promise<void>} Resolves if healthy
   * @protected
   */
  protected async checkHealth(): Promise<void> {
    // Make a lightweight health check request
    const healthUrl = new URL(this.targetUrl.toString());
    healthUrl.pathname = healthUrl.pathname.replace(/\/$/, '') + '/health';

    try {
      await this.makeHttpRequest('GET', healthUrl, {});
    } catch (error: unknown) {
      // If health endpoint doesn't exist, try HEAD request to main endpoint
      try {
        await this.makeHttpRequest('HEAD', this.targetUrl, {});
      } catch {
        throw new Error(`Health check failed: ${error}`);
      }
    }
  }

  /**
   * Test endpoint connectivity.
   * 
   * @returns {Promise<void>} Resolves if endpoint is reachable
   * @private
   */
  private async testEndpoint(): Promise<void> {
    try {
      await this.checkHealth();
    } catch (error: unknown) {
      // Only warn, don't fail initialization
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[HTTPTransport] Health check failed for ${this.targetUrl.hostname}: ${errorMessage}`);
    }
  }

  /**
   * Refresh authentication headers.
   * 
   * @returns {Promise<void>} Resolves when headers are refreshed
   * @private
   */
  private async refreshAuthHeaders(): Promise<void> {
    if (!this.auth) return;

    const headers: Record<string, string> = {};

    switch (this.auth.type) {
      case 'basic':
        if (this.auth.username && this.auth.password) {
          const credentials = Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64');
          headers.Authorization = `Basic ${credentials}`;
        }
        break;

      case 'bearer':
        if (this.auth.token) {
          headers.Authorization = `Bearer ${this.auth.token}`;
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

    this.authHeaders = headers;
    this.lastAuthRefresh = Date.now();
  }

  /**
   * Perform the network request to send logs.
   * 
   * @param {LogEntry[]} entries - Log entries to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async performNetworkRequest(entries: LogEntry[]): Promise<void> {
    // Refresh auth if needed
    if (this.auth && Date.now() - this.lastAuthRefresh > this.authRefreshInterval) {
      await this.refreshAuthHeaders();
    }

    // Transform data if transformer provided
    const body = this.transformRequest ? this.transformRequest(entries) : this.formatBody(entries);

    // Build headers
    const headers = await this.buildRequestHeaders(body);

    // Make request
    const response = await this.makeHttpRequest(this.method, this.targetUrl, headers, body);

    // Validate response
    if (response.statusCode && response.statusCode >= 400) {
      throw new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`);
    }

    this.emit('sent', {
      url: this.targetUrl.toString(),
      count: entries.length,
      size: Buffer.byteLength(body),
      statusCode: response.statusCode,
    });
  }

  /**
   * Format request body based on bodyFormat.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {string | Buffer} Formatted body
   * @private
   */
  private formatBody(entries: LogEntry[]): string | Buffer {
    switch (this.bodyFormat) {
      case 'json':
        return JSON.stringify({
          logs: entries,
          count: entries.length,
          timestamp: new Date().toISOString(),
        });

      case 'ndjson':
        return entries.map(e => JSON.stringify(e)).join('\n') + '\n';

      case 'form': {
        const params = new URLSearchParams();
        entries.forEach((entry, i) => {
          params.append(`log[${i}]`, JSON.stringify(entry));
        });
        return params.toString();
      }

      case 'custom':
        // Should use transformRequest
        throw new Error('Custom body format requires transformRequest function');

      default:
        return JSON.stringify(entries);
    }
  }

  /**
   * Build request headers.
   * 
   * @param {string | Buffer} body - Request body
   * @returns {Promise<Record<string, string>>} Headers
   * @private
   */
  private async buildRequestHeaders(body: string | Buffer): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...await this.buildHeaders(),
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': this.getContentType(),
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };

    // Add auth headers
    if (this.authHeaders) {
      Object.assign(headers, this.authHeaders);
    }

    // Add custom headers
    if (this.headers) {
      Object.assign(headers, this.headers);
    }

    return headers;
  }

  /**
   * Get content type for request.
   * 
   * @returns {string} Content type
   * @private
   */
  private getContentType(): string {
    switch (this.bodyFormat) {
      case 'json':
        return 'application/json; charset=utf-8';
      case 'ndjson':
        return 'application/x-ndjson; charset=utf-8';
      case 'form':
        return 'application/x-www-form-urlencoded';
      default:
        return 'application/json; charset=utf-8';
    }
  }

  /**
   * Make HTTP/HTTPS request.
   * 
   * @param {string} method - HTTP method
   * @param {URL} url - Request URL
   * @param {Record<string, string>} headers - Request headers
   * @param {string | Buffer} body - Request body
   * @returns {Promise<any>} Response
   * @private
   */
  private async makeHttpRequest(
    method: string,
    url: URL,
    headers: Record<string, string>,
    body?: string | Buffer
  ): Promise<{
    statusCode?: number;
    statusMessage?: string;
    headers: http.IncomingHttpHeaders;
    body: string;
  }> {
    return new Promise((resolve, reject) => {
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;

      const options = {
        method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers,
        agent: this.agent,
        timeout: this.requestTimeout,
      };

      const req = lib.request(options, (res) => {
        let data = '';
        
        // Handle compression
        let stream: NodeJS.ReadableStream = res;
        if (res.headers['content-encoding'] === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (res.headers['content-encoding'] === 'deflate') {
          stream = res.pipe(zlib.createInflate());
        }

        stream.on('data', (chunk) => {
          data += chunk.toString();
        });

        stream.on('end', () => {
          const response = {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            body: data,
          };

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`) as Error & { 
              statusCode?: number; 
              response?: typeof response;
            };
            error.statusCode = res.statusCode;
            error.response = response;
            reject(error);
          }
        });

        stream.on('error', reject);
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.requestTimeout}ms`));
      });

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Close the HTTP transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async closeNetwork(): Promise<void> {
    this.agent.destroy();
  }

  /**
   * Override retry condition for HTTP-specific errors.
   * 
   * @param {Error} error - The error to check
   * @returns {boolean} Whether to retry
   * @protected
   */
  protected defaultRetryCondition(error: Error): boolean {
    // Check base conditions first
    if (super.defaultRetryCondition(error)) {
      return true;
    }

    // HTTP specific retry conditions
    const message = error.message.toLowerCase();
    
    // Retry on specific HTTP errors
    if (message.includes('request timeout') ||
        message.includes('socket hang up') ||
        message.includes('econnreset')) {
      return true;
    }

    return false;
  }
}