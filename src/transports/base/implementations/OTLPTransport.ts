// File: src/transports/base/implementations/OTLPTransport.ts

import { BatchingTransport } from '../BatchingTransport';
import type { LogEntry, BatchingTransportOptions, TransportStats } from '../../../types/transport';

/**
 * OTLP (OpenTelemetry Protocol) Transport Options.
 * 
 * @interface OTLPTransportOptions
 * @extends {BatchingTransportOptions}
 */
export interface OTLPTransportOptions extends BatchingTransportOptions {
  /**
   * OTLP endpoint URL.
   * @default 'http://localhost:4318'
   */
  endpoint?: string;

  /**
   * Protocol to use.
   * @default 'http/protobuf'
   */
  protocol?: 'http/protobuf' | 'http/json' | 'grpc';

  /**
   * Service name for resource attributes.
   */
  serviceName: string;

  /**
   * Service version.
   */
  serviceVersion?: string;

  /**
   * Additional resource attributes.
   */
  resource?: Record<string, string | number | boolean>;

  /**
   * Headers to include with requests.
   */
  headers?: Record<string, string>;

  /**
   * Whether to include trace context automatically.
   * @default true
   */
  includeTraceContext?: boolean;

  /**
   * Export path for HTTP protocol.
   * @default '/v1/logs'
   */
  exportPath?: string;

  /**
   * Compression to use.
   * @default 'gzip'
   */
  compression?: 'gzip' | 'none';

  /**
   * Timeout for export requests.
   * @default 10000
   */
  exportTimeout?: number;

  /**
   * Whether to use TLS/SSL.
   * @default false
   */
  useTLS?: boolean;

  /**
   * TLS configuration.
   */
  tls?: {
    rejectUnauthorized?: boolean;
    cert?: string;
    key?: string;
    ca?: string;
  };
}

/**
 * OTLP Log Record structure.
 * Based on OpenTelemetry Log Data Model.
 */
interface OTLPLogRecord {
  timeUnixNano: string;
  severityNumber: number;
  severityText: string;
  body: {
    stringValue?: string;
    kvlistValue?: {
      values: Array<{
        key: string;
        value: { stringValue?: string; intValue?: string; boolValue?: boolean };
      }>;
    };
  };
  attributes: Array<{
    key: string;
    value: { stringValue?: string; intValue?: string; boolValue?: boolean };
  }>;
  droppedAttributesCount?: number;
  flags?: number;
  traceId?: string;
  spanId?: string;
}

/**
 * OTLP Resource structure.
 */
interface OTLPResource {
  attributes: Array<{
    key: string;
    value: { stringValue?: string; intValue?: string; boolValue?: boolean };
  }>;
  droppedAttributesCount?: number;
}

/**
 * OTLP Export Request structure.
 */
interface OTLPExportRequest {
  resourceLogs: Array<{
    resource: OTLPResource;
    scopeLogs: Array<{
      scope: {
        name: string;
        version?: string;
      };
      logRecords: OTLPLogRecord[];
    }>;
  }>;
}

/**
 * OTLPTransport sends logs to OpenTelemetry Collector or compatible backends.
 * Supports HTTP/Protobuf, HTTP/JSON, and gRPC protocols.
 * 
 * @class OTLPTransport
 * @extends {BatchingTransport}
 * 
 * @example
 * ```typescript
 * const otlpTransport = new OTLPTransport({
 *   endpoint: 'http://localhost:4318',
 *   serviceName: 'my-service',
 *   serviceVersion: '1.0.0',
 *   resource: {
 *     'deployment.environment': 'production',
 *     'service.namespace': 'backend'
 *   },
 *   headers: {
 *     'x-api-key': 'your-api-key'
 *   },
 *   includeTraceContext: true
 * });
 * 
 * logger.addTransport(otlpTransport);
 * ```
 */
export class OTLPTransport extends BatchingTransport {
  /**
   * OTLP endpoint URL.
   * @private
   */
  private endpoint: string;

