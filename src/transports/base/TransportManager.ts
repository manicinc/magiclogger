// File: src/transports/base/TransportManager.ts

import { EventEmitter } from 'events';
import type {
  Transport,
  TransportManagerOptions,
  LogEntry,
  AggregationStats,
  LogLevel,
} from '../../types/transport';

/**
 * Internal structure for tracking transport metadata.
 */
interface TransportMeta {
  transport: Transport;
  addedAt: Date;
  enabled: boolean;
  priority: number;
}

/**
 * Manages multiple transport instances and coordinates log distribution.
 * 
 * The TransportManager is the central orchestrator for MagicLogger's transport system:
 * - Manages lifecycle of multiple transports
 * - Routes logs to appropriate transports based on configuration
 * - Handles transport failures and fallbacks
 * - Provides aggregation and statistics across all transports
 * - Ensures proper cleanup and resource management
 * 
 * This class enables sophisticated logging strategies like:
 * - Sending errors to different destinations than info logs
 * - Load balancing across multiple endpoints
 * - Automatic failover when transports fail
 * - Centralized monitoring and statistics
 * 
 * @extends {EventEmitter}
 * 
 * @example
 * ```typescript
 * const manager = new TransportManager({
 *   enableAggregation: true,
 *   aggregation: {
 *     interval: 60000,
 *     targets: ['monitoring-transport']
 *   }
 * });
 * 
 * manager.add(s3Transport);
 * manager.add(httpTransport);
 * manager.add(consoleTransport);
 * 
 * await manager.log(logEntry);
 * ```
 */
export class TransportManager extends EventEmitter {
  /**
   * Map of transport name to metadata.
   * @private
   */
  private transports: Map<string, TransportMeta> = new Map();

  /**
   * Configuration options for the manager.
   * @private
   */
  private readonly options: TransportManagerOptions;

  /**
   * Default timeout for transport operations.
   * @private
   */
  private readonly defaultTimeout: number;

  /**
   * Whether to stop on first successful transport.
   * @private
   */
  private readonly stopOnSuccess: boolean;

  /**
   * Global error handler for all transports.
   * @private
   */
  private readonly errorHandler?: (error: Error, transport: Transport, entry?: LogEntry) => void;

  /**
   * Aggregation configuration.
   * @private
   */
  private readonly aggregationEnabled: boolean;
  private readonly aggregationInterval: number;
  private readonly aggregationTargets: string[];
  private readonly aggregationFields: Array<'level' | 'tags' | 'loggerId' | 'custom'>;

  /**
   * Aggregation state.
   * @private
   */
  private aggregationStats: AggregationStats | null = null;
  private aggregationTimer: NodeJS.Timeout | null = null;
  private aggregationStartTime: Date = new Date();

  /**
   * Log entry buffer for aggregation.
   * @private
   */
  private logBuffer: LogEntry[] = [];

  /**
   * Flag to track if manager is closing.
   * @private
   */
  private closing = false;

  /**
   * Creates a new TransportManager instance.
   * 
   * @param {TransportManagerOptions} [options={}] - Configuration options
   */
  constructor(options: TransportManagerOptions = {}) {
    super();

    this.options = options;
    this.defaultTimeout = options.defaultTimeout || 30000;
    this.stopOnSuccess = options.stopOnSuccess || false;
    this.errorHandler = options.errorHandler;

    // Aggregation configuration
    this.aggregationEnabled = options.enableAggregation || false;
    this.aggregationInterval = options.aggregation?.interval || 60000;
    this.aggregationTargets = options.aggregation?.targets || [];
    this.aggregationFields = options.aggregation?.fields || ['level', 'tags', 'loggerId'];

    // Initialize aggregation if enabled
    if (this.aggregationEnabled) {
      this.initializeAggregation();
    }

    // Set max listeners
    this.setMaxListeners(50);
  }

