// File: src/utils/Sampler.ts

/**
 * Sampling strategies for log volume control.
 * Provides various algorithms for statistical sampling of log entries.
 *
 * @module utils/Sampler
 */

import { createHash } from 'crypto';
import type { LogEntry } from '../types';

/**
 * Sampling strategy type.
 */
export type SamplingStrategy = 'random' | 'deterministic' | 'adaptive' | 'reservoir';

/**
 * Sampling configuration options.
 */
export interface SamplerOptions {
  /**
   * Sampling rate (0-1).
   * 0 = no logs, 1 = all logs
   */
  rate: number;

  /**
   * Sampling strategy to use.
   * @default 'random'
   */
  strategy?: SamplingStrategy;

  /**
   * Function to generate sampling key for deterministic sampling.
   */
  keyFn?: (entry: LogEntry) => string;

  /**
   * Target logs per second for adaptive sampling.
   */
  targetRate?: number;

  /**
   * Minimum sampling rate for adaptive strategy.
   * @default 0.001
   */
  minRate?: number;

  /**
   * Maximum sampling rate for adaptive strategy.
   * @default 1.0
   */
  maxRate?: number;

  /**
   * Adjustment interval for adaptive sampling (ms).
   * @default 60000
   */
  adjustInterval?: number;

  /**
   * Reservoir size for reservoir sampling.
   * @default 1000
   */
  reservoirSize?: number;
}

/**
 * Sampler class for statistical log sampling.
 *
 * @class Sampler
 */
export class Sampler {
  private options: Required<SamplerOptions>;
  private currentRate: number;
  private sampleCount = 0;
  private totalCount = 0;
  private lastAdjustTime = Date.now();
  private adaptiveWindow: number[] = [];
  private reservoir: LogEntry[] = [];
  private reservoirCount = 0;

  /**
   * Creates a new Sampler instance.
   *
   * @param {SamplerOptions} options - Sampling configuration
   */
  constructor(options: SamplerOptions) {
    this.options = {
      rate: Math.max(0, Math.min(1, options.rate)),
      strategy: options.strategy || 'random',
      keyFn: options.keyFn || (entry => entry.id || ''),
      targetRate: options.targetRate || 1000,
      minRate: options.minRate || 0.001,
      maxRate: options.maxRate || 1.0,
      adjustInterval: options.adjustInterval || 60000,
      reservoirSize: options.reservoirSize || 1000,
    };

    this.currentRate = this.options.rate;

    // Start adaptive adjustment if needed
    if (this.options.strategy === 'adaptive') {
      this.startAdaptiveAdjustment();
    }
  }

  /**
   * Determine if a log entry should be sampled.
   */
  public shouldSample(entry: LogEntry): boolean {
    this.totalCount++;

    let sampled = false;

    switch (this.options.strategy) {
      case 'random':
        sampled = this.randomSample();
        break;
      case 'deterministic':
        sampled = this.deterministicSample(entry);
        break;
      case 'adaptive':
        sampled = this.adaptiveSample();
        break;
      case 'reservoir':
        sampled = this.reservoirSample(entry);
        break;
      default:
        sampled = this.randomSample();
    }

    if (sampled) {
      this.sampleCount++;
    }

    return sampled;
  }

  /** Random sampling based on rate. */
  private randomSample(): boolean {
    return Math.random() < this.currentRate;
  }

  /** Deterministic sampling based on hash of key. */
  private deterministicSample(entry: LogEntry): boolean {
    const key = this.options.keyFn(entry);
    if (!key) return this.randomSample();
    const hash = createHash('md5').update(key).digest();
    const hashValue = hash.readUInt32BE(0) / 0xffffffff;
    return hashValue < this.currentRate;
  }

  /** Adaptive sampling that adjusts rate based on volume. */
  private adaptiveSample(): boolean {
    const now = Date.now();
    this.adaptiveWindow.push(now);
    const windowStart = now - this.options.adjustInterval;
    this.adaptiveWindow = this.adaptiveWindow.filter(t => t > windowStart);
    return this.randomSample();
  }

  /** Reservoir sampling for fixed-size sample from stream. */
  private reservoirSample(entry: LogEntry): boolean {
    this.reservoirCount++;
    if (this.reservoir.length < this.options.reservoirSize) {
      this.reservoir.push(entry);
      return true;
    }
    const index = Math.floor(Math.random() * this.reservoirCount);
    if (index < this.options.reservoirSize) {
      this.reservoir[index] = entry;
      return true;
    }
    return false;
  }

  /** Start adaptive rate adjustment. */
  private startAdaptiveAdjustment(): void {
    const interval = setInterval(() => {
      this.adjustAdaptiveRate();
    }, this.options.adjustInterval);
    if ((interval as any).unref) {
      (interval as any).unref();
    }
  }

  /** Adjust sampling rate based on observed volume. */
  private adjustAdaptiveRate(): void {
    const currentRate = this.adaptiveWindow.length / (this.options.adjustInterval / 1000);
    const targetRate = this.options.targetRate;
    if (currentRate > targetRate) {
      const adjustment = targetRate / currentRate;
      this.currentRate = Math.max(this.options.minRate, this.currentRate * adjustment);
    } else if (currentRate < targetRate * 0.8) {
      const adjustment = Math.min(1.2, targetRate / Math.max(1, currentRate));
      this.currentRate = Math.min(this.options.maxRate, this.currentRate * adjustment);
    }
  }

  /** Get current sampling statistics. */
  public getStats(): {
    totalCount: number;
    sampleCount: number;
    effectiveRate: number;
    currentRate: number;
    strategy: SamplingStrategy;
  } {
    return {
      totalCount: this.totalCount,
      sampleCount: this.sampleCount,
      effectiveRate: this.totalCount > 0 ? this.sampleCount / this.totalCount : 0,
      currentRate: this.currentRate,
      strategy: this.options.strategy,
    };
  }

  /** Reset sampling statistics. */
  public reset(): void {
    this.sampleCount = 0;
    this.totalCount = 0;
    this.adaptiveWindow = [];
    this.reservoir = [];
    this.reservoirCount = 0;
    this.currentRate = this.options.rate;
  }

  /** Update sampling rate. */
  public setRate(rate: number): void {
    this.options.rate = Math.max(0, Math.min(1, rate));
    this.currentRate = this.options.rate;
  }

  /** Get reservoir samples (for reservoir sampling). */
  public getReservoir(): LogEntry[] {
    return [...this.reservoir];
  }
}

/**
 * Create a sampler with preset configuration.
 */
export function createSamplerPreset(preset: 'development' | 'staging' | 'production'): Sampler {
  const presets: Record<string, SamplerOptions> = {
    development: { rate: 1.0, strategy: 'random' },
    staging: { rate: 0.5, strategy: 'deterministic' },
    production: { rate: 0.1, strategy: 'adaptive', targetRate: 1000, minRate: 0.001, maxRate: 0.1 },
  };
  return new Sampler(presets[preset] || presets.production);
}