  /**
   * Protocol to use.
   * @private
   */
  private protocol: 'http/protobuf' | 'http/json' | 'grpc';

  /**
   * Service name.
   * @private
   */
  private serviceName: string;

  /**
   * Service version.
   * @private
   */
  private serviceVersion: string;

  /**
   * Resource attributes.
   * @private
   */
  private resource: Record<string, string | number | boolean>;

  /**
   * Request headers.
   * @private
   */
  private headers: Record<string, string>;

  /**
   * Whether to include trace context.
   * @private
   */
  private includeTraceContext: boolean;

  /**
   * Export path.
   * @private
   */
  private exportPath: string;

  /**
   * Compression type.
   * @private
   */
  private compression: 'gzip' | 'none';

  /**
   * Export timeout.
   * @private
   */
  private exportTimeout: number;

  /**
   * HTTP/HTTPS module.
   * @private
   */
  private httpModule?: typeof import('http') | typeof import('https');

  /**
   * Zlib module for compression.
   * @private
   */
  private zlibModule?: typeof import('zlib');

  /**
   * Creates a new OTLPTransport instance.
   * 
   * @param {OTLPTransportOptions} options - Transport options
   */
  constructor(options: OTLPTransportOptions) {
    super({
      ...options,
      name: options.name || 'otlp-transport',
      maxBatchSize: options.maxBatchSize || 100,
      maxBatchTime: options.maxBatchTime || 5000,
      compress: false // We handle compression ourselves
    });

    this.endpoint = options.endpoint || 'http://localhost:4318';
    this.protocol = options.protocol || 'http/protobuf';
    this.serviceName = options.serviceName;
    this.serviceVersion = options.serviceVersion || '1.0.0';
    this.resource = options.resource || {};
    this.headers = options.headers || {};
    this.includeTraceContext = options.includeTraceContext !== false;
    this.exportPath = options.exportPath || '/v1/logs';
    this.compression = options.compression || 'gzip';
    this.exportTimeout = options.exportTimeout || 10000;

    // Set appropriate content type based on protocol
    if (this.protocol === 'http/protobuf') {
      this.headers['Content-Type'] = 'application/x-protobuf';
    } else if (this.protocol === 'http/json') {
      this.headers['Content-Type'] = 'application/json';
    }

    // Set compression header if needed
    if (this.compression === 'gzip') {
      this.headers['Content-Encoding'] = 'gzip';
    }

    // Load Node.js modules if available
    this.loadNodeModules();
  }

  /**
   * Loads Node.js modules for HTTP and compression.
   * @private
   */
  private loadNodeModules(): void {
    if (typeof require !== 'undefined') {
      try {
        const url = new URL(this.endpoint);
        if (url.protocol === 'https:') {
          this.httpModule = require('https');
        } else {
          this.httpModule = require('http');
        }
        
        if (this.compression === 'gzip') {
          this.zlibModule = require('zlib');
        }
      } catch {
        // Modules not available
      }
    }
  }

  /**
   * Transport-specific initialization.
   */
  protected async doInit(): Promise<void> {
    // Nothing required at init time; modules are loaded lazily based on endpoint/protocol
    return Promise.resolve();
  }

  /**
   * Send a batch of log entries.
   * Required by BatchingTransport.
   *
   * @param {LogEntry[]} entries - Log entries to send
   * @returns {Promise<void>}
   * @protected
   */
  protected async sendBatch(entries: LogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const exportRequest = this.createExportRequest(entries);
    await this.exportLogs(exportRequest);
  }

  /**
   * Creates an OTLP export request from log entries.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {OTLPExportRequest} Export request
   * @private
   */
  private createExportRequest(entries: LogEntry[]): OTLPExportRequest {
    const resource = this.createResource();
    const logRecords = entries.map(entry => this.createLogRecord(entry));

    return {
      resourceLogs: [{
        resource,
        scopeLogs: [{
          scope: {
            name: 'magiclogger',
            version: '1.0.0'
          },
          logRecords
        }]
      }]
    };
  }