  /**
   * Add a transport to the manager.
   * 
   * @param {Transport} transport - The transport to add
   * @param {number} [priority=0] - Priority for transport ordering (higher = first)
   * @returns {Promise<void>} Resolves when transport is added and initialized
   * @throws {Error} If transport with same name already exists
   */
  public async add(transport: Transport, priority = 0): Promise<void> {
    if (this.closing) {
      throw new Error('Cannot add transport: manager is closing');
    }

    if (this.transports.has(transport.name)) {
      throw new Error(`Transport '${transport.name}' already exists`);
    }

    // Initialize transport if needed
    if (transport.init) {
      await transport.init();
    }

    // Set up error handling
    if (transport.on) {
      transport.on('error', (...args: unknown[]) => {
        const error = args[0] as Error;
        const entry = args[1] as LogEntry | undefined;
        this.handleTransportError(transport, error, entry);
      });
    }

    // Store transport metadata
    const meta: TransportMeta = {
      transport,
      addedAt: new Date(),
      enabled: transport.enabled,
      priority,
    };

    this.transports.set(transport.name, meta);

    // Sort transports by priority
    this.sortTransports();

    this.emit('transportAdded', transport.name);
  }

  /**
   * Remove a transport from the manager.
   * 
   * @param {string} name - Name of the transport to remove
   * @returns {Promise<void>} Resolves when transport is removed and closed
   * @throws {Error} If transport not found
   */
  public async remove(name: string): Promise<void> {
    const meta = this.transports.get(name);
    if (!meta) {
      throw new Error(`Transport '${name}' not found`);
    }

    // Close the transport
    await meta.transport.close();

    // Remove from map
    this.transports.delete(name);

    this.emit('transportRemoved', name);
  }

  /**
   * Get a transport by name.
   * 
   * @param {string} name - Name of the transport
   * @returns {Transport | undefined} The transport if found
   */
  public get(name: string): Transport | undefined {
    return this.transports.get(name)?.transport;
  }

  /**
   * Get all transport names.
   * 
   * @returns {string[]} Array of transport names
   */
  public list(): string[] {
    return Array.from(this.transports.keys());
  }

  /**
   * Enable or disable a transport.
   * 
   * @param {string} name - Name of the transport
   * @param {boolean} enabled - Whether to enable or disable
   * @throws {Error} If transport not found
   */
  public setEnabled(name: string, enabled: boolean): void {
    const meta = this.transports.get(name);
    if (!meta) {
      throw new Error(`Transport '${name}' not found`);
    }

    meta.enabled = enabled;
    meta.transport.enabled = enabled;

    this.emit('transportToggled', name, enabled);
  }

  /**
   * Log an entry to all applicable transports.
   * 
   * @param {LogEntry} entry - The log entry to send
   * @returns {Promise<void>} Resolves when logging is complete
   */
  public async log(entry: LogEntry): Promise<void> {
    if (this.closing) {
      return;
    }

    // Add to aggregation buffer if enabled
    if (this.aggregationEnabled) {
      this.addToAggregation(entry);
    }

    // Get enabled transports sorted by priority
    const activeTransports = this.getActiveTransports();

    if (activeTransports.length === 0) {
      this.emit('noTransports', entry);
      return;
    }

    // Log to transports based on configuration
    if (this.stopOnSuccess) {
      await this.logWithFailover(entry, activeTransports);
    } else {
      await this.logToAll(entry, activeTransports);
    }
  }

  /**
   * Log to transports with failover (stop on first success).
   * 
   * @param {LogEntry} entry - The log entry
   * @param {TransportMeta[]} transports - Ordered list of transports
   * @returns {Promise<void>} Resolves when logged or all transports fail
   * @private
   */
  private async logWithFailover(entry: LogEntry, transports: TransportMeta[]): Promise<void> {
    const errors: Array<{ transport: string; error: Error }> = [];

    for (const meta of transports) {
      try {
        // Check if transport should handle this log
        if (!meta.transport.shouldLog(entry)) {
          continue;
        }

        // Attempt to log
        await this.withTimeout(
          Promise.resolve(meta.transport.log(entry)),
          this.defaultTimeout
        );

        // Success - stop here
        this.emit('logged', entry, meta.transport.name);
        return;
      } catch (error) {
        errors.push({
          transport: meta.transport.name,
          error: error as Error,
        });
      }
    }

    // All transports failed
    if (errors.length > 0) {
      this.emit('allTransportsFailed', entry, errors);
    }
  }

