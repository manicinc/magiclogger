import * as CustomFormatterExports from '../../../../src/transports/formatters/CustomFormatter';

describe('CustomFormatter (legacy exports)', () => {
  it('should export CustomFormatter', () => {
    expect(CustomFormatterExports.CustomFormatter).toBeDefined();
    expect(typeof CustomFormatterExports.CustomFormatter).toBe('function');
  });

  it('should export FunctionFormatter', () => {
    expect(CustomFormatterExports.FunctionFormatter).toBeDefined();
    expect(typeof CustomFormatterExports.FunctionFormatter).toBe('function');
  });

  it('should export XMLFormatter', () => {
    expect(CustomFormatterExports.XMLFormatter).toBeDefined();
    expect(typeof CustomFormatterExports.XMLFormatter).toBe('function');
  });

  it('should export CSVFormatter', () => {
    expect(CustomFormatterExports.CSVFormatter).toBeDefined();
    expect(typeof CustomFormatterExports.CSVFormatter).toBe('function');
  });

  it('should export legacy marker', () => {
    expect(CustomFormatterExports.LEGACY_CUSTOM_FORMATTER_FILE).toBe(true);
  });

  describe('CustomFormatter usage', () => {
    it('should create custom formatter with format function', () => {
      // CustomFormatter is abstract, so we use FunctionFormatter instead
      const formatter = new CustomFormatterExports.FunctionFormatter(entry => {
        return `CUSTOM: ${entry.level} - ${entry.message}`;
      });

      const entry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'info' as const,
        message: 'Test message',
        plainMessage: 'Test message',
      };

      const formatted = formatter.format(entry);
      expect(formatted).toBe('CUSTOM: info - Test message');
    });
  });

  describe('FunctionFormatter usage', () => {
    it('should create function formatter', () => {
      const formatter = new CustomFormatterExports.FunctionFormatter(entry => {
        return JSON.stringify({ level: entry.level, msg: entry.message });
      });

      const entry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'error' as const,
        message: 'Error occurred',
        plainMessage: 'Error occurred',
      };

      const formatted = formatter.format(entry);
      const parsed = JSON.parse(formatted.toString());
      expect(parsed.level).toBe('error');
      expect(parsed.msg).toBe('Error occurred');
    });
  });

  describe('XMLFormatter usage', () => {
    it('should format as XML', () => {
      const formatter = new CustomFormatterExports.XMLFormatter();

      const entry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'info' as const,
        message: 'Test message',
        plainMessage: 'Test message',
      };

      const formatted = formatter.format(entry);
      // XML formatter uses attributes for level and timestamp
      expect(formatted).toContain('<log');
      expect(formatted).toContain('level="info"');
      expect(formatted).toContain('<message>Test message</message>');
      expect(formatted).toContain('</log>');
    });
  });

  describe('CSVFormatter usage', () => {
    it('should format as CSV', () => {
      const formatter = new CustomFormatterExports.CSVFormatter();

      const entry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'warn' as const,
        message: 'Warning message',
        plainMessage: 'Warning message',
      };

      const formatted = formatter.format(entry);
      expect(formatted).toContain('2024-01-01T00:00:00.000Z');
      expect(formatted).toContain('warn');
      expect(formatted).toContain('Warning message');
      expect(formatted).toContain(','); // CSV delimiter
    });
  });
});