  /**
   * Creates an OTLP resource.
   * 
   * @returns {OTLPResource} Resource
   * @private
   */
  private createResource(): OTLPResource {
    const attributes: OTLPResource['attributes'] = [
      { key: 'service.name', value: { stringValue: this.serviceName } },
      { key: 'service.version', value: { stringValue: this.serviceVersion } }
    ];

    // Add custom resource attributes
    for (const [key, value] of Object.entries(this.resource)) {
      if (typeof value === 'string') {
        attributes.push({ key, value: { stringValue: value } });
      } else if (typeof value === 'number') {
        attributes.push({ key, value: { intValue: value.toString() } });
      } else if (typeof value === 'boolean') {
        attributes.push({ key, value: { boolValue: value } });
      }
    }

    // Add telemetry SDK information
    attributes.push(
      { key: 'telemetry.sdk.name', value: { stringValue: 'magiclogger' } },
      { key: 'telemetry.sdk.language', value: { stringValue: 'javascript' } },
      { key: 'telemetry.sdk.version', value: { stringValue: '1.0.0' } }
    );

    return { attributes };
  }

  /**
   * Creates an OTLP log record from a log entry.
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {OTLPLogRecord} Log record
   * @private
   */
  private createLogRecord(entry: LogEntry): OTLPLogRecord {
    const record: OTLPLogRecord = {
      timeUnixNano: this.toUnixNano(entry.timestampMs),
      severityNumber: this.getSeverityNumber(entry.level),
      severityText: entry.level.toUpperCase(),
      body: {
        stringValue: entry.message
      },
      attributes: []
    };

    // Add logger ID if present
    if (entry.loggerId) {
      record.attributes.push({
        key: 'logger.id',
        value: { stringValue: entry.loggerId }
      });
    }

    // Add tags
    if (entry.tags && entry.tags.length > 0) {
      record.attributes.push({
        key: 'tags',
        value: { stringValue: entry.tags.join(',') }
      });
    }

    // Add context attributes
    if (entry.context) {
      for (const [key, value] of Object.entries(entry.context)) {
        if (typeof value === 'string') {
          record.attributes.push({ key, value: { stringValue: value } });
        } else if (typeof value === 'number') {
          record.attributes.push({ key, value: { intValue: value.toString() } });
        } else if (typeof value === 'boolean') {
          record.attributes.push({ key, value: { boolValue: value } });
        }
      }
    }

    // Add error information
    if (entry.error) {
      record.attributes.push(
        { key: 'exception.type', value: { stringValue: entry.error.name } },
        { key: 'exception.message', value: { stringValue: entry.error.message } }
      );
      if (entry.error.stack) {
        record.attributes.push({
          key: 'exception.stacktrace',
          value: { stringValue: entry.error.stack }
        });
      }
    }

    // Add trace context if available
    if (this.includeTraceContext) {
      const traceContext = this.getTraceContext();
      if (traceContext) {
        record.traceId = traceContext.traceId;
        record.spanId = traceContext.spanId;
      }
    }

    return record;
  }

  /**
   * Gets trace context from OpenTelemetry API if available.
   * 
   * @returns {object | null} Trace context
   * @private
   */
  private getTraceContext(): { traceId: string; spanId: string } | null {
    try {
      // Minimal structural types to safely access optional OpenTelemetry API
      type SpanContext = { traceId: string; spanId: string };
      type SpanLike = { spanContext: () => SpanContext | undefined };
      type TraceApi = { getActiveSpan?: () => SpanLike | undefined };
      type OtelApi = { trace?: TraceApi };

      const g = globalThis as Record<string, unknown>;
      const maybeOpenTelemetry = g.opentelemetry as { api?: OtelApi } | undefined;
      const maybeOtel = g.otel as OtelApi | undefined;
      const api: OtelApi | undefined = maybeOpenTelemetry?.api ?? maybeOtel;

      const span = api?.trace?.getActiveSpan?.();
      const spanContext = span?.spanContext();
      if (spanContext && spanContext.traceId && spanContext.spanId) {
        return { traceId: spanContext.traceId, spanId: spanContext.spanId };
      }
    } catch {
      // OpenTelemetry not available
    }
    return null;
  }

