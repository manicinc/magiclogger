/* eslint-disable @typescript-eslint/no-explicit-any */
// File: tests/unit/extensions/Redactor.test.ts

import { Redactor, createRedactorPreset } from '../../../src/extensions/Redactor';
import type { LogEntry } from '../../../src/types';
import type { RedactionPattern } from '../../../src/extensions/Redactor';

// Mock crypto for consistent tokenization
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() => Buffer.from('mock-salt-value')),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mockedhash123456789'),
  })),
}));

describe('Redactor', () => {
  let redactor: Redactor;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Preset Configurations', () => {
    it('should apply minimal preset', () => {
      redactor = new Redactor({ preset: 'minimal' });

      const input = {
        email: 'john@example.com',
        creditCard: '4111111111111111',
        ssn: '123-45-6789',
        apiKey: 'sk_test_1234567890',
      };

      const output = redactor.redact(input) as any;

      expect(output.email).toBe('john@example.com'); // Not redacted in minimal
      expect(output.creditCard).toContain('****');
      expect(output.ssn).toBe('***-**-****');
      expect(output.apiKey).toBe('sk_test_1234567890'); // Not redacted in minimal
    });

    it('should apply standard preset', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = {
        email: 'john@example.com',
        phone: '555-123-4567',
        creditCard: '4242 4242 4242 4242',
        apiKey: 'sk_live_abcdefghijklmnop',
      };

      const output = redactor.redact(input) as any;

      expect(output.email).toContain('***');
      expect(output.phone).toContain('***');
      expect(output.creditCard).toContain('****');
      expect(output.apiKey).toContain('***');
    });

    it('should apply strict preset', () => {
      redactor = new Redactor({ preset: 'strict' });

      const input = {
        email: 'test@test.com',
        ip: '192.168.1.1',
        password: 'secret123',
        iban: 'GB82WEST12345698765432',
      };

      const output = redactor.redact(input) as any;

      expect(output.email).not.toBe('test@test.com');
      expect(output.ip).toContain('***');
      expect(output.password).not.toBe('secret123');
      expect(output.iban).toContain('****');
    });

    it('should apply paranoid preset', () => {
      redactor = new Redactor({ preset: 'paranoid' });

      const input = {
        dob: '01/15/1990',
        passport: 'A12345678',
        medicare: '123-45-6789A',
        anything: 'even this could be sensitive',
      };

      const output = redactor.redact(input) as any;

      expect(output.dob).toBe('**/**/****');
      expect(output.passport).toContain('*');
      expect(output.medicare).toBe('***-**-****X');
    });
  });

  describe('Credit Card Redaction', () => {
    it('should redact various credit card formats', () => {
      redactor = new Redactor({ preset: 'standard' });

      const cases = [
        { input: '4111111111111111', expectTailDigits: true },
        { input: '4111 1111 1111 1111', expectTailDigits: true },
        { input: '4111-1111-1111-1111', expectTailDigits: true },
        { input: '5500000000000004', expectTailDigits: true },
        { input: '340000000000009', expectTailDigits: true },
        { input: '30000000000004', expectTailDigits: true },
      ];

      cases.forEach(({ input, expectTailDigits }) => {
        const output = redactor.redact(input) as string;
        expect(output).toMatch(/\*+/);
        const hasTailDigits = /\d{3,4}$/.test(output);
        expect(hasTailDigits).toBe(expectTailDigits);
      });
    });

    it('should preserve format when configured', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = '4242-4242-4242-4242';
      const output = redactor.redact(input) as string;

      expect(output).toMatch(/\*{4}-\*{4}-\*{4}-4242/);
    });
  });

  describe('Email Redaction', () => {
    it('should partially mask email addresses', () => {
      redactor = new Redactor({ preset: 'standard' });

      const emails = ['john.doe@example.com', 'a@b.co', 'test+tag@domain.org'];

      emails.forEach(email => {
        const output = redactor.redact(email) as string;
        expect(output).toContain('@');
        expect(output).toContain('*');
        expect(output).not.toBe(email);
      });
    });

    it('should preserve domain in email redaction', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = 'user@example.com';
      const output = redactor.redact(input) as string;

      expect(output).toContain('@example.com');
      expect(output.split('@')[0]).toContain('*');
    });
  });

  describe('Phone Number Redaction', () => {
    it('should redact US phone numbers', () => {
      redactor = new Redactor({ preset: 'standard' });

      const phones = ['555-123-4567', '(555) 123-4567', '+1 555 123 4567', '5551234567'];

      phones.forEach(phone => {
        const output = redactor.redact(phone) as string;
        expect(output).toContain('*');
        expect(output).not.toContain('123');
        expect(output).not.toContain('4567');
      });
    });

    it('should redact international phone numbers', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = '+44 20 7946 0958';
      const output = redactor.redact(input) as string;

      expect(output).toContain('*');
      expect(output).not.toContain('7946');
    });
  });

  describe('SSN Redaction', () => {
    it('should redact SSN with dashes', () => {
      redactor = new Redactor({ preset: 'minimal' });

      const input = '123-45-6789';
      const output = redactor.redact(input) as string;

      expect(output).toBe('***-**-****');
    });

    it('should redact SSN without dashes in context', () => {
      redactor = new Redactor({ preset: 'minimal' });

      const input = { ssn: '123456789' };
      const output = redactor.redact(input) as any;

      // Context-aware redaction should catch this
      expect(output.ssn).toMatch(/\*+/);
    });
  });

  describe('API Key and Token Redaction', () => {
    it('should redact AWS keys', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = {
        accessKey: 'AKIAIOSFODNN7EXAMPLE',
        secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      };

      const output = redactor.redact(input) as any;

      expect(output.accessKey).toContain('AKIA');
      expect(output.accessKey).toContain('*');
      expect(output.secretKey).toContain('*');
    });

    it('should redact Stripe keys', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc';
      const output = redactor.redact(input) as string;

      expect(output).toContain('sk_test_');
      expect(output).toContain('*');
    });

    it('should redact JWT tokens', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const output = redactor.redact(input) as string;

      expect(output).toBe('eyJ***.***.***');
    });
  });

  describe('IP Address Redaction', () => {
    it('should redact IPv4 addresses', () => {
      redactor = new Redactor({ preset: 'strict' });

      const input = '192.168.1.100';
      const output = redactor.redact(input) as string;

      expect(output).toBe('192.***.***.***');
    });

    it('should redact IPv6 addresses', () => {
      redactor = new Redactor({ preset: 'strict' });

      const input = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      const output = redactor.redact(input) as string;

      expect(output).toContain('****');
    });
  });

  describe('Deep Object Traversal', () => {
    it('should redact nested objects', () => {
      redactor = new Redactor({ preset: 'standard', deep: true });

      const input = {
        user: {
          profile: {
            email: 'test@example.com',
            phone: '555-123-4567',
          },
          settings: {
            apiKey: 'sk_live_123456',
          },
        },
      };

      const output = redactor.redact(input) as any;

      expect(output.user.profile.email).toContain('*');
      expect(output.user.profile.phone).toContain('*');
      expect(output.user.settings.apiKey).toContain('*');
    });

    it('should respect maxDepth option', () => {
      redactor = new Redactor({ preset: 'standard', maxDepth: 2 });

      const input = {
        level1: {
          level2: {
            level3: {
              email: 'deep@example.com',
            },
          },
        },
      };

      const output = redactor.redact(input) as any;

      // Should not redact beyond maxDepth
      expect(output.level1.level2.level3.email).toBe('deep@example.com');
    });

    it('should handle arrays in objects', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = {
        emails: ['user1@example.com', 'user2@example.com'],
        cards: ['4111111111111111', '5500000000000004'],
      };

      const output = redactor.redact(input) as any;

      expect(output.emails[0]).toContain('*');
      expect(output.emails[1]).toContain('*');
      expect(output.cards[0]).toContain('*');
      expect(output.cards[1]).toContain('*');
    });
  });

  describe('Field-based Redaction', () => {
    it('should redact specified fields', () => {
      redactor = new Redactor({
        fields: ['password', 'secret', 'token'],
      });

      const input = {
        username: 'john',
        password: 'mypassword123',
        secret: 'topsecret',
        token: 'abc123',
        public: 'visible',
      };

      const output = redactor.redact(input) as any;

      expect(output.username).toBe('john');
      expect(output.password).toBe('[REDACTED]');
      expect(output.secret).toBe('[REDACTED]');
      expect(output.token).toBe('[REDACTED]');
      expect(output.public).toBe('visible');
    });

    it('should exclude specified fields from redaction', () => {
      redactor = new Redactor({
        preset: 'standard',
        excludeFields: ['publicEmail', 'displayPhone'],
      });

      const input = {
        publicEmail: 'public@example.com',
        privateEmail: 'private@example.com',
        displayPhone: '555-123-4567',
        privatePhone: '555-987-6543',
      };

      const output = redactor.redact(input) as any;

      expect(output.publicEmail).toBe('public@example.com');
      expect(output.privateEmail).toContain('*');
      expect(output.displayPhone).toBe('555-123-4567');
      expect(output.privatePhone).toContain('*');
    });
  });

  describe('Custom Patterns', () => {
    it('should apply custom patterns', () => {
      const customPattern: RedactionPattern = {
        name: 'employee-id',
        pattern: /EMP\d{6}/g,
        replacement: 'EMP******',
      };

      redactor = new Redactor({
        patterns: [customPattern],
      });

      const input = 'Employee ID: EMP123456';
      const output = redactor.redact(input) as string;

      expect(output).toBe('Employee ID: EMP******');
    });

    it('should apply function-based replacements', () => {
      const customPattern: RedactionPattern = {
        name: 'custom',
        pattern: /\b\d{3}-\d{3}\b/g,
        replacement: (match: string) => {
          const parts = match.split('-');
          return `${parts[0]}-***`;
        },
      };

      redactor = new Redactor({
        patterns: [customPattern],
      });

      const input = '123-456 and 789-012';
      const output = redactor.redact(input) as string;

      expect(output).toBe('123-*** and 789-***');
    });
  });

  describe('Redaction Strategies', () => {
    it('should hash sensitive data', () => {
      const pattern: RedactionPattern = {
        name: 'hash-test',
        pattern: /secret\d+/g,
        replacement: '',
        strategy: 'hash',
      };

      redactor = new Redactor({
        patterns: [pattern],
      });

      const input = 'secret123';
      const output = redactor.redact(input) as string;

      expect(output).toContain('[HASH:');
      expect(output).not.toContain('secret123');
    });

    it('should tokenize sensitive data', () => {
      const pattern: RedactionPattern = {
        name: 'token-test',
        pattern: /user\d+/g,
        replacement: '',
        strategy: 'tokenize',
      };

      redactor = new Redactor({
        patterns: [pattern],
        tokenSalt: 'test-salt',
      });

      const input1 = 'user123';
      const input2 = 'user123'; // Same value
      const input3 = 'user456'; // Different value

      const output1 = redactor.redact(input1) as string;
      const output2 = redactor.redact(input2) as string;
      const output3 = redactor.redact(input3) as string;

      expect(output1).toContain('[TOKEN:');
      expect(output1).toBe(output2); // Same input produces same token
      expect(output3).not.toBe(output1); // Different input produces different token
    });

    it('should truncate sensitive data', () => {
      const pattern: RedactionPattern = {
        name: 'truncate-test',
        pattern: /longvalue\w+/g,
        replacement: '',
        strategy: 'truncate',
      };

      redactor = new Redactor({
        patterns: [pattern],
      });

      const input = 'longvalue123456789';
      const output = redactor.redact(input) as string;

      expect(output).toBe('lon...');
    });

    it('should remove sensitive data', () => {
      const pattern: RedactionPattern = {
        name: 'remove-test',
        pattern: /remove\w+/g,
        replacement: '',
        strategy: 'remove',
      };

      redactor = new Redactor({
        patterns: [pattern],
      });

      const input = 'removethis';
      const output = redactor.redact(input) as string;

      expect(output).toBe('[REDACTED]');
    });
  });

  describe('LogEntry Redaction', () => {
    it('should redact LogEntry structure', () => {
      redactor = new Redactor({ preset: 'standard' });

      const entry: LogEntry = {
        id: '123',
        timestamp: 1704067200000,
        level: 'info',
        message: 'User john@example.com logged in from 192.168.1.1',
        context: {
          userId: '12345',
          sessionToken: 'sk_live_abc123',
          creditCard: '4111111111111111',
        },
        error: {
          name: 'Error',
          message: 'Failed to process card 4242424242424242',
          stack: 'Error at line with email admin@test.com',
        },
      };

      const output = redactor.redactLogEntry(entry);

      expect(output.message).toContain('*');
      // plainMessage field removed in favor of styles
      expect(output.context?.sessionToken).toContain('*');
      expect(output.context?.creditCard).toContain('*');
      expect(output.error?.message).toContain('*');
      expect(output.error?.stack).toContain('*');
    });
  });

  describe('Context-Aware Redaction', () => {
    it('should use context keywords for detection', () => {
      redactor = new Redactor({
        preset: 'minimal',
        contextAware: true,
      });

      const input = {
        random: '123456789', // Won't be redacted without context
        ssn: '123456789', // Will be redacted due to field name
      };

      const output = redactor.redact(input) as any;

      expect(output.random).toBe('123456789');
      expect(output.ssn).toBe('*********');
    });

    it('should disable context awareness when configured', () => {
      redactor = new Redactor({
        preset: 'minimal',
        contextAware: false,
      });

      const input = {
        ssn: '987654321', // 9 digits without dashes
      };

      const output = redactor.redact(input) as any;

      // Without context awareness, might not be redacted
      // depending on confidence threshold
      expect(typeof output.ssn).toBe('string');
    });
  });

  describe('Caching', () => {
    it('should cache redacted values', () => {
      redactor = new Redactor({
        preset: 'standard',
        cacheEnabled: true,
      });

      const input = 'test@example.com';

      // First call
      const output1 = redactor.redact(input);

      // Second call (should use cache)
      const output2 = redactor.redact(input);

      expect(output1).toBe(output2);

      const stats = redactor.getStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
    });

    it('should respect maxCacheSize', () => {
      redactor = new Redactor({
        preset: 'standard',
        cacheEnabled: true,
        maxCacheSize: 2,
      });

      // Add more than maxCacheSize items
      redactor.redact('email1@test.com');
      redactor.redact('email2@test.com');
      redactor.redact('email3@test.com');

      const stats = redactor.getStats();
      expect(stats.cacheSize).toBeLessThanOrEqual(2);
    });
  });

  describe('Audit Trail', () => {
    it('should maintain audit trail when enabled', () => {
      redactor = new Redactor({
        preset: 'standard',
        auditTrail: true,
      });

      const input = {
        email: 'test@example.com',
        phone: '555-123-4567',
      };

      redactor.redact(input);

      const auditLog = redactor.getAuditTrail();
      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[0]).toHaveProperty('timestamp');
      expect(auditLog[0]).toHaveProperty('pattern');
      expect(auditLog[0]).toHaveProperty('original');
      expect(auditLog[0]).toHaveProperty('redacted');
    });
  });

  describe('Statistics', () => {
    it('should track redaction statistics', () => {
      redactor = new Redactor({ preset: 'standard' });

      const input = {
        email: 'test@example.com',
        phone: '555-123-4567',
        card: '4111111111111111',
      };

      redactor.redact(input);

      const stats = redactor.getStats();
      expect(stats.totalRedactions).toBeGreaterThan(0);
      expect(stats.patternHits.size).toBeGreaterThan(0);
      expect(stats.fieldRedactions.size).toBeGreaterThan(0);
    });
  });

  describe('Pattern Management', () => {
    it('should add custom patterns dynamically', () => {
      redactor = new Redactor();

      const pattern: RedactionPattern = {
        name: 'custom-id',
        pattern: /ID\d{4}/g,
        replacement: 'ID****',
      };

      redactor.addPattern(pattern);

      const input = 'User ID1234';
      const output = redactor.redact(input) as string;

      expect(output).toBe('User ID****');
    });

    it('should remove patterns by name', () => {
      const pattern: RedactionPattern = {
        name: 'removable',
        pattern: /test\d+/g,
        replacement: '***',
      };

      redactor = new Redactor({
        patterns: [pattern],
      });

      redactor.removePattern('removable');

      const input = 'test123';
      const output = redactor.redact(input) as string;

      expect(output).toBe('test123');
    });
  });

  describe('Token Import/Export', () => {
    it('should export and import token maps', () => {
      const pattern: RedactionPattern = {
        name: 'token-test',
        pattern: /token\d+/g,
        replacement: '',
        strategy: 'tokenize',
      };

      const redactor1 = new Redactor({
        patterns: [pattern],
      });

      // Generate tokens
      redactor1.redact('token123');
      redactor1.redact('token456');

      // Export tokens
      const exportedTokens = redactor1.exportTokens();
      expect(exportedTokens.size).toBe(2);

      // Import into new redactor
      const redactor2 = new Redactor({
        patterns: [pattern],
      });

      redactor2.importTokens(exportedTokens);

      // Should produce same tokens
      const output = redactor2.redact('token123') as string;
      expect(output).toContain('[TOKEN:');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset cache and statistics', () => {
      redactor = new Redactor({
        preset: 'standard',
        auditTrail: true,
      });

      // Generate some data
      redactor.redact('test@example.com');
      redactor.redact('555-123-4567');

      const statsBefore = redactor.getStats();
      expect(statsBefore.totalRedactions).toBeGreaterThan(0);
      expect(statsBefore.cacheSize).toBeGreaterThan(0);

      // Reset
      redactor.reset();

      const statsAfter = redactor.getStats();
      expect(statsAfter.totalRedactions).toBe(0);
      expect(statsAfter.cacheSize).toBe(0);
      expect(statsAfter.patternHits.size).toBe(0);
      expect(redactor.getAuditTrail().length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values', () => {
      redactor = new Redactor({ preset: 'standard' });

      expect(redactor.redact(null)).toBeNull();
      expect(redactor.redact(undefined)).toBeUndefined();
    });

    it('should handle numbers and booleans', () => {
      redactor = new Redactor({ preset: 'standard' });

      expect(redactor.redact(123)).toBe(123);
      expect(redactor.redact(true)).toBe(true);
      expect(redactor.redact(false)).toBe(false);
    });

    it('should handle empty strings and objects', () => {
      redactor = new Redactor({ preset: 'standard' });

      expect(redactor.redact('')).toBe('');
      expect(redactor.redact({})).toEqual({});
      expect(redactor.redact([])).toEqual([]);
    });

    it('should handle circular references', () => {
      redactor = new Redactor({ preset: 'standard' });

      const obj: any = { name: 'test' };
      obj.self = obj; // Circular reference

      // Should not throw
      expect(() => redactor.redact(obj)).not.toThrow();
    });

    it('should handle very deep nesting', () => {
      redactor = new Redactor({ preset: 'standard', maxDepth: 3 });

      const createNested = (depth: number): any => {
        if (depth === 0) return { email: 'deep@test.com' };
        return { level: createNested(depth - 1) };
      };

      const input = createNested(5);
      const output = redactor.redact(input) as any;

      // Should stop at maxDepth
      expect(output.level.level.level.email).toBe('deep@test.com');
    });
  });

  describe('Disabled Redactor', () => {
    it('should not redact when disabled', () => {
      redactor = new Redactor({
        enabled: false,
        preset: 'strict',
      });

      const input = {
        email: 'test@example.com',
        ssn: '123-45-6789',
        creditCard: '4111111111111111',
      };

      const output = redactor.redact(input) as any;

      expect(output).toEqual(input);
    });
  });

  describe('Banking Information', () => {
    it('should redact IBAN numbers', () => {
      redactor = new Redactor({ preset: 'strict' });

      const input = 'GB82WEST12345698765432';
      const output = redactor.redact(input) as string;

      expect(output).toContain('GB82');
      expect(output).toContain('*');
    });

    it('should redact routing numbers in context', () => {
      redactor = new Redactor({ preset: 'strict' });

      const input = {
        routingNumber: '123456789',
        random: '987654321',
      };

      const output = redactor.redact(input) as any;

      expect(output.routingNumber).toBe('*********');
      // Random 9-digit number without context might not be redacted
      expect(output.random).toBeDefined();
    });
  });

  describe('Health Information', () => {
    it('should redact Medicare numbers', () => {
      redactor = new Redactor({ preset: 'paranoid' });

      const input = '123-45-6789A';
      const output = redactor.redact(input) as string;

      expect(output).toBe('***-**-****X');
    });

    it('should redact health insurance IDs', () => {
      redactor = new Redactor({ preset: 'paranoid' });

      const input = {
        insuranceId: 'ABC123456789',
        memberId: 'XYZ987654321',
      };

      const output = redactor.redact(input) as any;

      expect(output.insuranceId).toContain('*');
    });
  });

  describe('Personal Information', () => {
    it('should redact dates of birth', () => {
      redactor = new Redactor({ preset: 'paranoid' });

      const dates = ['01/15/1990', '12-25-1985', '03/30/2000'];

      dates.forEach(date => {
        const output = redactor.redact(date) as string;
        expect(output).toBe('**/**/****');
      });
    });

    it('should redact passport numbers', () => {
      redactor = new Redactor({ preset: 'paranoid' });

      const input = {
        passport: 'A12345678',
      };

      const output = redactor.redact(input) as any;

      expect(output.passport).toContain('*');
    });

    it('should redact driver license numbers', () => {
      redactor = new Redactor({ preset: 'paranoid' });

      const input = {
        driverLicense: 'D1234567',
      };

      const output = redactor.redact(input) as any;

      expect(output.driverLicense).toContain('*');
    });
  });

  describe('Password and Secret Redaction', () => {
    it('should redact password fields in various formats', () => {
      redactor = new Redactor({ preset: 'strict' });

      const inputs = [
        'password: secret123',
        'pwd=mypassword',
        'secret: "topsecret"',
        "apikey='sk_live_123'",
      ];

      inputs.forEach(input => {
        const output = redactor.redact(input) as string;
        expect(output).toContain('***');
        expect(output).not.toContain('secret123');
        expect(output).not.toContain('mypassword');
        expect(output).not.toContain('topsecret');
      });
    });
  });

  describe('createRedactorPreset Helper', () => {
    it('should create redactor with preset', () => {
      const redactor = createRedactorPreset('strict');

      const input = 'Email: test@example.com';
      const output = redactor.redact(input) as string;

      expect(output).toContain('*');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed content with multiple PII types', () => {
      redactor = new Redactor({ preset: 'strict' });

      const input = `
        User Profile:
        Name: John Doe
        Email: john.doe@example.com
        Phone: 555-123-4567
        SSN: 123-45-6789
        Credit Card: 4111-1111-1111-1111
        IP Address: 192.168.1.100
        API Key: sk_live_abcdef123456
      `;

      const output = redactor.redact(input) as string;

      expect(output).toContain('John Doe'); // Name not redacted
      expect(output).not.toContain('john.doe@example.com');
      expect(output).not.toContain('555-123-4567');
      expect(output).not.toContain('123-45-6789');
      expect(output).toContain('****-1111');
      expect(output).toContain('192.***');
      expect(output).toContain('sk_live_');
      expect(output).toContain('*');
    });

    it('should handle JSON strings', () => {
      redactor = new Redactor({ preset: 'standard' });

      const jsonString = JSON.stringify({
        user: {
          email: 'test@example.com',
          creditCard: '4242424242424242',
        },
      });

      const output = redactor.redact(jsonString) as string;
      const parsed = JSON.parse(output);

      expect(parsed.user.email).not.toBe('test@example.com');
      expect(parsed.user.creditCard).toContain('*');
    });
  });
});
