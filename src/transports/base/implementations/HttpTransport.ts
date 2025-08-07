/**
 * HTTP transport implementation for MagicLogger.
 * 
 * Sends log entries to HTTP endpoints with support for various authentication
 * methods, request formats, batching, and retry logic.
 * 
 * @module transports/implementations
 */

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
 * Circuit breaker states
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

/**
 * Circuit breaker for HTTP endpoints
 */
class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;

  constructor(
    failureThreshold = 5,
    resetTimeout = 60000, // 1 minute
    successThreshold = 3
  ) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.successThreshold = successThreshold;
  }

  recordSuccess(): void {
    this.failures = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.failures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  canAttempt(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }

    return true; // HALF_OPEN state
  }

  getState(): CircuitState {
    return this.state;
  }
}

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
 * - Compression support (gzip, deflate)
 * - Proxy support
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
 *   },
 *   compress: true
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
   * Response transformer.
   * @private
   */
  private readonly transformResponse?: HTTPTransportOptions['transformResponse'];

  /**
   * Whether to follow redirects.
   * @private
   */
  private readonly followRedirects: boolean;

  /**
   * Maximum redirects to follow.
   * @private
   */
  private readonly maxRedirects: number;

  /**
   * Proxy configuration.
   * @private
   */
  private readonly proxy?: HTTPTransportOptions['proxy'];

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
   * Circuit breaker instance.
   * @private
   */
  private internalCircuitBreaker: CircuitBreaker;

  /**
   * Whether compression is enabled.
   * @private
   */
  private readonly compressionEnabled: boolean;

  /**
   * Creates a new HTTPTransport instance.
   * 
   * @param {HTTPTransportOptions} options - Transport configuration
   */
  constructor(options: HTTPTransportOptions) {
    // Validate required options
    if (!options.url) {
      throw new Error('HTTPTransport requires url option');
    }

    const networkOptions: NetworkTransportOptions = {
      ...options,
      // HTTP specific defaults
      maxBatchSize: options.maxBatchSize || 100,
      maxBatchTime: options.maxBatchTime || 5000,
      maxBatchBytes: options.maxBatchBytes || 1024 * 1024, // 1MB
      compress: options.compress ?? false,
    };

    super(networkOptions);

    try {
      this.targetUrl = new URL(options.url);
    } catch (error) {
      throw new Error(`Invalid URL: ${options.url}`);
    }
    
    this.method = options.method?.toUpperCase() || 'POST';
    this.auth = options.auth;
    this.bodyFormat = options.bodyFormat || 'json';
    this.transformRequest = options.transformRequest;
    this.transformResponse = options.transformResponse;
    this.followRedirects = options.followRedirects ?? true;
    this.maxRedirects = options.maxRedirects ?? 5;
    this.proxy = options.proxy;
    this.compressionEnabled = options.compress ?? false;

    // Initialize circuit breaker
    this.internalCircuitBreaker = new CircuitBreaker(
      options.circuitBreakerThreshold || 5,
      options.circuitBreakerResetTimeout || 60000,
      options.circuitBreakerSuccessThreshold || 3
    );

    // Create appropriate agent
    const isHttps = this.targetUrl.protocol === 'https:';
    const AgentClass = isHttps ? https.Agent : http.Agent;
    
    const agentOptions: http.AgentOptions | https.AgentOptions = {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: options.maxSockets || 100,
      maxFreeSockets: options.maxFreeSockets || 10,
      timeout: options.requestTimeout || 30000,
    };

    // Add TLS options for HTTPS
    if (isHttps && options.tls) {
      Object.assign(agentOptions, {
        rejectUnauthorized: options.tls.rejectUnauthorized ?? true,
        cert: options.tls.cert,
        key: options.tls.key,
        ca: options.tls.ca,
      });
    }

    this.agent = new AgentClass(agentOptions);
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
    this.connectionState = 'connected';
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
    this.connectionState = 'disconnected';
  }

  /**
   * Send data over HTTP.
   * 
   * @param {unknown} data - Data to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendData(data: unknown): Promise<void> {
    // Check circuit breaker
    if (!this.internalCircuitBreaker.canAttempt()) {
      throw new Error(`Circuit breaker is open for ${this.targetUrl.hostname}`);
    }

    try {
      const body = this.prepareRequestBody(data);
      const headers = await this.buildRequestHeaders(body);
      
      await this.makeHttpRequest(this.method, this.targetUrl, headers, body);
      
      // Record success
      this.internalCircuitBreaker.recordSuccess();
    } catch (error) {
      // Record failure
      this.internalCircuitBreaker.recordFailure();
      throw error;
    }
  }

  /**
   * Prepare request body from data.
   * 
   * @param {unknown} data - Data to convert
   * @returns {string | Buffer} Request body
   * @private
   */
  private prepareRequestBody(data: unknown): string | Buffer {
    if (typeof data === 'string' || Buffer.isBuffer(data)) {
      return data;
    }
    return JSON.stringify(data);
  }

  /**
   * Check connection health.
   * 
   * @returns {Promise<void>} Resolves if healthy
   * @protected
   */
  protected async checkHealth(): Promise<void> {
    // Check circuit breaker state
    if (!this.internalCircuitBreaker.canAttempt()) {
      throw new Error(`Circuit breaker is open for ${this.targetUrl.hostname}`);
    }

    // Make a lightweight health check request
    const healthUrl = new URL(this.targetUrl.toString());
    const healthPath = this.getHealthCheckPath();
    
    if (healthPath) {
      healthUrl.pathname = healthPath;
    }

    try {
      await this.makeHttpRequest('GET', healthUrl, {}, undefined, 0, true);
      this.internalCircuitBreaker.recordSuccess();
    } catch (error) {
      // If health endpoint doesn't exist, try HEAD request to main endpoint
      try {
        await this.makeHttpRequest('HEAD', this.targetUrl, {}, undefined, 0, true);
        this.internalCircuitBreaker.recordSuccess();
      } catch (headError) {
        this.internalCircuitBreaker.recordFailure();
        throw new Error(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Get health check path.
   * 
   * @returns {string | null} Health check path
   * @private
   */
  private getHealthCheckPath(): string | null {
    const path = this.targetUrl.pathname.replace(/\/$/, '');
    // Only append /health if we're not already hitting a specific endpoint
    if (path === '' || path === '/') {
      return '/health';
    }
    return null;
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
    } catch (error) {
      // Only warn, don't fail initialization
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Health check failed for ${this.targetUrl.hostname}: ${errorMessage}`);
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
          try {
            const customHeaders = await this.auth.customAuth();
            Object.assign(headers, customHeaders);
          } catch (error) {
            throw new Error(`Failed to get custom auth headers: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        break;

      default:
        throw new Error(`Unknown auth type: ${(this.auth as { type: string }).type}`);
    }

    this.authHeaders = headers;
    this.lastAuthRefresh = Date.now();
  }

  /**
   * Perform the network request to send logs.
   * 
   * @param {unknown} data - Data to send
   * @param {unknown} [batch] - Optional batch metadata
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async performNetworkRequest(data: unknown, batch?: unknown): Promise<void> {
    // Convert data to LogEntry array if needed
    let entries: LogEntry[];
    if (Array.isArray(data)) {
      entries = data;
    } else if (batch && typeof batch === 'object' && batch !== null && 'entries' in batch) {
      entries = (batch as { entries: LogEntry[] }).entries;
    } else {
      throw new Error('Invalid data format for HTTP transport');
    }

    // Refresh auth if needed
    if (this.auth && Date.now() - this.lastAuthRefresh > this.authRefreshInterval) {
      await this.refreshAuthHeaders();
    }

    // Transform data if transformer provided
    let body: string | Buffer = this.transformRequest 
      ? this.ensureBodyType(await this.transformRequest(entries))
      : this.formatBody(entries);

    // Compress if enabled
    if (this.compressionEnabled && (typeof body === 'string' || Buffer.isBuffer(body))) {
      body = await this.compressBody(body);
    }

    // Build headers
    const headers = await this.buildRequestHeaders(body);

    // Make request
    const response = await this.makeHttpRequest(this.method, this.targetUrl, headers, body);

    // Validate response
    if (response.statusCode && response.statusCode >= 400) {
      const error = new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`) as Error & {
        statusCode?: number;
        response?: typeof response;
      };
      error.statusCode = response.statusCode;
      error.response = response;
      throw error;
    }

    // Transform response if configured
    if (this.transformResponse && response.body) {
      try {
        const parsed = JSON.parse(response.body);
        await this.transformResponse(parsed);
      } catch (error) {
        console.warn(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`);
      }
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
   * Ensure the transformed body is of the correct type.
   * 
   * @param {unknown} body - Body from transform function
   * @returns {string | Buffer} Properly typed body
   * @private
   */
  private ensureBodyType(body: unknown): string | Buffer {
    if (typeof body === 'string') {
      return body;
    }
    if (Buffer.isBuffer(body)) {
      return body;
    }
    // Convert to JSON string if not string or Buffer
    return JSON.stringify(body);
  }

  /**
   * Compress body data.
   * 
   * @param {string | Buffer} body - Body to compress
   * @returns {Promise<Buffer>} Compressed body
   * @private
   */
  private async compressBody(body: string | Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const input = typeof body === 'string' ? Buffer.from(body) : body;
      
      zlib.gzip(input, (error, compressed) => {
        if (error) reject(error);
        else resolve(compressed);
      });
    });
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
      ...this.getDefaultHeaders(),
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': this.getContentType(),
      'Accept': 'application/json',
      'Connection': 'keep-alive',
      'User-Agent': 'MagicLogger-HTTP/1.0',
    };

    // Add compression header if body is compressed
    if (this.compressionEnabled) {
      headers['Content-Encoding'] = 'gzip';
      headers['Accept-Encoding'] = 'gzip, deflate';
    }

    // Add auth headers
    if (this.authHeaders) {
      Object.assign(headers, this.authHeaders);
    }

    // Add custom headers from options
    const customHeaders = this.getCustomHeaders();
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Get default headers.
   * 
   * @returns {Record<string, string>} Default headers
   * @private
   */
  private getDefaultHeaders(): Record<string, string> {
    return this.headers || {};
  }

  /**
   * Get custom headers from options.
   * 
   * @returns {Record<string, string> | undefined} Custom headers
   * @private
   */
  private getCustomHeaders(): Record<string, string> | undefined {
    return (this.options as HTTPTransportOptions).headers;
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
   * Make HTTP/HTTPS request with redirect handling.
   * 
   * @param {string} method - HTTP method
   * @param {URL} url - Request URL
   * @param {Record<string, string>} headers - Request headers
   * @param {string | Buffer} [body] - Request body
   * @param {number} [redirectCount=0] - Current redirect count
   * @param {boolean} [isHealthCheck=false] - Whether this is a health check
   * @returns {Promise<any>} Response
   * @private
   */
  private async makeHttpRequest(
    method: string,
    url: URL,
    headers: Record<string, string>,
    body?: string | Buffer,
    redirectCount = 0,
    isHealthCheck = false
  ): Promise<{
    statusCode?: number;
    statusMessage?: string;
    headers: http.IncomingHttpHeaders;
    body: string;
  }> {
    return new Promise((resolve, reject) => {
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;

      // Configure options
      const options: http.RequestOptions | https.RequestOptions = {
        method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers,
        agent: this.agent,
        timeout: isHealthCheck ? 5000 : this.requestTimeout,
      };

      // Add proxy if configured
      if (this.proxy && !isHealthCheck) {
        this.configureProxy(options, url);
      }

      const req = lib.request(options, (res) => {
        // Handle redirects
        if (this.followRedirects && 
            res.statusCode && 
            res.statusCode >= 300 && 
            res.statusCode < 400 &&
            res.headers.location) {
          
          if (redirectCount >= this.maxRedirects) {
            reject(new Error(`Too many redirects (${redirectCount})`));
            return;
          }

          try {
            const redirectUrl = new URL(res.headers.location, url);
            this.makeHttpRequest(method, redirectUrl, headers, body, redirectCount + 1, isHealthCheck)
              .then(resolve)
              .catch(reject);
            return;
          } catch (error) {
            reject(new Error(`Invalid redirect URL: ${res.headers.location}`));
            return;
          }
        }

        let data = '';
        
        // Handle compression
        let stream: NodeJS.ReadableStream = res;
        const encoding = res.headers['content-encoding'];
        
        if (encoding === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
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

        stream.on('error', (error) => {
          reject(new Error(`Response stream error: ${error.message}`));
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${options.timeout}ms`));
      });

      if (body && method !== 'GET' && method !== 'HEAD') {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Configure proxy settings for request.
   * 
   * @param {http.RequestOptions | https.RequestOptions} options - Request options
   * @param {URL} targetUrl - Target URL
   * @private
   */
  private configureProxy(
    options: http.RequestOptions | https.RequestOptions,
    targetUrl: URL
  ): void {
    if (!this.proxy) return;

    // Use HTTP CONNECT for HTTPS targets through HTTP proxy
    if (targetUrl.protocol === 'https:' && this.proxy.protocol !== 'https:') {
      // This requires a different approach - would need to implement CONNECT method
      // For now, we'll use the simpler approach
      options.hostname = this.proxy.host;
      options.port = this.proxy.port;
      options.path = targetUrl.toString();
    } else {
      options.hostname = this.proxy.host;
      options.port = this.proxy.port;
      options.path = targetUrl.toString();
    }
    
    if (this.proxy.auth) {
      const proxyAuth = Buffer.from(
        `${this.proxy.auth.username}:${this.proxy.auth.password}`
      ).toString('base64');
      options.headers = {
        ...options.headers,
        'Proxy-Authorization': `Basic ${proxyAuth}`,
      };
    }
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
   * @param {number} retryCount - Current retry count
   * @returns {boolean} Whether to retry
   * @protected
   */
  protected shouldRetryError(error: Error, retryCount: number): boolean {
    // Check base conditions first
    if (super.shouldRetryError(error, retryCount)) {
      return true;
    }

    // HTTP specific retry conditions
    const message = error.message.toLowerCase();
    
    // Retry on specific HTTP errors
    if (message.includes('request timeout') ||
        message.includes('socket hang up') ||
        message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('enotfound')) {
      return true;
    }

    // Check for retryable status codes
    const errorWithStatus = error as Error & { statusCode?: number };
    if (errorWithStatus.statusCode) {
      // Retry on server errors and rate limiting
      return errorWithStatus.statusCode >= 500 || 
             errorWithStatus.statusCode === 429 ||
             errorWithStatus.statusCode === 408 ||
             errorWithStatus.statusCode === 503 ||
             errorWithStatus.statusCode === 504;
    }

    return false;
  }

  /**
   * Get circuit breaker state.
   * 
   * @returns {string} Circuit breaker state
   * @public
   */
  public getCircuitBreakerState(): string {
    return this.internalCircuitBreaker.getState();
  }

  /**
   * Reset circuit breaker.
   * 
   * @public
   */
  public resetCircuitBreaker(): void {
    // Reset by creating a new instance
    const httpOptions = this.options as HTTPTransportOptions;
    this.internalCircuitBreaker = new CircuitBreaker(
      httpOptions.circuitBreakerThreshold || 5,
      httpOptions.circuitBreakerResetTimeout || 60000,
      httpOptions.circuitBreakerSuccessThreshold || 3
    );
  }
}

/**
 * Factory function to create an HTTP transport instance.
 * 
 * @param {HTTPTransportOptions} options - Transport configuration options
 * @returns {HTTPTransport} New HTTP transport instance
 * @throws {Error} If required options are missing
 * 
 * @example
 * ```typescript
 * const transport = createHTTPTransport({
 *   url: 'https://logs.example.com',
 *   auth: { type: 'bearer', token: 'abc123' }
 * });
 * ```
 */
export function createHTTPTransport(options: HTTPTransportOptions): HTTPTransport {
  if (!options.url) {
    throw new Error('HTTPTransport requires url option');
  }

  return new HTTPTransport({
    enabled: true,
    ...options,
    name: options.name || 'http',
  });
}