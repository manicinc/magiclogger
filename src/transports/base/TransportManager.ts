// File: src/transports/base/TransportManager.ts

import { EventEmitter } from 'events';
import { Transport } from './Transport';
import type { 
  TransportConfig, 
  LogEntry, 
  TransportType,
  TransportStats 
} from '../../types/transport';

/**
 * Transport factory function type.
 */
type TransportFactory = (config: TransportConfig) => Transport;

/**
 * TransportManager handles all transport operations for the logger.
 * 
 * This version uses a registry pattern to avoid importing all transports,
 * enabling proper tree-shaking. Transports must be registered before use.
 * 
 * @class TransportManager
 * @extends {EventEmitter}
 * 
 * @example
 * ```typescript
 * // Register transports you need
 * import { TransportManager, TransportRegistry } from 'magiclogger/transports/base';
 * import { ConsoleTransport } from 'magiclogger/console';
 * import { FileTransport } from 'magiclogger/file';
 * 
 * // Register factories
 * TransportRegistry.register('console', (config) => new ConsoleTransport(config));
 * TransportRegistry.register('file', (config) => new FileTransport(config));
 * 
 * // Or use the helper to register core transports
 * import { registerCoreTransports } from 'magiclogger/transports/base';
 * await registerCoreTransports();
 * 
 * // Now create manager and add transports
 * const manager = new TransportManager();
 * await manager.addTransport({ type: 'console', level: 'info' });
 * ```
 */
export class TransportManager extends EventEmitter {
  /**
   * Map of active transports.
   * @private
   */
  private transports: Map<string, Transport> = new Map();

  /**
   * Transport factories registry.
   * @private
   */
  private factories: Map<TransportType | string, TransportFactory> = new Map();

  /**
   * External registry reference for dynamic loading
   * @private
   */
  private externalRegistry?: {
    get(type: string): TransportFactory | undefined;
    has(type: string): boolean;
  };

  /**
   * Whether manager is initialized.
   * @private
   */
  private initialized = false;

  /**
   * Whether logging is paused.
   * @private
   */
  private paused = false;

  /**
   * Queue for logs when paused.
   * @private
   */
  private pauseQueue: LogEntry[] = [];

  /**
   * Maximum pause queue size.
   * @private
   */
  private readonly maxPauseQueueSize: number;