  /**
   * Log to all applicable transports in parallel.
   * 
   * @param {LogEntry} entry - The log entry
   * @param {TransportMeta[]} transports - List of transports
   * @returns {Promise<void>} Resolves when all transports have been attempted
   * @private
   */
  private async logToAll(entry: LogEntry, transports: TransportMeta[]): Promise<void> {
    // Filter transports that should handle this log
    const applicableTransports = transports.filter(
      meta => meta.transport.shouldLog(entry)
    );

    if (applicableTransports.length === 0) {
      return;
    }

    // Log to all transports in parallel
    const results = await Promise.allSettled(
      applicableTransports.map(meta =>
        this.withTimeout(
          Promise.resolve(meta.transport.log(entry)),
          this.defaultTimeout
        ).then(() => meta.transport.name)
      )
    );

    // Track successes and failures
    const successes: string[] = [];
    const failures: Array<{ transport: string; error: Error }> = [];

    results.forEach((result, index) => {
      const transportName = applicableTransports[index].transport.name;
      
      if (result.status === 'fulfilled') {
        successes.push(transportName);
      } else {
        failures.push({
          transport: transportName,
          error: result.reason,
        });
      }
    });

    // Emit events
    if (successes.length > 0) {
      this.emit('logged', entry, successes);
    }

    if (failures.length > 0) {
      this.emit('partialFailure', entry, successes, failures);
    }
  }

