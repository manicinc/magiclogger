// File: src/index.browser.ts

/**
 * Browser-friendly entry for MagicLogger.
 * This avoids importing Node-specific modules (fs/path/os) so bundlers like Webpack
 * don't try to polyfill core modules in client builds.
 *
 * It exposes the Logger API backed by the BrowserLogger implementation only.
 * Keep this surface minimal and focused on what the website/demo needs.
 */

import { BrowserLogger } from './core/BrowserLogger';
import type { LoggerOptions, LogLevel, ColorName } from './types';

// Minimal facade that mirrors the main Logger API used by the docs site/demo
export class Logger {
  private impl: BrowserLogger;

  constructor(options: Partial<LoggerOptions> | boolean = {}) {
    // Support boolean shorthand for verbose
    const opts = typeof options === 'boolean' ? { verbose: options } : options;
    this.impl = new BrowserLogger({
      useColors: true,
      verbose: false,
      storeInBrowser: true,
      maxStoredLogs: 200,
      ...opts,
    });
  }

  // Core logging
  public log(msg: string, level: LogLevel = 'info'): void {
    this.impl.log(msg, level);
  }
  public info(msg: string): void {
    this.impl.log(msg, 'info');
  }
  public success(msg: string): void {
    this.impl.log(msg, 'success');
  }
  public warn(msg: string): void {
    this.impl.log(msg, 'warn');
  }
  public error(msg: string): void {
    this.impl.log(msg, 'error');
  }
  public debug(msg: string): void {
    this.impl.log(msg, 'debug');
  }

  // Visual helpers used by demos
  public custom(msg: string, _colors: ColorName[] = ['white'], _prefix = 'LOG'): void {
    // For browser demo, route to info
    this.impl.log(msg, 'info');
  }
  public header(title: string, _colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    this.impl.header(title, _colors);
  }
  public separator(char = '─'): void {
    this.impl.separator(char);
  }
  public table(
    data: Record<string, unknown>[],
    headerColor: ColorName[] = ['brightWhite', 'bold']
  ): void {
    if (!Array.isArray(data) || data.length === 0) return;
    this.impl.table(data, headerColor);
  }
  public time(label: string): void {
    this.impl.time(label);
  }
  public timeEnd(label: string): void {
    this.impl.timeEnd(label);
  }
  public performance(label: string, data: Record<string, unknown>): void {
    this.impl.performance(label, data);
  }
  public progress(percent: number, message?: string): void {
    this.impl.progress(percent, message ?? '');
  }

  // Theme passthroughs for compatibility if needed in future
  public setColorsEnabled(enabled: boolean): void {
    this.impl.setColorsEnabled(enabled);
  }
  public get useColors(): boolean {
    return this.impl.areColorsEnabled();
  }
}

// Re-export a tiny set of safe types for convenience in docs
export type { LoggerOptions, LogLevel, ColorName } from './types';
