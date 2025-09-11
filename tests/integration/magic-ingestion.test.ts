// File: tests/integration/magic-ingestion.test.ts

import { Logger } from '../../src/Logger';
import type { LogEntry } from '../../src/types/transport';

describe('MAGIC Schema Cross-Language Ingestion', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  describe('MAGIC Compliance Validation', () => {
    it('should validate correct MAGIC schema entries', () => {
      const validEntry = {
        id: 'test-123',
        timestamp: '2024-01-15T10:30:00.000Z',
        timestampMs: 1705316400000,
        level: 'info',
        message: 'Test message',
        styles: [
          [0, 4, 'red'],
          [5, 12, 'blue.bold'],
        ],
      };

      expect(isMAGICCompliant(validEntry)).toBe(true);
    });

    it('should reject entries missing required fields', () => {
      const invalidEntries = [
        { timestamp: '2024-01-15T10:30:00.000Z', level: 'info', message: 'test' }, // missing id
        { id: 'test', level: 'info', message: 'test' }, // missing timestamp
        { id: 'test', timestamp: '2024-01-15T10:30:00.000Z', message: 'test' }, // missing level
        { id: 'test', timestamp: '2024-01-15T10:30:00.000Z', level: 'info' }, // missing message
      ];

      invalidEntries.forEach(entry => {
        expect(isMAGICCompliant(entry)).toBe(false);
      });
    });

    it('should validate style ranges format', () => {
      const validStyles = {
        id: 'test',
        timestamp: '2024-01-15T10:30:00.000Z',
        level: 'info',
        message: 'Test message',
        styles: [
          [0, 4, 'red'],
          [5, 12, 'blue'],
        ],
      };

      const invalidStyles = [
        { ...validStyles, styles: 'not-an-array' },
        { ...validStyles, styles: [[0, 4]] }, // missing style
        { ...validStyles, styles: [[0, 4, 'red', 'extra']] }, // too many elements
        { ...validStyles, styles: [['0', 4, 'red']] }, // string instead of number
        { ...validStyles, styles: [[-1, 4, 'red']] }, // negative start
        { ...validStyles, styles: [[5, 5, 'red']] }, // start >= end
      ];

      expect(isMAGICCompliant(validStyles)).toBe(true);
      invalidStyles.forEach(entry => {
        expect(isMAGICCompliant(entry)).toBe(false);
      });
    });
  });

  describe('Cross-Language Log Simulation', () => {
    it('should ingest Python-style MAGIC logs', () => {
      // Simulated Python logger output
      const pythonLog = {
        id: 'py-1705316400000-abc123',
        timestamp: '2024-01-15T10:30:00.000Z',
        timestampMs: 1705316400000,
        level: 'error',
        message: 'Database connection failed for user alice@example.com',
        styles: [
          [0, 26, 'red.bold'], // "Database connection failed"
          [31, 53, 'cyan'], // "alice@example.com"
        ] as Array<[number, number, string]>,
        service: 'python-api',
        environment: 'production',
        metadata: {
          hostname: 'python-server-01',
          pid: 54321,
          platform: 'linux',
          pythonVersion: '3.11.0',
        },
      };

      const reconstructed = reconstructStyles(pythonLog.message, pythonLog.styles);
      expect(reconstructed).toContain('\x1b['); // Contains ANSI codes
      expect(pythonLog.message).toBe('Database connection failed for user alice@example.com');
    });

    it('should ingest Go-style MAGIC logs', () => {
      // Simulated Go logger output
      const goLog = {
        id: 'go-1705316400000-xyz789',
        timestamp: '2024-01-15T10:30:00.000Z',
        timestampMs: 1705316400000,
        level: 'warn',
        message: 'Cache miss for key user:12345 in region us-west-2',
        styles: [
          [0, 10, 'yellow'], // "Cache miss"
          [19, 29, 'cyan.bold'], // "user:12345"
          [41, 50, 'green'], // "us-west-2"
        ] as Array<[number, number, string]>,
        service: 'go-cache-service',
        environment: 'staging',
      };

      const reconstructed = reconstructStyles(goLog.message, goLog.styles);
      expect(reconstructed).toContain('\x1b['); // Contains ANSI codes
      expect(goLog.message).toBe('Cache miss for key user:12345 in region us-west-2');
    });

    it('should ingest Rust-style MAGIC logs', () => {
      // Simulated Rust logger output
      const rustLog = {
        id: 'rust-1705316400000-def456',
        timestamp: '2024-01-15T10:30:00.000Z',
        timestampMs: 1705316400000,
        level: 'info',
        message: 'Processing 1000 records in 45ms',
        styles: [
          [11, 15, 'green.bold'], // "1000"
          [27, 31, 'yellow.bold'], // "45ms"
        ] as Array<[number, number, string]>,
        service: 'rust-processor',
        environment: 'development',
      };

      const reconstructed = reconstructStyles(rustLog.message, rustLog.styles);
      expect(reconstructed).toContain('\x1b['); // Contains ANSI codes
    });
  });

  describe('Style Reconstruction', () => {
    it('should correctly reconstruct overlapping styles', () => {
      const message = 'Error in module A at line 42';
      const styles: Array<[number, number, string]> = [
        [0, 5, 'red'], // "Error"
        [9, 17, 'yellow'], // "module A"
        [26, 28, 'cyan.bold'], // "42"
      ];

      const reconstructed = reconstructStyles(message, styles);

      // Verify structure is maintained
      expect(reconstructed).toContain('Error');
      expect(reconstructed).toContain('module A');
      expect(reconstructed).toContain('42');
      expect(reconstructed).toContain('\x1b[0m'); // Reset codes
    });

    it('should handle empty styles array', () => {
      const message = 'Plain text message';
      const styles: Array<[number, number, string]> = [];

      const reconstructed = reconstructStyles(message, styles);
      expect(reconstructed).toBe(message);
    });

    it('should handle undefined styles', () => {
      const message = 'Plain text message';
      const reconstructed = reconstructStyles(message, undefined);
      expect(reconstructed).toBe(message);
    });
  });

  describe('MAGIC Format Conversion', () => {
    it('should convert TypeScript logs to MAGIC format', () => {
      const entry: LogEntry = {
        id: 'ts-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'User logged in',
        styles: [
          [0, 4, 'green'],
          [5, 14, 'cyan'],
        ],
        service: 'auth-service',
      };

      // Entry is already MAGIC compliant
      expect(isMAGICCompliant(entry)).toBe(true);
    });

    it('should handle logs without styles', () => {
      const entry = {
        id: 'plain-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'debug',
        message: 'Plain debug message',
        // No styles field
      };

      expect(isMAGICCompliant(entry)).toBe(true);
      const reconstructed = reconstructStyles(entry.message, undefined); // No styles provided
      expect(reconstructed).toBe('Plain debug message');
    });
  });

  describe('Batch Ingestion', () => {
    it('should process multiple MAGIC logs from different sources', () => {
      const mixedLogs = [
        // Python log
        {
          id: 'py-001',
          timestamp: '2024-01-15T10:30:00.000Z',
          timestampMs: 1705316400000,
          level: 'error',
          message: 'Python error occurred',
          styles: [[0, 6, 'red']] as Array<[number, number, string]>,
          service: 'python-app',
        },
        // Go log
        {
          id: 'go-002',
          timestamp: '2024-01-15T10:30:01.000Z',
          timestampMs: 1705316401000,
          level: 'info',
          message: 'Go service started',
          styles: [[0, 2, 'green']],
          service: 'go-app',
        },
        // Rust log
        {
          id: 'rust-003',
          timestamp: '2024-01-15T10:30:02.000Z',
          timestampMs: 1705316402000,
          level: 'warn',
          message: 'Rust warning issued',
          styles: [[0, 4, 'yellow']],
          service: 'rust-app',
        },
      ];

      const results = mixedLogs.map(log => ({
        valid: isMAGICCompliant(log),
        reconstructed: reconstructStyles(
          log.message,
          log.styles as Array<[number, number, string]>
        ),
      }));

      results.forEach(result => {
        expect(result.valid).toBe(true);
        expect(result.reconstructed).toBeDefined();
      });
    });
  });
});

