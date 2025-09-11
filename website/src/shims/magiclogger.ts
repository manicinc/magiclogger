// Local shim for 'magiclogger' so the website can build/run without the package
// or local dist artifacts. Provides a minimal Logger with the methods used in demos.

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface LoggerOptions {
  useColors?: boolean;
  verbose?: boolean;
  storeInBrowser?: boolean;
  maxStoredLogs?: number;
}

function formatPrefix(level: LogLevel) {
  const map: Record<LogLevel, string> = {
    log: 'LOG',
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    debug: 'DEBUG',
  };
  return `[MagicLogger:${map[level]}]`;
}

export class Logger {
  private timers = new Map<string, number>();
  // No constructor needed as LoggerOptions are not used

  private emit(level: LogLevel, message: string, ...rest: unknown[]) {
    const c = console as unknown as Record<LogLevel, (...args: unknown[]) => void>;
    const fn = c[level] || console.log;
    fn(`${formatPrefix(level)} ${message}`, ...rest);
  }

  info(message: string) { this.emit('info', message); }
  warn(message: string) { this.emit('warn', message); }
  error(message: string) { this.emit('error', message); }
  success(message: string) { this.emit('info', `✅ ${message}`); }
  debug(message: string) { this.emit('debug', message); }
  custom(message: string, _colors: string[] = [], prefix = 'CUSTOM') {
    this.emit('log', `${prefix} ${message}`);
  }
  header(message: string) { this.emit('log', `===== ${message} =====`); }
  separator(char = '-') { this.emit('log', char.repeat(20)); }
  table(data: Record<string, unknown>[]) {
    (console as unknown as { table?: (data: Record<string, unknown>[]) => void }).table?.(data);
  }
  time(label: string) { this.timers.set(label, Date.now()); this.emit('log', `⏱️ ${label} start`); }
  timeEnd(label: string) {
    const start = this.timers.get(label);
    const ms = start != null ? Date.now() - start : undefined;
    this.emit('log', `⏱️ ${label} end${ms != null ? ` (${ms}ms)` : ''}`);
    this.timers.delete(label);
  }
  performance(label: string, data: Record<string, unknown>) {
    this.emit('info', `${label}: ${JSON.stringify(data)}`);
  }
  progress(percent: number, message: string) {
    this.emit('info', `${Math.max(0, Math.min(100, percent))}% ${message}`);
  }
}

export default { Logger };