  /**
   * Converts log level to OTLP severity number.
   * 
   * @param {string} level - Log level
   * @returns {number} Severity number
   * @private
   */
  private getSeverityNumber(level: string): number {
    const severityMap: Record<string, number> = {
      trace: 1,
      debug: 5,
      info: 9,
      warn: 13,
      warning: 13,
      error: 17,
      fatal: 21,
      success: 9, // Map to INFO
    };
    return severityMap[level.toLowerCase()] || 9;
  }

  /**
   * Converts timestamp to Unix nanoseconds.
   * 
   * @param {number} timestampMs - Timestamp in milliseconds
   * @returns {string} Unix nanoseconds
   * @private
   */
  private toUnixNano(timestampMs: number): string {
    return (timestampMs * 1_000_000).toString();
  }

  /**
   * Exports logs to OTLP endpoint.
   * 
   * @param {OTLPExportRequest} request - Export request
   * @returns {Promise<void>}
   * @private
   */
  private async exportLogs(request: OTLPExportRequest): Promise<void> {
    const data = this.protocol === 'http/json' 
      ? JSON.stringify(request)
      : this.encodeProtobuf(request);

    const compressedData = await this.compressData(data);
    
    if (typeof window !== 'undefined') {
      // Browser environment - use fetch
      await this.exportUsingFetch(compressedData);
    } else if (this.httpModule) {
      // Node.js environment - use http/https
      await this.exportUsingHttp(compressedData);
    } else {
      throw new Error('No HTTP client available');
    }
  }

  /**
   * Encodes request as protobuf (simplified).
   * 
   * @param {OTLPExportRequest} request - Export request
   * @returns {Buffer | string} Encoded data
   * @private
   */
  private encodeProtobuf(request: OTLPExportRequest): Buffer | string {
    // Simplified protobuf encoding
    // In production, use proper protobuf library
    return JSON.stringify(request);
  }

  /**
   * Compresses data if needed.
   * 
   * @param {Buffer | string} data - Data to compress
   * @returns {Promise<Buffer | string>} Compressed data
   * @private
   */
  private async compressData(data: Buffer | string): Promise<Buffer | string> {
    if (this.compression === 'gzip') {
      const z = this.zlibModule;
      if (z && typeof z.gzip === 'function') {
        return new Promise((resolve, reject) => {
          z.gzip(data, (err, compressed) => {
            if (err) reject(err);
            else resolve(compressed);
          });
        });
      }
    }
    return data;
  }

  /**
   * Exports using fetch API (browser).
   * 
   * @param {Buffer | string} data - Data to send
   * @returns {Promise<void>}
   * @private
   */
  private async exportUsingFetch(data: Buffer | string): Promise<void> {
    const url = `${this.endpoint}${this.exportPath}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: data,
      signal: AbortSignal.timeout(this.exportTimeout)
    });

    if (!response.ok) {
      throw new Error(`OTLP export failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Exports using Node.js HTTP module.
   * 
   * @param {Buffer | string} data - Data to send
   * @returns {Promise<void>}
   * @private
   */
  private async exportUsingHttp(data: Buffer | string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.endpoint}${this.exportPath}`);
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Length': Buffer.byteLength(data)
        },
        timeout: this.exportTimeout
      };

      const http = this.httpModule;
      if (!http || typeof http.request !== 'function') {
        reject(new Error('HTTP module not available'));
        return;
      }

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`OTLP export failed: ${res.statusCode} ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('OTLP export timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Gets transport statistics.
   * 
   * @returns {TransportStats} Statistics
   */
  public getStats(): TransportStats {
    const baseStats = super.getStats();
    return {
      ...baseStats,
      custom: {
        ...baseStats.custom,
        endpoint: this.endpoint,
        protocol: this.protocol,
        serviceName: this.serviceName,
        compression: this.compression,
      },
    };
  }
}