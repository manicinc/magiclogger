// Clean passthrough: maintained for historical import path only.
// Prefer importing from 'magiclogger/transports/formatters'.

export { CustomFormatter, FunctionFormatter } from './BaseFormatter';
export { XMLFormatter } from './XMLFormatter';
export { CSVFormatter } from './index';
export type { LogEntry } from '../../types/transport';

// Minimal marker so tooling can detect this legacy file if needed.
export const LEGACY_CUSTOM_FORMATTER_FILE = true;
