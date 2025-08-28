// File: tests/unit/middleware/SecurityMiddleware.test.ts

// Jest is configured globally, no imports needed for describe, it, expect
import { SecurityMiddleware } from '../../../src/middleware/SecurityMiddleware';
import type { LogEntry } from '../../../src/types/transport';
import type { MiddlewareContext } from '../../../src/middleware/Middleware';

describe('SecurityMiddleware', () => {
  let mockEntry: LogEntry;
  let mockContext: MiddlewareContext;

  beforeEach(() => {
    mockEntry = {
      id: 'test-123',
      timestamp: '2024-01-01T00:00:00.000Z',
      timestampMs: 1704067200000,
      level: 'info',
      message: 'Test message',
      plainMessage: 'Test message',
      loggerId: 'test-logger',
      context: {},
    };

    mockContext = {
      loggerId: 'test-logger',
      index: 0,
      total: 1,
      state: new Map(),
    };
  });

  describe('Newline and Control Character Sanitization', () => {
    it('should sanitize newlines in messages', () => {
      const middleware = new SecurityMiddleware({ sanitizeNewlines: true });
      mockEntry.message = 'Line 1\nLine 2\rLine 3';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.continue).toBe(true);
      expect(result.entry?.message).toBe('Line 1\\nLine 2\\rLine 3');
    });

    it('should sanitize tab characters', () => {
      const middleware = new SecurityMiddleware({ sanitizeNewlines: true });
      mockEntry.message = 'Tab\there';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.message).toBe('Tab\\there');
    });

    it('should sanitize null characters', () => {
      const middleware = new SecurityMiddleware({ sanitizeNewlines: true });
      mockEntry.message = 'Null\0char';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.message).toBe('Null\\0char');
    });

    it('should not sanitize when disabled', () => {
      const middleware = new SecurityMiddleware({ sanitizeNewlines: false });
      mockEntry.message = 'Line 1\nLine 2';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.message).toBe('Line 1\nLine 2');
    });
  });

  describe('Log Injection Prevention', () => {
    it('should detect fake timestamp injection', () => {
      const middleware = new SecurityMiddleware({ preventInjection: true });
      mockEntry.message = 'Normal log\n2024-01-01 Fake timestamp';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* ignore */
      });
      const result = middleware.process(mockEntry, mockContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SecurityMiddleware] Potential injection attempt detected'
      );
      expect(result.entry?.message).toContain('[SANITIZED]');

      consoleSpy.mockRestore();
    });

    it('should detect fake log level injection', () => {
      const middleware = new SecurityMiddleware({ preventInjection: true });
      mockEntry.message = 'Normal log [ERROR]';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* ignore */
      });
      const result = middleware.process(mockEntry, mockContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SecurityMiddleware] Potential injection attempt detected'
      );
      expect(result.entry?.message).toContain('[SANITIZED]');

      consoleSpy.mockRestore();
    });

    it('should detect fake stack trace injection', () => {
      const middleware = new SecurityMiddleware({ preventInjection: true });
      mockEntry.message = 'Error occurred\n  at fakeFunction()';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* ignore */
      });
      const result = middleware.process(mockEntry, mockContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SecurityMiddleware] Potential injection attempt detected'
      );
      expect(result.entry?.message).toContain('[SANITIZED]');

      consoleSpy.mockRestore();
    });
  });

  describe('Message Length Limiting', () => {
    it('should truncate long messages', () => {
      const middleware = new SecurityMiddleware({ maxMessageLength: 20 });
      mockEntry.message = 'This is a very long message that exceeds the limit';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.message).toBe('This is a very long ...[truncated]');
    });

    it('should truncate plainMessage separately', () => {
      const middleware = new SecurityMiddleware({ maxMessageLength: 20 });
      mockEntry.plainMessage = 'This is a very long plain message that exceeds the limit';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.plainMessage).toBe('This is a very long ...[truncated]');
    });
  });

  describe('Context Sanitization', () => {
    it('should limit context depth', () => {
      const middleware = new SecurityMiddleware({ maxContextDepth: 2 });
      mockEntry.context = {
        level1: {
          level2: {
            level3: {
              tooDeep: 'should not appear',
            },
          },
        },
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.level1).toBeDefined();
      expect((result.entry?.context?.level1 as Record<string, unknown>).level2).toEqual({
        _error: 'Max depth exceeded',
      });
    });

    it('should limit number of context keys', () => {
      const middleware = new SecurityMiddleware({ maxContextKeys: 3 });
      mockEntry.context = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
        key4: 'value4',
        key5: 'value5',
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* ignore */
      });
      const result = middleware.process(mockEntry, mockContext);

      expect(consoleSpy).toHaveBeenCalled();
      expect(Object.keys(result.entry?.context || {}).length).toBe(4); // 3 + _truncated flag
      expect(result.entry?.context?._truncated).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should sanitize strings in context', () => {
      const middleware = new SecurityMiddleware({ sanitizeNewlines: true });
      mockEntry.context = {
        field1: 'Value with\nnewline',
        nested: {
          field2: 'Tab\there',
        },
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.field1).toBe('Value with\\nnewline');
      expect((result.entry?.context?.nested as Record<string, unknown>).field2).toBe('Tab\\there');
    });

    it('should sanitize arrays in context', () => {
      const middleware = new SecurityMiddleware({ sanitizeNewlines: true });
      mockEntry.context = {
        items: ['normal', 'with\nnewline', { nested: 'with\ttab' }],
      };

      const result = middleware.process(mockEntry, mockContext);

      const items = result.entry?.context?.items as unknown[];
      expect(items[0]).toBe('normal');
      expect(items[1]).toBe('with\\nnewline');
      expect((items[2] as Record<string, unknown>).nested).toBe('with\\ttab');
    });
  });

  describe('ANSI Code Stripping', () => {
    it('should strip ANSI codes when configured', () => {
      const middleware = new SecurityMiddleware({ stripAnsi: true });
      mockEntry.message = '\x1b[31mRed text\x1b[0m normal text';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.message).toBe('Red text normal text');
    });

    it('should not strip ANSI codes by default', () => {
      const middleware = new SecurityMiddleware({ stripAnsi: false });
      mockEntry.message = '\x1b[31mRed text\x1b[0m';

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.message).toBe('\x1b[31mRed text\x1b[0m');
    });
  });

  describe('URL Sanitization', () => {
    it('should sanitize URLs with credentials', () => {
      const middleware = new SecurityMiddleware({ sanitizeUrls: true });
      mockEntry.context = {
        url: 'https://user:pass@example.com/path',
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.url).toBe('https://example.com/path');
    });

    it('should reject unsafe protocols', () => {
      const middleware = new SecurityMiddleware({ sanitizeUrls: true });
      mockEntry.context = {
        url: 'javascript:alert(1)',
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.url).toBe('[UNSAFE_URL]');
    });

    it('should handle invalid URLs gracefully', () => {
      const middleware = new SecurityMiddleware({ sanitizeUrls: true });
      mockEntry.context = {
        url: 'not a valid url at all',
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.url).toBe('not a valid url at all'); // Not detected as URL
    });

    it('should allow safe protocols', () => {
      const middleware = new SecurityMiddleware({ sanitizeUrls: true });
      mockEntry.context = {
        httpUrl: 'http://example.com',
        httpsUrl: 'https://example.com',
        ftpUrl: 'ftp://example.com',
        ftpsUrl: 'ftps://example.com',
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.httpUrl).toBe('http://example.com');
      expect(result.entry?.context?.httpsUrl).toBe('https://example.com');
      expect(result.entry?.context?.ftpUrl).toBe('ftp://example.com');
      expect(result.entry?.context?.ftpsUrl).toBe('ftps://example.com');
    });
  });

  describe('Error Sanitization', () => {
    it('should sanitize error messages', () => {
      const middleware = new SecurityMiddleware({ sanitizeNewlines: true });
      mockEntry.error = {
        name: 'Error',
        message: 'Error with\nnewline',
        stack: 'Stack trace\nwith multiple\nlines',
        code: 'ERR_CODE',
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.error?.message).toBe('Error with\\nnewline');
      expect(result.entry?.error?.stack).toBe('Stack trace\\nwith multiple\\nlines');
      expect(result.entry?.error?.name).toBe('Error');
      expect(result.entry?.error?.code).toBe('ERR_CODE');
    });
  });

  describe('Custom Sanitizer', () => {
    it('should apply custom sanitizer function', () => {
      const customSanitizer = jest.fn((value: string) => {
        if (typeof value === 'string') {
          return value.replace(/password/gi, '***');
        }
        return value;
      });
      const middleware = new SecurityMiddleware({ customSanitizer });

      mockEntry.message = 'User logged in with password: secret123';
      mockEntry.context = {
        password: 'my-password',
        nested: {
          apiPassword: 'api-secret',
        },
      };

      const result = middleware.process(mockEntry, mockContext);

      expect(customSanitizer).toHaveBeenCalled();
      expect(result.entry?.message).toBe('User logged in with ***: secret123');
      // The context should be sanitized
      expect(result.entry?.context).toBeDefined();
      // Check if password field exists and was sanitized
      const ctx = result.entry?.context as Record<string, unknown>;
      expect(ctx['***']).toBe('my-***'); // Both key and value sanitized
      expect((result.entry?.context?.nested as Record<string, unknown>)['api***']).toBe(
        'api-secret'
      ); // Key sanitized but not value
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const middleware = new SecurityMiddleware();

      // Create an object that causes an error when accessed
      const problematicEntry: LogEntry = {
        ...mockEntry,
        context: {},
      };

      Object.defineProperty(problematicEntry.context, 'problem', {
        get() {
          throw new Error('Access error');
        },
        enumerable: true,
      });

      const result = middleware.process(problematicEntry, mockContext);

      // Should still return a result, not throw
      expect(result.continue).toBe(true);
    });
  });

  describe('Priority', () => {
    it('should have high priority to run early', () => {
      const middleware = new SecurityMiddleware();
      expect(middleware.priority).toBe(10); // Should run early in pipeline
    });
  });
});