  /**
   * Get active (enabled) transports sorted by priority.
   * 
   * @returns {TransportMeta[]} Sorted list of active transports
   * @private
   */
  private getActiveTransports(): TransportMeta[] {
    return Array.from(this.transports.values())
      .filter(meta => meta.enabled && meta.transport.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Sort transports by priority.
   * 
   * @private
   */
  private sortTransports(): void {
    // Convert to array, sort, and rebuild map
    const sorted = Array.from(this.transports.entries())
      .sort((a, b) => b[1].priority - a[1].priority);

    this.transports.clear();
    sorted.forEach(([name, meta]) => {
      this.transports.set(name, meta);
    });
  }

  /**
   * Handle errors from individual transports.
   * 
   * @param {Transport} transport - The transport that errored
   * @param {Error} error - The error that occurred
   * @param {LogEntry} [entry] - The log entry that caused the error
   * @private
   */
  private handleTransportError(transport: Transport, error: Error, entry?: LogEntry): void {
    // Call global error handler if configured
    if (this.errorHandler) {
      try {
        this.errorHandler(error, transport, entry);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }

    // Emit error event
    this.emit('transportError', transport.name, error, entry);
  }

  /**
   * Initialize aggregation system.
   * 
   * @private
   */
  private initializeAggregation(): void {
    this.resetAggregationStats();
    this.startAggregationTimer();
  }

  /**
   * Reset aggregation statistics.
   * 
   * @private
   */
  private resetAggregationStats(): void {
    this.aggregationStats = {
      period: {
        start: this.aggregationStartTime,
        end: new Date(),
      },
      total: 0,
      byLevel: {} as Record<LogLevel, number>,
      byLogger: {},
      byTags: {},
      errorRate: 0,
      avgSize: 0,
      custom: {},
    };
  }

  /**
   * Start the aggregation timer.
   * 
   * @private
   */
  private startAggregationTimer(): void {
    this.aggregationTimer = setInterval(() => {
      this.flushAggregation();
    }, this.aggregationInterval);
  }

  /**
   * Add a log entry to aggregation statistics.
   * 
   * @param {LogEntry} entry - The log entry to aggregate
   * @private
   */
  private addToAggregation(entry: LogEntry): void {
    if (!this.aggregationStats) {
      return;
    }

    // Update total count
    this.aggregationStats.total++;

    // Update level counts
    this.aggregationStats.byLevel[entry.level] = 
      (this.aggregationStats.byLevel[entry.level] || 0) + 1;

    // Update logger counts if tracking
    if (this.aggregationFields.includes('loggerId') && entry.loggerId) {
      this.aggregationStats.byLogger![entry.loggerId] = 
        (this.aggregationStats.byLogger![entry.loggerId] || 0) + 1;
    }

    // Update tag counts if tracking
    if (this.aggregationFields.includes('tags') && entry.tags) {
      entry.tags.forEach(tag => {
        this.aggregationStats!.byTags![tag] = 
          (this.aggregationStats!.byTags![tag] || 0) + 1;
      });
    }

    // Update error rate
    if (entry.level === 'error') {
      this.aggregationStats.errorRate = 
        this.aggregationStats.byLevel.error / this.aggregationStats.total;
    }

    // Store entry for potential batch operations
    this.logBuffer.push(entry);

    // Limit buffer size to prevent memory issues
    if (this.logBuffer.length > 10000) {
      this.logBuffer = this.logBuffer.slice(-5000);
    }
  }

  /**
   * Flush aggregation statistics to target transports.
   * 
   * @private
   */
  private async flushAggregation(): Promise<void> {
    if (!this.aggregationStats || this.aggregationStats.total === 0) {
      return;
    }

    // Finalize stats
    this.aggregationStats.period.end = new Date();

    // Calculate average size if we have entries
    if (this.logBuffer.length > 0) {
      const totalSize = this.logBuffer.reduce(
        (sum, entry) => sum + JSON.stringify(entry).length,
        0
      );
      this.aggregationStats.avgSize = Math.round(totalSize / this.logBuffer.length);
    }

    // Create aggregation log entry
    const aggregationEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: `Aggregation report: ${this.aggregationStats.total} logs in ${this.aggregationInterval}ms`,
      plainMessage: undefined,
      loggerId: 'transport-manager',
      tags: ['aggregation', 'statistics'],
      context: {
        stats: this.aggregationStats,
      },
    };

    // Send to target transports
    for (const targetName of this.aggregationTargets) {
      const transport = this.get(targetName);
      if (transport && transport.enabled) {
        try {
          await transport.log(aggregationEntry);
        } catch (error) {
          this.handleTransportError(transport, error as Error, aggregationEntry);
        }
      }
    }

    // Emit aggregation event
    this.emit('aggregation', this.aggregationStats);

    // Reset for next period
    this.aggregationStartTime = new Date();
    this.resetAggregationStats();
    this.logBuffer = [];
  }

  /**
   * Get statistics for all transports.
   * 
   * @returns {Record<string, any>} Map of transport name to statistics
   */
  public getStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    this.transports.forEach((meta, name) => {
      if (meta.transport.getStats) {
        stats[name] = meta.transport.getStats();
      }
    });

    // Add manager stats
    stats._manager = {
      transportCount: this.transports.size,
      activeTransports: this.getActiveTransports().length,
      aggregationEnabled: this.aggregationEnabled,
      currentAggregation: this.aggregationStats,
    };

    return stats;
  }

  /**
   * Close all transports and clean up resources.
   * 
   * @returns {Promise<void>} Resolves when all transports are closed
   */
  public async close(): Promise<void> {
    if (this.closing) {
      return;
    }

    this.closing = true;
    this.emit('closing');

    // Stop aggregation timer
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
      this.aggregationTimer = null;
    }

    // Flush final aggregation
    if (this.aggregationEnabled) {
      await this.flushAggregation();
    }

    // Close all transports
    const closePromises = Array.from(this.transports.values()).map(
      meta => {
        const closeResult = meta.transport.close();
        return Promise.resolve(closeResult).catch((error: unknown) => {
          console.error(`Error closing transport '${meta.transport.name}':`, error);
        });
      }
    );

    await Promise.all(closePromises);

    // Clear transports
    this.transports.clear();

    // Emit closed event before removing listeners
    this.emit('closed');

    // Remove all listeners
    this.removeAllListeners();
  }

  /**
   * Apply timeout to an async operation.
   * 
   * @param {Promise<T>} promise - The promise to timeout
   * @param {number} ms - Timeout in milliseconds
   * @returns {Promise<T>} The original promise with timeout
   * @private
   */
  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });

    return Promise.race([promise, timeout]);
  }

  /**
   * Generate a unique ID.
   * 
   * @returns {string} Unique identifier
   * @private
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}