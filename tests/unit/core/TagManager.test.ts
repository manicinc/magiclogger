// File: tests/unit/core/TagManager.test.ts

import { TagManager, TagManagerOptions, TagNormalizationRules, TagValidationRules } from '../../../src/core/TagManager';
import { EventEmitter } from 'events';

describe('TagManager', () => {
  let tagManager: TagManager;

  beforeEach(() => {
    tagManager = new TagManager();
  });

  afterEach(() => {
    tagManager.destroy();
  });

  describe('Constructor', () => {
    it('should create with default options', () => {
      const manager = new TagManager();
      expect(manager).toBeInstanceOf(EventEmitter);
    });

    it('should create with custom options', () => {
      const options: TagManagerOptions = {
        maxTags: 20,
        maxTagLength: 30,
        autoNormalize: false,
        separator: ';',
        enableValidation: false
      };
      
      const manager = new TagManager(options);
      expect(manager).toBeDefined();
    });
  });

  describe('normalize()', () => {
    it('should normalize single tag', () => {
      const normalized = tagManager.normalize('Test Tag');
      expect(normalized).toEqual(['test-tag']);
    });

    it('should normalize array of tags', () => {
      const normalized = tagManager.normalize(['API', 'User Login', 'v2.0']);
      expect(normalized).toEqual(['api', 'user-login', 'v2-0']);
    });

    it('should remove duplicates', () => {
      const normalized = tagManager.normalize(['test', 'TEST', 'Test']);
      expect(normalized).toEqual(['test']);
    });

    it('should respect maxTags limit', () => {
      const manager = new TagManager({ maxTags: 3 });
      const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
      
      const listener = jest.fn();
      manager.on('tagsLimitExceeded', listener);
      
      const normalized = manager.normalize(tags);
      
      expect(normalized).toEqual(['tag1', 'tag2', 'tag3']);
      expect(listener).toHaveBeenCalledWith({
        original: 5,
        limited: 3
      });
    });

    it('should respect maxTagLength', () => {
      const manager = new TagManager({ maxTagLength: 5 });
      const normalized = manager.normalize('verylongtag');
      
      expect(normalized).toEqual(['veryl']);
    });

    it('should skip normalization when autoNormalize is false', () => {
      const manager = new TagManager({ autoNormalize: false });
      const tags = ['Test Tag', 'UPPERCASE'];
      
      const normalized = manager.normalize(tags);
      expect(normalized).toEqual(tags);
    });

    it('should apply all normalization rules', () => {
      const tags = [
        '  Spaces Around  ',
        'Special!@#Characters',
        'UPPERCASE',
        'under_score',
        'already-normalized'
      ];
      
      const normalized = tagManager.normalize(tags);
      
      expect(normalized).toEqual([
        'spaces-around',
        'specialcharacters',
        'uppercase',
        'under-score',
        'already-normalized'
      ]);
    });

    it('should handle aliases', () => {
      tagManager.addAlias('js', 'javascript');
      tagManager.addAlias('ts', 'typescript');
      
      const normalized = tagManager.normalize(['js', 'ts', 'react']);
      
      expect(normalized).toEqual(['javascript', 'typescript', 'react']);
    });
  });

  describe('setNormalizationRules()', () => {
    it('should update normalization rules', () => {
      const rules: TagNormalizationRules = {
        toLowerCase: false,
        trim: true,
        replaceSpaces: false,
        removeSpecialChars: false
      };
      
      tagManager.setNormalizationRules(rules);
      
      const normalized = tagManager.normalize('Test Tag!');
      expect(normalized).toEqual(['Test Tag!']);
    });

    it('should apply custom normalization function', () => {
      const rules: TagNormalizationRules = {
        custom: (tag) => tag.toUpperCase().replace(/\s/g, '_')
      };
      
      tagManager.setNormalizationRules(rules);
      
      const normalized = tagManager.normalize('test tag');
      expect(normalized).toEqual(['TEST_TAG']);
    });

    it('should emit normalizationRulesUpdated event', () => {
      const listener = jest.fn();
      tagManager.on('normalizationRulesUpdated', listener);
      
      const rules: TagNormalizationRules = { toLowerCase: false };
      tagManager.setNormalizationRules(rules);
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('validate()', () => {
    it('should validate tag length', () => {
      const rules: TagValidationRules = {
        minLength: 3,
        maxLength: 10
      };
      
      tagManager.setValidationRules(rules);
      
      const result1 = tagManager.validate(['good', 'toolong12345', 'ok']);
      expect(result1.valid).toBe(false);
      expect(result1.invalid).toContain('ok'); // too short
      expect(result1.invalid).toContain('toolong12345'); // too long
      
      const result2 = tagManager.validate(['good', 'valid', 'correct']);
      expect(result2.valid).toBe(true);
    });

    it('should validate tag pattern', () => {
      const rules: TagValidationRules = {
        pattern: /^[a-z]+$/
      };
      
      tagManager.setValidationRules(rules);
      
      const result = tagManager.validate(['valid', 'INVALID', '123', 'has-dash']);
      
      expect(result.valid).toBe(false);
      expect(result.invalid).toEqual(['INVALID', '123', 'has-dash']);
      expect(result.errors).toBeDefined();
      expect(result.errors?.['INVALID']).toContain('Tag contains invalid characters');
    });

    it('should check reserved tags', () => {
      const rules: TagValidationRules = {
        reserved: ['admin', 'system', 'internal']
      };
      
      tagManager.setValidationRules(rules);
      
      const result = tagManager.validate(['user', 'admin', 'public']);
      
      expect(result.valid).toBe(false);
      expect(result.invalid).toContain('admin');
      expect(result.errors).toBeDefined();
      expect(result.errors?.['admin']).toContain('Tag is reserved');
    });

    it('should run custom validation', () => {
      const rules: TagValidationRules = {
        custom: (tag) => !tag.startsWith('_')
      };
      
      tagManager.setValidationRules(rules);
      
      const result = tagManager.validate(['valid', '_invalid']);
      
      expect(result.valid).toBe(false);
      expect(result.invalid).toContain('_invalid');
    });

    it('should handle validation errors', () => {
      const rules: TagValidationRules = {
        custom: () => {
          throw new Error('Validation failed');
        }
      };
      
      tagManager.setValidationRules(rules);
      
      const result = tagManager.validate(['test']);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.['test']).toContain('Validation error: Error: Validation failed');
    });

    it('should skip validation when disabled', () => {
      const manager = new TagManager({ enableValidation: false });
      
      manager.setValidationRules({
        minLength: 100 // Would fail all tags
      });
      
      const result = manager.validate(['a', 'b']);
      expect(result.valid).toBe(true);
    });
  });

  describe('extract()', () => {
    it('should extract hashtags from text', () => {
      const text = 'Fixed #bug in #authentication flow #v2';
      const extracted = tagManager.extract(text);
      
      expect(extracted).toEqual(['bug', 'authentication', 'v2']);
    });

    it('should use custom pattern', () => {
      const text = 'Tags: @user @admin @moderator';
      const extracted = tagManager.extract(text, {
        pattern: /@(\w+)/g
      });
      
      expect(extracted).toEqual(['user', 'admin', 'moderator']);
    });

    it('should respect maxExtract limit', () => {
      const text = '#one #two #three #four #five';
      const extracted = tagManager.extract(text, { maxExtract: 3 });
      
      expect(extracted).toEqual(['one', 'two', 'three']);
    });

    it('should normalize extracted tags when autoNormalize is true', () => {
      const text = '#BUG #User_Login #NEW-FEATURE';
      const extracted = tagManager.extract(text);
      
      expect(extracted).toEqual(['bug', 'user-login', 'new-feature']);
    });

    it('should not normalize when autoNormalize is false', () => {
      const manager = new TagManager({ autoNormalize: false });
      const text = '#BUG #User_Login';
      
      const extracted = manager.extract(text);
      expect(extracted).toEqual(['BUG', 'User_Login']);
    });

    it('should handle no matches', () => {
      const text = 'No tags in this text';
      const extracted = tagManager.extract(text);
      
      expect(extracted).toEqual([]);
    });

    it('should reset regex state between calls', () => {
      const pattern = /#(\w+)/g;
      
      // First extraction
      tagManager.extract('#tag1 #tag2', { pattern });
      
      // Second extraction should work correctly
      const result = tagManager.extract('#tag3 #tag4', { pattern });
      
      expect(result).toEqual(['tag3', 'tag4']);
    });
  });

  describe('filter()', () => {
    it('should filter by include list', () => {
      const tags = ['api', 'user', 'admin', 'public'];
      const filtered = tagManager.filter(tags, {
        include: ['api', 'admin']
      });
      
      expect(filtered).toEqual(['api', 'admin']);
    });

    it('should filter by exclude list', () => {
      const tags = ['api', 'user', 'admin', 'public'];
      const filtered = tagManager.filter(tags, {
        exclude: ['admin', 'user']
      });
      
      expect(filtered).toEqual(['api', 'public']);
    });

    it('should filter by pattern', () => {
      const tags = ['api-v1', 'api-v2', 'user', 'api-beta'];
      const filtered = tagManager.filter(tags, {
        pattern: /^api-/
      });
      
      expect(filtered).toEqual(['api-v1', 'api-v2', 'api-beta']);
    });

    it('should apply custom filter', () => {
      const tags = ['short', 'medium', 'very-long-tag'];
      const filtered = tagManager.filter(tags, {
        custom: (tag) => tag.length > 5
      });
      
      expect(filtered).toEqual(['medium', 'very-long-tag']);
    });

    it('should combine multiple filters', () => {
      const tags = ['api', 'api-v1', 'api-v2', 'user', 'admin'];
      const filtered = tagManager.filter(tags, {
        include: ['api', 'api-v1', 'api-v2', 'admin'],
        exclude: ['admin'],
        pattern: /^api/
      });
      
      expect(filtered).toEqual(['api', 'api-v1', 'api-v2']);
    });
  });

  describe('matches()', () => {
    it('should match with any mode', () => {
      const tags = ['api', 'user', 'production'];
      
      expect(tagManager.matches(tags, {
        mode: 'any',
        tags: ['api', 'staging']
      })).toBe(true);
      
      expect(tagManager.matches(tags, {
        mode: 'any',
        tags: ['staging', 'test']
      })).toBe(false);
    });

    it('should match with all mode', () => {
      const tags = ['api', 'user', 'production'];
      
      expect(tagManager.matches(tags, {
        mode: 'all',
        tags: ['api', 'user']
      })).toBe(true);
      
      expect(tagManager.matches(tags, {
        mode: 'all',
        tags: ['api', 'staging']
      })).toBe(false);
    });

    it('should match with exact mode', () => {
      const tags = ['api', 'user'];
      
      expect(tagManager.matches(tags, {
        mode: 'exact',
        tags: ['user', 'api'] // Order doesn't matter
      })).toBe(true);
      
      expect(tagManager.matches(tags, {
        mode: 'exact',
        tags: ['api', 'user', 'extra']
      })).toBe(false);
    });

    it('should handle case sensitivity', () => {
      const tags = ['API', 'User'];
      
      expect(tagManager.matches(tags, {
        tags: ['api', 'user'],
        caseSensitive: false
      })).toBe(true);
      
      expect(tagManager.matches(tags, {
        tags: ['api', 'user'],
        caseSensitive: true
      })).toBe(false);
    });
  });

  describe('merge()', () => {
    it('should merge multiple tag arrays', () => {
      const merged = tagManager.merge(
        ['tag1', 'tag2'],
        ['tag2', 'tag3'],
        ['tag4']
      );
      
      expect(merged).toEqual(['tag1', 'tag2', 'tag3', 'tag4']);
    });

    it('should handle undefined arrays', () => {
      const merged = tagManager.merge(
        ['tag1'],
        undefined,
        ['tag2'],
        undefined
      );
      
      expect(merged).toEqual(['tag1', 'tag2']);
    });

    it('should normalize merged tags when autoNormalize is true', () => {
      const merged = tagManager.merge(
        ['Tag One'],
        ['TAG-TWO'],
        ['tag_three']
      );
      
      expect(merged).toEqual(['tag-one', 'tag-two', 'tag-three']);
    });

    it('should handle empty arrays', () => {
      const merged = tagManager.merge([], ['tag1'], []);
      expect(merged).toEqual(['tag1']);
    });
  });

  describe('Aliases', () => {
    it('should add and use aliases', () => {
      tagManager.addAlias('js', 'javascript');
      
      const normalized = tagManager.normalize('js');
      expect(normalized).toEqual(['javascript']);
    });

    it('should remove aliases', () => {
      tagManager.addAlias('js', 'javascript');
      tagManager.removeAlias('js');
      
      const normalized = tagManager.normalize('js');
      expect(normalized).toEqual(['js']);
    });

    it('should get all aliases', () => {
      tagManager.addAlias('js', 'javascript');
      tagManager.addAlias('ts', 'typescript');
      
      const aliases = tagManager.getAliases();
      
      expect(aliases.get('js')).toBe('javascript');
      expect(aliases.get('ts')).toBe('typescript');
      expect(aliases.size).toBe(2);
    });

    it('should emit alias events', () => {
      const addListener = jest.fn();
      const removeListener = jest.fn();
      
      tagManager.on('aliasAdded', addListener);
      tagManager.on('aliasRemoved', removeListener);
      
      tagManager.addAlias('js', 'javascript');
      tagManager.removeAlias('js');
      
      expect(addListener).toHaveBeenCalledWith({
        alias: 'js',
        target: 'javascript'
      });
      expect(removeListener).toHaveBeenCalledWith('js');
    });
  });

  describe('Hierarchy', () => {
    beforeEach(() => {
      tagManager.setHierarchy('programming', ['javascript', 'typescript', 'python']);
      tagManager.setHierarchy('javascript', ['react', 'vue', 'angular']);
      tagManager.setHierarchy('backend', ['node', 'python', 'java']);
    });

    it('should get children of a tag', () => {
      const children = tagManager.getChildren('programming');
      expect(children).toEqual(['javascript', 'typescript', 'python']);
    });

    it('should get parents of a tag', () => {
      const parents = tagManager.getParents('python');
      expect(parents).toEqual(['programming', 'backend']);
    });

    it('should expand hierarchy with children', () => {
      const expanded = tagManager.expandHierarchy('javascript', false, true);
      expect(expanded).toEqual(['javascript', 'react', 'vue', 'angular']);
    });

    it('should expand hierarchy with parents', () => {
      const expanded = tagManager.expandHierarchy('react', true, false);
      expect(expanded).toEqual(['react', 'javascript']);
    });

    it('should expand hierarchy with both parents and children', () => {
      const expanded = tagManager.expandHierarchy('javascript', true, true);
      expect(expanded.sort()).toEqual(['javascript', 'programming', 'react', 'vue', 'angular'].sort());
    });

    it('should emit hierarchyUpdated event', () => {
      const listener = jest.fn();
      tagManager.on('hierarchyUpdated', listener);
      
      tagManager.setHierarchy('test', ['child1', 'child2']);
      
      expect(listener).toHaveBeenCalledWith({
        parent: 'test',
        children: ['child1', 'child2']
      });
    });

    it('should handle non-existent tags in hierarchy', () => {
      expect(tagManager.getChildren('nonexistent')).toEqual([]);
      expect(tagManager.getParents('nonexistent')).toEqual([]);
      expect(tagManager.expandHierarchy('nonexistent')).toEqual(['nonexistent']);
    });
  });

  describe('Statistics', () => {
    it('should update tag statistics', () => {
      tagManager.updateStats(['api', 'user']);
      tagManager.updateStats(['api', 'admin']);
      tagManager.updateStats(['api', 'user']);
      
      const stats = tagManager.getStats();
      
      expect(stats).toEqual([
        ['api', 3],
        ['user', 2],
        ['admin', 1]
      ]);
    });

    it('should get limited statistics', () => {
      tagManager.updateStats(['a', 'b', 'c', 'd', 'e']);
      tagManager.updateStats(['a', 'b', 'c', 'd']);
      tagManager.updateStats(['a', 'b', 'c']);
      tagManager.updateStats(['a', 'b']);
      tagManager.updateStats(['a']);
      
      const stats = tagManager.getStats(3);
      
      expect(stats).toEqual([
        ['a', 5],
        ['b', 4],
        ['c', 3]
      ]);
    });

    it('should get comprehensive statistics', () => {
      // Add many tags
      for (let i = 0; i < 20; i++) {
        const tags = [] as string[];
        for (let j = 0; j <= i; j++) {
          tags.push(`tag${j}`);
        }
        tagManager.updateStats(tags);
      }
      
      const stats = tagManager.getComprehensiveStats();
      
      expect(stats.totalTags).toBeGreaterThan(0);
      expect(stats.uniqueTags).toBe(20);
      expect(stats.mostUsed.length).toBe(10);
      expect(stats.leastUsed.length).toBe(10);
      expect(stats.mostUsed[0][1]).toBeGreaterThan(stats.leastUsed[0][1]);
    });

    it('should clear statistics', () => {
      tagManager.updateStats(['api', 'user']);
      tagManager.clearStats();
      
      const stats = tagManager.getStats();
      expect(stats).toEqual([]);
      
      const comprehensive = tagManager.getComprehensiveStats();
      expect(comprehensive.totalTags).toBe(0);
      expect(comprehensive.uniqueTags).toBe(0);
    });

    it('should emit stats events', () => {
      const updateListener = jest.fn();
      const clearListener = jest.fn();
      
      tagManager.on('statsUpdated', updateListener);
      tagManager.on('statsCleared', clearListener);
      
      tagManager.updateStats(['test']);
      tagManager.clearStats();
      
      expect(updateListener).toHaveBeenCalledWith(['test']);
      expect(clearListener).toHaveBeenCalled();
    });
  });

  describe('parse() and format()', () => {
    it('should parse tags from string with default separator', () => {
      const parsed = tagManager.parse('api,user,admin');
      expect(parsed).toEqual(['api', 'user', 'admin']);
    });

    it('should parse tags with custom separator', () => {
      const parsed = tagManager.parse('api;user;admin', ';');
      expect(parsed).toEqual(['api', 'user', 'admin']);
    });

    it('should parse tags with configured separator', () => {
      const manager = new TagManager({ separator: '|' });
      const parsed = manager.parse('api|user|admin');
      expect(parsed).toEqual(['api', 'user', 'admin']);
    });

    it('should trim and filter empty tags', () => {
      const parsed = tagManager.parse(' api , user ,, admin ');
      expect(parsed).toEqual(['api', 'user', 'admin']);
    });

    it('should normalize parsed tags when autoNormalize is true', () => {
      const parsed = tagManager.parse('API,User Login,NEW-FEATURE');
      expect(parsed).toEqual(['api', 'user-login', 'new-feature']);
    });

    it('should format tags to string', () => {
      const formatted = tagManager.format(['api', 'user', 'admin']);
      expect(formatted).toBe('api,user,admin');
    });

    it('should format with custom separator', () => {
      const formatted = tagManager.format(['api', 'user', 'admin'], ' | ');
      expect(formatted).toBe('api | user | admin');
    });
  });

  describe('suggest()', () => {
    beforeEach(() => {
      // Build up some tag statistics
      tagManager.updateStats(['api', 'api-v1', 'api-v2', 'application']);
      tagManager.updateStats(['api', 'api-v1', 'application']);
      tagManager.updateStats(['api', 'application']);
      tagManager.updateStats(['api']);
    });

    it('should suggest tags based on partial input', () => {
      const suggestions = tagManager.suggest('ap');
      
      expect(suggestions).toContain('api');
      expect(suggestions).toContain('api-v1');
      expect(suggestions).toContain('api-v2');
      expect(suggestions).toContain('application');
    });

    it('should order suggestions by frequency', () => {
      const suggestions = tagManager.suggest('api');
      
      expect(suggestions[0]).toBe('api'); // Most frequent
      expect(suggestions[1]).toBe('api-v1'); // Second most
      expect(suggestions[2]).toBe('api-v2'); // Least frequent
    });

    it('should limit suggestions', () => {
      const suggestions = tagManager.suggest('a', 2);
      expect(suggestions.length).toBe(2);
    });

    it('should handle case insensitive suggestions', () => {
      const suggestions = tagManager.suggest('API');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should normalize partial input when autoNormalize is true', () => {
      const suggestions = tagManager.suggest('API-V');
      expect(suggestions).toContain('api-v1');
      expect(suggestions).toContain('api-v2');
    });

    it('should return empty array for no matches', () => {
      const suggestions = tagManager.suggest('xyz');
      expect(suggestions).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string normalization', () => {
      const normalized = tagManager.normalize('');
      expect(normalized).toEqual(['']);
    });

    it('should handle special characters in tag names', () => {
      const normalized = tagManager.normalize(['<script>alert("xss")</script>', '${injection}', '../../etc/passwd']);
      
      // All special characters should be removed
      expect(normalized).toEqual(['scriptalertxssscript', 'injection', 'etcpasswd']);
    });

    it('should handle very long tags', () => {
      const longTag = 'a'.repeat(100);
      const normalized = tagManager.normalize(longTag);
      
      expect(normalized[0].length).toBe(50); // Default maxTagLength
    });

    it('should handle numeric tags', () => {
      const normalized = tagManager.normalize(['123', '456.789', '0xFF']);
      expect(normalized).toEqual(['123', '456789', '0xff']);
    });

    it('should handle unicode characters', () => {
      const normalized = tagManager.normalize(['emoji😀tag', 'unicode✓check', '中文标签']);
      
      // Default normalization removes non-alphanumeric
      expect(normalized).toEqual(['emojitag', 'unicodecheck', '']);
    });
  });

  describe('destroy()', () => {
    it('should clean up all resources', () => {
      tagManager.updateStats(['test']);
      tagManager.addAlias('a', 'b');
      tagManager.setHierarchy('parent', ['child']);
      tagManager.on('test', jest.fn()); // Replace empty function with jest.fn()
      
      tagManager.destroy();
      
      expect(tagManager.getStats()).toEqual([]);
      expect(tagManager.getAliases().size).toBe(0);
      expect(tagManager.getChildren('parent')).toEqual([]);
      expect(tagManager.listenerCount('test')).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete tag workflow', () => {
      // Set up rules
      tagManager.setNormalizationRules({
        toLowerCase: true,
        replaceSpaces: true,
        removeSpecialChars: false
      });
      
      tagManager.setValidationRules({
        minLength: 3,
        maxLength: 20,
        reserved: ['admin', 'system']
      });
      
      // Add aliases
      tagManager.addAlias('js', 'javascript');
      
      // Process tags
      const input = 'Working on #JS #bug-fix in the admin panel';
      const extracted = tagManager.extract(input);
      
      expect(extracted).toEqual(['javascript', 'bug-fix']); // JS aliased, admin not extracted as hashtag
      
      // Validate
      const validation = tagManager.validate(extracted);
      expect(validation.valid).toBe(true);
      
      // Update stats
      tagManager.updateStats(extracted);
      
      // Get suggestions
      const suggestions = tagManager.suggest('java');
      expect(suggestions).toContain('javascript');
    });

    it('should handle tag filtering pipeline', () => {
      const allTags = ['api', 'api-v1', 'api-v2', 'user', 'admin', 'internal-api'];
      
      // Multi-stage filtering
      let filtered = tagManager.filter(allTags, {
        pattern: /api/
      });
      
      expect(filtered).toEqual(['api', 'api-v1', 'api-v2', 'internal-api']);
      
      filtered = tagManager.filter(filtered, {
        exclude: ['internal-api']
      });
      
      expect(filtered).toEqual(['api', 'api-v1', 'api-v2']);
      
      filtered = tagManager.filter(filtered, {
        custom: tag => !tag.includes('v1')
      });
      
      expect(filtered).toEqual(['api', 'api-v2']);
    });
  });
});