// File: tests/integration/style-extraction.test.ts

import { Logger } from '../../src/Logger';
import type { LogEntry } from '../../src/types/transport';
import { Transport } from '../../src/transports/base/Transport';
import { Colorizer } from '../../src/core/Colorizer';

// Test transport that captures log entries
class TestTransport extends Transport {
  public capturedEntries: LogEntry[] = [];

  constructor() {
    super({
      name: 'test',
      enabled: true,
      level: 'debug',  // Accept all levels including debug
    });
  }

  protected async doInit(): Promise<void> {
    // No initialization needed
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    this.capturedEntries.push(entry);
  }

  protected async doClose(): Promise<void> {
    // No cleanup needed
  }

  public clear(): void {
    this.capturedEntries = [];
  }
}

describe('Style Extraction Integration', () => {
  let logger: Logger;
  let testTransport: TestTransport;
  let capturedEntries: LogEntry[] = [];

  beforeEach(async () => {
    testTransport = new TestTransport();
    logger = new Logger({
      useConsole: false, // Disable default console transport
    });

    // Add transport and wait for it to be registered
    await logger.addTransport(testTransport);

    // Clear any previous entries
    testTransport.clear();
    capturedEntries = testTransport.capturedEntries;
  });

  afterEach(() => {
    // Clean up
    capturedEntries = [];
  });

  // Helper to wait for async logger to flush
  const waitForFlush = async (maxWait = 1000) => {
    const startTime = Date.now();
    while (capturedEntries.length === 0 && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };

  describe('Angle bracket style extraction', () => {
    it('should extract styles from angle bracket syntax', async () => {
      logger.info('<red.bold>Error:</> User <cyan>john@example.com</> not found');
      
      await waitForFlush();
      
      expect(capturedEntries).toHaveLength(1);
      const entry = capturedEntries[0];
      
      // Verify plain text message
      expect(entry.message).toBe('Error: User john@example.com not found');
      
      // Verify style extraction
      expect(entry.styles).toBeDefined();
      expect(entry.styles).toEqual([
        [0, 6, 'red.bold'],    // "Error:"
        [12, 28, 'cyan']       // "john@example.com"
      ]);
    });

    it('should handle multiple consecutive styled segments', async () => {
      logger.warn('<yellow>Warning:</> <red>Critical</> <green>issue</> detected');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('Warning: Critical issue detected');
      expect(entry.styles).toEqual([
        [0, 8, 'yellow'],      // "Warning:"
        [9, 17, 'red'],        // "Critical"
        [18, 23, 'green']      // "issue"
      ]);
    });

    it('should handle complex nested styles', async () => {
      logger.error('<bg.red><white.bold>FATAL ERROR</></>: System shutdown');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('FATAL ERROR: System shutdown');
      expect(entry.styles).toEqual([
        [0, 11, 'bg.red.white.bold']  // "FATAL ERROR" - expecting combined nested styles
      ]);
    });

    it('should handle mixed styled and unstyled content', async () => {
      logger.info('Processing file <cyan>data.json</> with <bold>100</> records');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('Processing file data.json with 100 records');
      expect(entry.styles).toEqual([
        [16, 25, 'cyan'],      // "data.json"
        [31, 34, 'bold']       // "100"
      ]);
    });

    it('should handle empty styled segments gracefully', async () => {
      logger.debug('Testing <red></> empty segment');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('Testing  empty segment');  // Empty content preserved
      expect(entry.styles).toBeUndefined();  // No styles since content was empty
    });

    it('should preserve message without styles when none present', async () => {
      logger.info('Plain text message without any styles');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('Plain text message without any styles');
      expect(entry.styles).toBeUndefined();
    });
  });

  describe('Style reconstruction', () => {
    it('should allow reconstruction of styled output from entry', () => {
      const plainText = 'Error: User john@example.com not found';
      const styles: Array<[number, number, string]> = [
        [0, 6, 'red.bold'],
        [12, 28, 'cyan']
      ];

      // This would be done by ConsoleTransport or similar
      const reconstructed = reconstructStyledMessage(plainText, styles);
      
      // Should contain ANSI codes
      expect(reconstructed).toContain('\x1b['); // Contains ANSI escape sequences
      expect(reconstructed).toContain('Error:');
      expect(reconstructed).toContain('john@example.com');
    });
  });

  describe('Backward compatibility', () => {
    it('should handle entries without styles field', () => {
      const entry: LogEntry = {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Plain message without styles',
        // No styles field
      };

      // Should work fine without styles
      expect(entry.message).toBe('Plain message without styles');
      expect(entry.styles).toBeUndefined();
    });

    it('should work with transports expecting plain messages', async () => {
      logger.info('<red>Styled</> message for <cyan>testing</> compatibility');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      
      // Transports can use the plain message directly
      expect(entry.message).toBe('Styled message for testing compatibility');
      
      // And optionally use styles if they support it
      expect(entry.styles?.length || 0).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should efficiently handle large messages with many styles', async () => {
      const colors = ['red', 'green', 'blue', 'yellow', 'cyan'];
      const parts: string[] = [];
      for (let i = 0; i < 100; i++) {
        parts.push(`<${colors[i % 5]}>segment${i}</>`)
      }
      const largeMessage = parts.join(' ');
      
      const start = performance.now();
      logger.info(largeMessage);
      await waitForFlush();
      const duration = performance.now() - start;
      
      // Should complete in reasonable time (increased threshold for CI)
      expect(duration).toBeLessThan(500); // 500ms max for CI environments
      
      const entry = capturedEntries[0];
      expect(entry.styles).toBeDefined();
      expect(entry.styles?.length).toBe(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed style tags gracefully', async () => {
      logger.warn('Malformed <red tag without closing');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('Malformed <red tag without closing');
      expect(entry.styles).toBeUndefined();
    });

    it('should handle special characters in styled content', async () => {
      logger.info('<cyan>Special chars: @#$%^&*()</>');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('Special chars: @#$%^&*()');
      expect(entry.styles).toEqual([
        [0, 24, 'cyan']  // Corrected length - "Special chars: @#$%^&*()" is 24 chars
      ]);
    });

    it('should handle unicode in styled content', async () => {
      logger.info('<green>Unicode: 你好 🚀 café</>');
      
      await waitForFlush();
      
      const entry = capturedEntries[0];
      expect(entry.message).toBe('Unicode: 你好 🚀 café');
      expect(entry.styles).toBeDefined();
    });
  });
});

/**
 * Helper function to reconstruct styled message from plain text and styles.
 * This simulates what ConsoleTransport does internally.
 */
function reconstructStyledMessage(
  plainText: string,
  styles?: Array<[number, number, string]>
): string {
  if (!styles || styles.length === 0) {
    return plainText;
  }

  // Colorizer is already imported at the top
  
  let result = '';
  let lastEnd = 0;
  
  for (const [start, end, styleStr] of styles) {
    // Add unstyled text before this range
    result += plainText.slice(lastEnd, start);
    
    // Parse style string (e.g., "red.bold" → ["red", "bold"])
    const styleNames = styleStr.split('.');
    
    // Apply styles to the text segment
    const styledSegment = Colorizer.applyColors(
      plainText.slice(start, end),
      styleNames,
      true
    );
    
    result += styledSegment;
    lastEnd = end;
  }
  
  // Add any remaining unstyled text
  result += plainText.slice(lastEnd);
  
  return result;
}