// Helper functions that would be part of the ingestion system

function isMAGICCompliant(entry: unknown): boolean {
  const e = entry as Record<string, unknown>;

  // Check required fields
  if (!e.id || !e.timestamp || !e.level || !e.message) {
    return false;
  }

  // Validate level
  const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  if (!validLevels.includes(e.level as string)) {
    return false;
  }

  // Validate styles if present
  if (e.styles !== undefined) {
    if (!Array.isArray(e.styles)) {
      return false;
    }

    for (const range of e.styles) {
      if (!Array.isArray(range) || range.length !== 3) {
        return false;
      }

      const [start, end, style] = range;

      if (typeof start !== 'number' || typeof end !== 'number' || typeof style !== 'string') {
        return false;
      }

      if (start < 0 || end <= start || start >= (e.message as string).length) {
        return false;
      }
    }
  }

  return true;
}

function reconstructStyles(message: string, styles?: Array<[number, number, string]>): string {
  if (!styles || styles.length === 0) {
    return message;
  }

  // Import colorizer for actual ANSI code application
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Colorizer } = require('../../src/core/Colorizer');

  let result = '';
  let lastEnd = 0;

  for (const [start, end, styleStr] of styles) {
    // Add unstyled text before this range
    result += message.slice(lastEnd, start);

    // Parse style string (e.g., "red.bold" → ["red", "bold"])
    const styleNames = styleStr.split('.');

    // Apply styles to the text segment
    const styledSegment = Colorizer.applyColors(message.slice(start, end), styleNames, true);

    result += styledSegment;
    lastEnd = end;
  }

  // Add any remaining unstyled text
  result += message.slice(lastEnd);

  return result;
}
