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
import type { LoggerOptions, LogLevel } from './types/logger';
import type { ColorName } from './types/colors';

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
  public custom(msg: string, colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    this.impl.custom(msg, colors, prefix);
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
    // Browser-safe timer
    try {
      console.time(label);
    } catch {
      /* noop */
    }
  }
  public timeEnd(label: string): void {
    try {
      console.timeEnd(label);
    } catch {
      /* noop */
    }
  }
  public performance(label: string, data: Record<string, unknown>): void {
    // Minimal browser-friendly performance view
    try {
      console.group?.(label);
      console.table?.(data as unknown as Record<string, unknown>);
    } finally {
      try {
        console.groupEnd?.();
      } catch {
        /* noop */
      }
    }
  }
  public progress(percent: number, message?: string): void {
    // Use BrowserLogger progress bar; message is ignored in browser demo
    this.impl.progressBar(percent);
    if (message) {
      this.impl.log(message, 'info');
    }
  }

  // Unified API methods
  public progressBar(
    progress: number,
    length?: number,
    completeChar?: string,
    incompleteChar?: string
  ): void {
    this.impl.progressBar(progress, length, completeChar, incompleteChar);
  }

  public count(label?: string): void {
    this.impl.count(label);
  }

  public countReset(label?: string): void {
    this.impl.countReset(label);
  }

  public group(label: string, collapsed?: boolean): void {
    this.impl.group(label, collapsed);
  }

  public groupEnd(): void {
    this.impl.groupEnd();
  }

  public box(text: string, options?: Record<string, unknown>): void {
    this.impl.box(text, options);
  }

  public list(items: string[], options?: Record<string, unknown>): void {
    this.impl.list(items, options);
  }

  public styled(msg: string, preset: string | string[]): void {
    this.impl.styled(msg, preset);
  }

  public colorParts(message: string, colorMap: Record<string, ColorName[]>): string {
    return this.impl.colorParts(message, colorMap);
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
export type { LoggerOptions, LogLevel } from './types/logger';
export type { ColorName } from './types/colors';
