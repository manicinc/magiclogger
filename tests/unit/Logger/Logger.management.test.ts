/**
 * Tests for Logger Management Methods
 * 
 * This test suite covers all the new management methods added to the Logger class:
 * - Context management (getContext, setContext, addContext)
 * - Tag management (getTags, setTags, addTags) 
 * - Level management (getLevel, setLevel, isLevelEnabled)
 * - Identity methods (getId, getBindings)
 * 
 * These methods provide runtime state management and introspection capabilities
 * essential for cloud logging and enterprise use cases.
 */

import { Logger } from '../../../src/Logger';
import type { LogLevel } from '../../../src/types';

describe('Logger Management Methods', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  afterEach(() => {
    if (logger && typeof logger.close === 'function') {
      logger.close();
    }
  });

  // ============================================================================
  // CONTEXT MANAGEMENT TESTS
  // ============================================================================
  
  describe('Context Management', () => {
    describe('getContext()', () => {
      it('should return undefined when no context is set', () => {
        expect(logger.getContext()).toBeUndefined();
      });

      it('should return the initial context when set in constructor', () => {
        const initialContext = { service: 'api', version: '1.0.0' };
        const contextLogger = new Logger({ context: initialContext });
        
        expect(contextLogger.getContext()).toEqual(initialContext);
        contextLogger.close();
      });
    });

    describe('setContext()', () => {
      it('should set a new context', () => {
        const context = { userId: 'user123', sessionId: 'session456' };
        
        logger.setContext(context);
        
        expect(logger.getContext()).toEqual(context);
      });

      it('should replace existing context', () => {
        const initialContext = { service: 'api' };
        const newContext = { userId: 'user123' };
        
        logger.setContext(initialContext);
        logger.setContext(newContext);
        
        expect(logger.getContext()).toEqual(newContext);
        expect(logger.getContext()).not.toEqual(initialContext);
      });

      it('should handle empty object context', () => {
        logger.setContext({});
        
        expect(logger.getContext()).toEqual({});
      });

      it('should handle complex nested context', () => {
        const complexContext = {
          user: {
            id: 'user123',
            profile: {
              name: 'John Doe',
              roles: ['admin', 'user']
            }
          },
          request: {
            id: 'req456',
            timestamp: Date.now()
          }
        };
        
        logger.setContext(complexContext);
        
        expect(logger.getContext()).toEqual(complexContext);
      });
    });

    describe('addContext()', () => {
      it('should add context to empty logger', () => {
        const context = { userId: 'user123' };
        
        logger.addContext(context);
        
        expect(logger.getContext()).toEqual(context);
      });

      it('should merge with existing context', () => {
        const initialContext = { service: 'api', version: '1.0.0' };
        const additionalContext = { userId: 'user123', sessionId: 'session456' };
        
        logger.setContext(initialContext);
        logger.addContext(additionalContext);
        
        expect(logger.getContext()).toEqual({
          ...initialContext,
          ...additionalContext
        });
      });

      it('should override existing keys', () => {
        const initialContext = { service: 'api', version: '1.0.0' };
        const updateContext = { version: '2.0.0', userId: 'user123' };
        
        logger.setContext(initialContext);
        logger.addContext(updateContext);
        
        expect(logger.getContext()).toEqual({
          service: 'api',
          version: '2.0.0',
          userId: 'user123'
        });
      });

      it('should handle nested object merging', () => {
        const initialContext = { 
          user: { id: 'user123', name: 'John' },
          request: { id: 'req456' }
        };
        const additionalContext = { 
          user: { email: 'john@example.com' },
          session: { id: 'session789' }
        };
        
        logger.setContext(initialContext);
        logger.addContext(additionalContext);
        
        // Note: This is shallow merge behavior
        expect(logger.getContext()).toEqual({
          user: { email: 'john@example.com' }, // Overrides entire user object
          request: { id: 'req456' },
          session: { id: 'session789' }
        });
      });
    });
  });

  // ============================================================================
  // TAG MANAGEMENT TESTS  
  // ============================================================================

  describe('Tag Management', () => {
    describe('getTags()', () => {
      it('should return undefined when no tags are set', () => {
        expect(logger.getTags()).toBeUndefined();
      });

      it('should return initial tags when set in constructor', () => {
        const initialTags = ['api', 'production', 'critical'];
        const taggedLogger = new Logger({ tags: initialTags });
        
        expect(taggedLogger.getTags()).toEqual(initialTags);
        taggedLogger.close();
      });
    });

    describe('setTags()', () => {
      it('should set new tags', () => {
        const tags = ['api', 'auth', 'security'];
        
        logger.setTags(tags);
        
        expect(logger.getTags()).toEqual(tags);
      });

      it('should replace existing tags', () => {
        const initialTags = ['api', 'v1'];
        const newTags = ['database', 'query'];
        
        logger.setTags(initialTags);
        logger.setTags(newTags);
        
        expect(logger.getTags()).toEqual(newTags);
        expect(logger.getTags()).not.toEqual(initialTags);
      });

      it('should handle empty tags array', () => {
        logger.setTags([]);
        
        expect(logger.getTags()).toEqual([]);
      });

      it('should preserve tag order', () => {
        const orderedTags = ['first', 'second', 'third'];
        
        logger.setTags(orderedTags);
        
        expect(logger.getTags()).toEqual(orderedTags);
      });
    });

    describe('addTags()', () => {
      it('should add tags to empty logger', () => {
        const tags = ['api', 'auth'];
        
        logger.addTags(tags);
        
        expect(logger.getTags()).toEqual(tags);
      });

      it('should merge with existing tags', () => {
        const initialTags = ['api', 'v1'];
        const additionalTags = ['auth', 'security'];
        
        logger.setTags(initialTags);
        logger.addTags(additionalTags);
        
        expect(logger.getTags()).toEqual([...initialTags, ...additionalTags]);
      });

      it('should deduplicate tags', () => {
        const initialTags = ['api', 'v1', 'auth'];
        const duplicateTags = ['auth', 'security', 'api'];
        
        logger.setTags(initialTags);
        logger.addTags(duplicateTags);
        
        const result = logger.getTags();
        expect(result).toContain('api');
        expect(result).toContain('v1');
        expect(result).toContain('auth');
        expect(result).toContain('security');
        expect(result?.length).toBe(4); // No duplicates
      });

      it('should maintain uniqueness across multiple adds', () => {
        logger.addTags(['api', 'v1']);
        logger.addTags(['api', 'v2']); // 'api' should not be duplicated
        logger.addTags(['auth', 'v1']); // 'v1' should not be duplicated
        
        const result = logger.getTags();
        expect(result).toEqual(expect.arrayContaining(['api', 'v1', 'v2', 'auth']));
        expect(result?.length).toBe(4);
      });

      it('should handle empty array addition', () => {
        const initialTags = ['api', 'auth'];
        
        logger.setTags(initialTags);
        logger.addTags([]);
        
        expect(logger.getTags()).toEqual(initialTags);
      });
    });
  });

  // ============================================================================
  // LEVEL MANAGEMENT TESTS
  // ============================================================================

  describe('Level Management', () => {
    describe('getLevel()', () => {
      it('should return undefined when no level is explicitly set', () => {
        expect(logger.getLevel()).toBeUndefined();
      });

      it('should return the level set in constructor', () => {
        const levelLogger = new Logger({ level: 'warn' });
        
        expect(levelLogger.getLevel()).toBe('warn');
        levelLogger.close();
      });
    });

    describe('setLevel()', () => {
      it('should set log level', () => {
        logger.setLevel('error');
        
        expect(logger.getLevel()).toBe('error');
      });

      it('should update existing level', () => {
        logger.setLevel('info');
        logger.setLevel('debug');
        
        expect(logger.getLevel()).toBe('debug');
      });

      it('should handle all valid log levels', () => {
        const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
        
        for (const level of levels) {
          logger.setLevel(level);
          expect(logger.getLevel()).toBe(level);
        }
      });
    });

    describe('isLevelEnabled()', () => {
      it('should return true for all levels when no level is set (defaults to info)', () => {
        // When no level is set, it should default to 'info' behavior
        expect(logger.isLevelEnabled('info')).toBe(true);
        expect(logger.isLevelEnabled('warn')).toBe(true);
        expect(logger.isLevelEnabled('error')).toBe(true);
        expect(logger.isLevelEnabled('fatal')).toBe(true);
      });

      it('should respect level hierarchy', () => {
        logger.setLevel('warn');
        
        expect(logger.isLevelEnabled('trace')).toBe(false);
        expect(logger.isLevelEnabled('debug')).toBe(false);
        expect(logger.isLevelEnabled('info')).toBe(false);
        expect(logger.isLevelEnabled('warn')).toBe(true);
        expect(logger.isLevelEnabled('error')).toBe(true);
        expect(logger.isLevelEnabled('fatal')).toBe(true);
      });

      it('should handle trace level (most verbose)', () => {
        logger.setLevel('trace');
        
        const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
        for (const level of levels) {
          expect(logger.isLevelEnabled(level)).toBe(true);
        }
      });

      it('should handle fatal level (least verbose)', () => {
        logger.setLevel('fatal');
        
        expect(logger.isLevelEnabled('trace')).toBe(false);
        expect(logger.isLevelEnabled('debug')).toBe(false);
        expect(logger.isLevelEnabled('info')).toBe(false);
        expect(logger.isLevelEnabled('warn')).toBe(false);
        expect(logger.isLevelEnabled('error')).toBe(false);
        expect(logger.isLevelEnabled('fatal')).toBe(true);
      });

      it('should handle each level correctly', () => {
        const levelHierarchy = [
          {
            level: 'debug' as LogLevel,
            enabled: ['debug', 'info', 'warn', 'error', 'fatal'],
            disabled: ['trace']
          },
          {
            level: 'info' as LogLevel,
            enabled: ['info', 'warn', 'error', 'fatal'],
            disabled: ['trace', 'debug']
          },
          {
            level: 'error' as LogLevel,
            enabled: ['error', 'fatal'],
            disabled: ['trace', 'debug', 'info', 'warn']
          }
        ];

        for (const { level, enabled, disabled } of levelHierarchy) {
          logger.setLevel(level);
          
          for (const enabledLevel of enabled) {
            expect(logger.isLevelEnabled(enabledLevel as LogLevel)).toBe(true);
          }
          
          for (const disabledLevel of disabled) {
            expect(logger.isLevelEnabled(disabledLevel as LogLevel)).toBe(false);
          }
        }
      });
    });
  });

  // ============================================================================
  // IDENTITY METHODS TESTS
  // ============================================================================

  describe('Identity Methods', () => {
    describe('getId()', () => {
      it('should return undefined when no ID is set', () => {
        expect(logger.getId()).toBeUndefined();
      });

      it('should return the ID set in constructor', () => {
        const id = 'test-logger-123';
        const idLogger = new Logger({ id });
        
        expect(idLogger.getId()).toBe(id);
        idLogger.close();
      });
    });

    describe('getBindings()', () => {
      it('should return empty object when no context, id, or tags are set', () => {
        expect(logger.getBindings()).toEqual({});
      });

      it('should include context in bindings', () => {
        const context = { service: 'api', version: '1.0.0' };
        logger.setContext(context);
        
        const bindings = logger.getBindings();
        expect(bindings).toEqual(context);
      });

      it('should include logger ID in bindings', () => {
        const id = 'test-logger';
        const idLogger = new Logger({ id });
        
        const bindings = idLogger.getBindings();
        expect(bindings).toEqual({ loggerId: id });
        
        idLogger.close();
      });

      it('should include tags in bindings', () => {
        const tags = ['api', 'production'];
        logger.setTags(tags);
        
        const bindings = logger.getBindings();
        expect(bindings).toEqual({ tags });
      });

      it('should combine all available metadata', () => {
        const id = 'comprehensive-logger';
        const context = { service: 'api', version: '2.0.0' };
        const tags = ['production', 'critical'];
        
        const comprehensiveLogger = new Logger({ id, context, tags });
        
        const bindings = comprehensiveLogger.getBindings();
        expect(bindings).toEqual({
          ...context,
          loggerId: id,
          tags
        });
        
        comprehensiveLogger.close();
      });

      it('should reflect runtime changes', () => {
        const logger = new Logger({ id: 'dynamic-logger' });
        
        // Initial state
        expect(logger.getBindings()).toEqual({ loggerId: 'dynamic-logger' });
        
        // Add context
        logger.setContext({ env: 'test' });
        expect(logger.getBindings()).toEqual({ 
          env: 'test', 
          loggerId: 'dynamic-logger' 
        });
        
        // Add tags
        logger.setTags(['integration']);
        expect(logger.getBindings()).toEqual({ 
          env: 'test', 
          loggerId: 'dynamic-logger',
          tags: ['integration']
        });
        
        // Update context
        logger.addContext({ userId: 'user123' });
        expect(logger.getBindings()).toEqual({ 
          env: 'test',
          userId: 'user123',
          loggerId: 'dynamic-logger',
          tags: ['integration']
        });
        
        logger.close();
      });

      it('should handle context overriding logger ID key', () => {
        const id = 'original-id';
        const context = { loggerId: 'context-id', service: 'api' };
        
        const logger = new Logger({ id });
        logger.setContext(context);
        
        const bindings = logger.getBindings();
        // Logger ID should be applied after context, so it should override
        expect(bindings.loggerId).toBe(id);
        expect(bindings.service).toBe('api');
        
        logger.close();
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Method Integration', () => {
    it('should maintain state consistency across method calls', () => {
      const logger = new Logger();
      
      // Set initial state
      logger.setLevel('warn');
      logger.setContext({ service: 'test' });
      logger.setTags(['integration']);
      
      // Verify state
      expect(logger.getLevel()).toBe('warn');
      expect(logger.getContext()).toEqual({ service: 'test' });
      expect(logger.getTags()).toEqual(['integration']);
      
      // Modify state
      logger.addContext({ version: '1.0.0' });
      logger.addTags(['api']);
      logger.setLevel('debug');
      
      // Verify updated state
      expect(logger.getLevel()).toBe('debug');
      expect(logger.getContext()).toEqual({ service: 'test', version: '1.0.0' });
      expect(logger.getTags()).toEqual(['integration', 'api']);
      
      // Verify bindings reflect all changes
      const bindings = logger.getBindings();
      expect(bindings).toEqual({
        service: 'test',
        version: '1.0.0',
        tags: ['integration', 'api']
      });
      
      logger.close();
    });

    it('should work with child loggers', () => {
      const parent = new Logger({ 
        id: 'parent',
        context: { service: 'api' },
        tags: ['parent']
      });
      
      // Verify parent state
      expect(parent.getBindings()).toEqual({
        service: 'api',
        loggerId: 'parent',
        tags: ['parent']
      });
      
      // Create child logger
      const child = parent.child({ 
        id: 'child',
        context: { component: 'auth' },
        tags: ['child']
      });
      
      // Child should inherit and extend parent state
      const childBindings = child.getBindings();
      expect(childBindings).toEqual({
        service: 'api',      // Inherited from parent
        component: 'auth',   // Added by child
        loggerId: 'child',   // Child's own ID
        tags: ['child']      // Child's own tags (note: tag inheritance may vary by implementation)
      });
      
      parent.close();
      child.close();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      // These should not throw
      expect(() => {
        logger.setContext(null as any);
        logger.setTags(null as any);
      }).not.toThrow();
      
      // Methods should still work after null values
      logger.setContext({ recovered: true });
      expect(logger.getContext()).toEqual({ recovered: true });
    });

    it('should handle circular references in context', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      // Should not throw when setting circular context
      expect(() => {
        logger.setContext(circularObj);
      }).not.toThrow();
      
      // getContext should return the object (handling of circular refs depends on implementation)
      expect(logger.getContext()).toBeDefined();
    });
  });
});