  /**
   * Performance tracking data.
   * @private
   */
  private performanceData: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    lastError?: Error;
  }> = new Map();

  /**
   * Global transport filters.
   * @private
   */
  private globalFilters: Array<(entry: LogEntry) => boolean> = [];

  /**
   * Global transport transformers.
   * @private
   */
  private globalTransformers: Array<(entry: LogEntry) => LogEntry> = [];

  /**
   * Health check interval.
   * @private
   */
  private healthCheckInterval?: NodeJS.Timeout;

  /**
   * Health check interval in ms.
   * @private
   */
  private readonly healthCheckIntervalMs: number;

  /**
   * Creates a new TransportManager instance.
   * 
   * @param {object} options - Configuration options
   */
  constructor(options: {
    maxPauseQueueSize?: number;
    healthCheckIntervalMs?: number;
    useExternalRegistry?: boolean;
  } = {}) {
    super();
    
    this.maxPauseQueueSize = options.maxPauseQueueSize || 10000;
    this.healthCheckIntervalMs = options.healthCheckIntervalMs || 60000;
    
    // Use external registry if requested (for tree-shaking)
    if (options.useExternalRegistry !== false) {
      this.setupExternalRegistry();
    }
  }

  /**
   * Set up connection to external TransportRegistry
   * @private
   */
  private setupExternalRegistry(): void {
    // Dynamically access TransportRegistry to avoid circular imports
    try {
      // This will be available if the transport index is imported
      const globalThis_ = globalThis as {
        __MAGICLOGGER_TRANSPORT_REGISTRY__?: {
          get(type: string): TransportFactory | undefined;
          has(type: string): boolean;
        };
      };
      const registry = globalThis_.__MAGICLOGGER_TRANSPORT_REGISTRY__;
      if (registry) {
        this.externalRegistry = registry;
      }
    } catch {
      // Registry not available, use local factories only
    }
  }

  /**
   * Initialize the transport manager.
   * 
   * @returns {Promise<void>} Resolves when initialized
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // Start health monitoring
    this.startHealthMonitoring();

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Register a transport factory.
   * 
   * @param {string} type - Transport type
   * @param {TransportFactory} factory - Factory function
   */
  public registerFactory(type: TransportType | string, factory: TransportFactory): void {
    this.factories.set(type, factory);
    this.emit('factoryRegistered', { type });
  }

  /**
   * Get a factory for a transport type
   * @private
   */
  private getFactory(type: string): TransportFactory | undefined {
    // Check local factories first
    let factory = this.factories.get(type);
    
    // Then check external registry
    if (!factory && this.externalRegistry) {
      factory = this.externalRegistry.get(type);
    }
    
    return factory;
  }

  /**
   * Add a transport to the manager.
   * 
   * @param {TransportConfig} config - Transport configuration
   * @returns {Promise<Transport>} The added transport
   */
  public async addTransport(config: TransportConfig): Promise<Transport> {
    // Get or generate transport name
    const name = config.name || `${config.type}-${Date.now()}`;

    // Check if transport already exists
    if (this.transports.has(name)) {
      throw new Error(`Transport '${name}' already exists`);
    }

    // Get factory
    const factory = this.getFactory(config.type);
    if (!factory) {
      throw new Error(
        `Unknown transport type: ${config.type}. ` +
        `Make sure to register the transport factory or import it first. ` +
        `Example: import { ${config.type}Transport } from 'magiclogger/${config.type}'`
      );
    }

    // Create transport with name
    const transportConfig = { ...config, name };
    const transport = factory(transportConfig);

    // Set up transport event handlers
    this.setupTransportHandlers(transport);

    // Initialize transport
    await transport.init();

    // Add to transports map
    this.transports.set(name, transport);

    // Initialize performance tracking
    this.performanceData.set(name, {
      count: 0,
      totalTime: 0,
      errors: 0,
    });

    this.emit('transportAdded', { name, type: config.type });

    return transport;
  }

  /**
   * Register an already instantiated transport with the manager.
   * 
   * @param {Transport} transport - Transport instance to register
   * @returns {Promise<void>} Resolves when transport is registered
   */
  public async registerTransport(transport: Transport): Promise<void> {
    const name = transport.name;

    if (this.transports.has(name)) {
      throw new Error(`Transport '${name}' already exists`);
    }

    this.setupTransportHandlers(transport);

    if (typeof transport.init === 'function') {
      await transport.init();
    }

    this.transports.set(name, transport);

    this.performanceData.set(name, {
      count: 0,
      totalTime: 0,
      errors: 0,
    });

    this.emit('transportAdded', { name, type: 'custom' });
  }

  /**
   * Remove a transport from the manager.
   * 
   * @param {string} name - Transport name
   * @returns {Promise<void>} Resolves when removed
   */
  public async removeTransport(name: string): Promise<void> {
    const transport = this.transports.get(name);
    if (!transport) {
      throw new Error(`Transport '${name}' not found`);
    }

    // Close transport
    await transport.close();

    // Remove from maps
    this.transports.delete(name);
    this.performanceData.delete(name);

    this.emit('transportRemoved', { name });
  }

  /**
   * Get a transport by name.
   * 
   * @param {string} name - Transport name
   * @returns {Transport | undefined} Transport instance
   */
  public getTransport(name: string): Transport | undefined {
    return this.transports.get(name);
  }

  /**
   * Get all transports.
   * 
   * @returns {Transport[]} Array of transports
   */
  public getTransports(): Transport[] {
    return Array.from(this.transports.values());
  }

  /**
   * Get transport names.
   * 
   * @returns {string[]} Transport names
   */
  public getTransportNames(): string[] {
    return Array.from(this.transports.keys());
  }

  /**
   * Check if a transport exists.
   * 
   * @param {string} name - Transport name
   * @returns {boolean} Whether transport exists
   */
  public hasTransport(name: string): boolean {
    return this.transports.has(name);
  }

  /**
   * Log an entry to all transports.
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {Promise<void>} Resolves when logged
   */
  public async log(entry: LogEntry): Promise<void> {
    // Check if paused
    if (this.paused) {
      this.queueEntry(entry);
      return;
    }

    // Apply global filters
    for (const filter of this.globalFilters) {
      if (!filter(entry)) {
        return; // Skip this entry
      }
    }

    // Apply global transformers
    let transformedEntry = entry;
    for (const transformer of this.globalTransformers) {
      transformedEntry = transformer(transformedEntry);
    }

    // Get enabled transports
    const enabledTransports = Array.from(this.transports.values())
      .filter(transport => transport.isEnabled());

    if (enabledTransports.length === 0) {
      this.emit('noTransports', { entry: transformedEntry });
      return;
    }

    // Log to all transports in parallel
    const promises = enabledTransports.map(transport => 
      this.logToTransport(transport, transformedEntry)
    );

    // Wait for all transports
    const results = await Promise.allSettled(promises);

    // Check for errors
    const errors = results
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      this.emit('logErrors', { errors, entry: transformedEntry });
    }
  }

  /**
   * Log to a specific transport with performance tracking.
   * 
   * @param {Transport} transport - Transport to log to
   * @param {LogEntry} entry - Log entry
   * @returns {Promise<void>} Resolves when logged
   * @private
   */
  private async logToTransport(transport: Transport, entry: LogEntry): Promise<void> {
    const startTime = process.hrtime.bigint();
    const perfData = this.performanceData.get(transport.name);

    try {
      await transport.log(entry);
      
      // Update performance data
      if (perfData) {
        const duration = Number(process.hrtime.bigint() - startTime) / 1000000; // Convert to ms
        perfData.count++;
        perfData.totalTime += duration;
      }
    } catch (error) {
      // Update error count
      if (perfData) {
        perfData.errors++;
        perfData.lastError = error as Error;
      }

      // Re-throw to be handled by caller
      throw error;
    }
  }

  /**
   * Log multiple entries efficiently.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {Promise<void>} Resolves when all logged
   */
  public async logBatch(entries: LogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    // Check if paused
    if (this.paused) {
      entries.forEach(entry => this.queueEntry(entry));
      return;
    }

    // Apply filters and transformers
    const processedEntries = entries
      .filter(entry => this.globalFilters.every(filter => filter(entry)))
      .map(entry => {
        let transformed = entry;
        for (const transformer of this.globalTransformers) {
          transformed = transformer(transformed);
        }
        return transformed;
      });

    if (processedEntries.length === 0) return;

    // Get enabled transports that support batching
    const transports = Array.from(this.transports.values())
      .filter(transport => transport.isEnabled());

    // Group by batching support
    const batchingTransports = transports.filter(t => t.supportsBatching());
    const nonBatchingTransports = transports.filter(t => !t.supportsBatching());

    const promises: Promise<void>[] = [];

    // Send to batching transports
    for (const transport of batchingTransports) {
      if (transport.logBatch) {
        promises.push(transport.logBatch(processedEntries));
      }
    }

    // Send to non-batching transports individually
    for (const transport of nonBatchingTransports) {
      for (const entry of processedEntries) {
        promises.push(this.logToTransport(transport, entry));
      }
    }

    // Wait for all
    await Promise.allSettled(promises);
  }

  /**
   * Set up event handlers for a transport.
   * 
   * @param {Transport} transport - Transport to set up
   * @private
   */
  private setupTransportHandlers(transport: Transport): void {
    transport.on('error', (...args: unknown[]) => {
      const error = args[0] as Error;
      const entry = args[1] as LogEntry | undefined;
      this.emit('transportError', {
        transport: transport.name,
        error,
        entry,
      });
    });

    transport.on('ready', () => {
      this.emit('transportReady', {
        transport: transport.name,
      });
    });

    transport.on('closed', () => {
      this.emit('transportClosed', {
        transport: transport.name,
      });
    });
  }

  /**
   * Pause all logging.
   */
  public pause(): void {
    this.paused = true;
    this.emit('paused');
  }

  /**
   * Resume logging and flush queue.
   * 
   * @returns {Promise<void>} Resolves when queue is flushed
   */
  public async resume(): Promise<void> {
    this.paused = false;

    // Flush queued entries
    const queue = [...this.pauseQueue];
    this.pauseQueue = [];

    for (const entry of queue) {
      await this.log(entry);
    }

    this.emit('resumed', { flushedCount: queue.length });
  }

  /**
   * Queue an entry when paused.
   * 
   * @param {LogEntry} entry - Entry to queue
   * @private
   */
  private queueEntry(entry: LogEntry): void {
    if (this.pauseQueue.length >= this.maxPauseQueueSize) {
      // Drop oldest entry
      this.pauseQueue.shift();
      this.emit('queueOverflow');
    }

    this.pauseQueue.push(entry);
  }

  /**
   * Add a global filter.
   * 
   * @param {Function} filter - Filter function
   */
  public addGlobalFilter(filter: (entry: LogEntry) => boolean): void {
    this.globalFilters.push(filter);
  }

  /**
   * Remove a global filter.
   * 
   * @param {Function} filter - Filter function
   */
  public removeGlobalFilter(filter: (entry: LogEntry) => boolean): void {
    const index = this.globalFilters.indexOf(filter);
    if (index !== -1) {
      this.globalFilters.splice(index, 1);
    }
  }

  /**
   * Add a global transformer.
   * 
   * @param {Function} transformer - Transformer function
   */
  public addGlobalTransformer(transformer: (entry: LogEntry) => LogEntry): void {
    this.globalTransformers.push(transformer);
  }

  /**
   * Remove a global transformer.
   * 
   * @param {Function} transformer - Transformer function
   */
  public removeGlobalTransformer(transformer: (entry: LogEntry) => LogEntry): void {
    const index = this.globalTransformers.indexOf(transformer);
    if (index !== -1) {
      this.globalTransformers.splice(index, 1);
    }
  }

  /**
   * Clear all global filters and transformers.
   */
  public clearGlobalProcessors(): void {
    this.globalFilters = [];
    this.globalTransformers = [];
  }

  /**
   * Flush all transports.
   * 
   * @returns {Promise<void>} Resolves when all flushed
   */
  public async flush(): Promise<void> {
    const promises = Array.from(this.transports.values())
      .filter(transport => typeof transport.flush === 'function')
      .map(transport => transport.flush?.());

    await Promise.allSettled(promises.filter(p => p !== undefined));
  }

  /**
   * Close all transports and clean up.
   * 
   * @returns {Promise<void>} Resolves when closed
   */
  public async close(): Promise<void> {
    // Stop health monitoring
    this.stopHealthMonitoring();

    // Close all transports
    const promises = Array.from(this.transports.values())
      .map(transport => transport.close());

    await Promise.allSettled(promises);

    // Clear maps
    this.transports.clear();
    this.performanceData.clear();

    this.initialized = false;
    this.emit('closed');
  }

  /**
   * Get statistics for all transports.
   * 
   * @returns {Record<string, TransportStats>} Transport statistics
   */
  public getStats(): Record<string, TransportStats & { performance: {
    count: number;
    avgTime: number;
    totalTime: number;
    errors: number;
    lastError?: string;
  } | null }> {
    const stats: Record<string, TransportStats & { performance: {
      count: number;
      avgTime: number;
      totalTime: number;
      errors: number;
      lastError?: string;
    } | null }> = {};

    for (const [name, transport] of this.transports) {
      const perfData = this.performanceData.get(name);
      const transportStats = transport.getStats();

      stats[name] = {
        ...transportStats,
        performance: perfData ? {
          count: perfData.count,
          avgTime: perfData.count > 0 ? perfData.totalTime / perfData.count : 0,
          totalTime: perfData.totalTime,
          errors: perfData.errors,
          lastError: perfData.lastError?.message,
        } : null,
      };
    }

    return stats;
  }

  /**
   * Reset statistics for all transports.
   */
  public resetStats(): void {
    // Reset transport stats
    for (const transport of this.transports.values()) {
      transport.resetStats();
    }

    // Reset performance data
    for (const data of this.performanceData.values()) {
      data.count = 0;
      data.totalTime = 0;
      data.errors = 0;
      data.lastError = undefined;
    }
  }

  /**
   * Enable a transport.
   * 
   * @param {string} name - Transport name
   */
  public enableTransport(name: string): void {
    const transport = this.transports.get(name);
    if (transport) {
      transport.enable();
    }
  }

  /**
   * Disable a transport.
   * 
   * @param {string} name - Transport name
   */
  public disableTransport(name: string): void {
    const transport = this.transports.get(name);
    if (transport) {
      transport.disable();
    }
  }

  /**
   * Check health of all transports.
   * 
   * @returns {Promise<Record<string, boolean>>} Health status
   */
  public async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [name, transport] of this.transports) {
      try {
        health[name] = await transport.isHealthy();
      } catch {
        health[name] = false;
      }
    }

    return health;
  }

  /**
   * Start health monitoring.
   * @private
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.checkHealth();
      
      // Check for unhealthy transports
      const unhealthy = Object.entries(health)
        .filter(([_, isHealthy]) => !isHealthy)
        .map(([name]) => name);

      if (unhealthy.length > 0) {
        this.emit('unhealthyTransports', { transports: unhealthy });
      }
    }, this.healthCheckIntervalMs);
  }

  /**
   * Stop health monitoring.
   * @private
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Create a child manager with shared transports.
   * 
   * @param {object} options - Child options
   * @returns {TransportManager} Child manager
   */
  public child(options: {
    filters?: Array<(entry: LogEntry) => boolean>;
    transformers?: Array<(entry: LogEntry) => LogEntry>;
  } = {}): TransportManager {
    const child = new TransportManager({
      maxPauseQueueSize: this.maxPauseQueueSize,
      healthCheckIntervalMs: this.healthCheckIntervalMs,
      useExternalRegistry: false // Child uses parent's transports
    });

    // Share transports
    for (const [name, transport] of this.transports) {
      child.transports.set(name, transport);
    }

    // Copy factories
    for (const [type, factory] of this.factories) {
      child.factories.set(type, factory);
    }

    // Add filters and transformers
    if (options.filters) {
      options.filters.forEach(filter => child.addGlobalFilter(filter));
    }

    if (options.transformers) {
      options.transformers.forEach(transformer => child.addGlobalTransformer(transformer));
    }

    child.initialized = true;

    return child;
  }
}