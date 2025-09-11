# Class: StyleCache

Defined in: [src/utils/StyleCache.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L65)

High-performance LRU cache for styled strings.

This cache stores pre-computed styled strings to avoid expensive
ANSI code generation and string operations. It uses an LRU eviction
policy with configurable size limits and optional TTL.

Features:
- LRU eviction when cache exceeds max size
- Hit tracking for cache effectiveness monitoring
- Optional TTL for time-based expiration
- Separate caching for colored vs plain output

 StyleCache

## Example

```typescript
const cache = StyleCache.getInstance();

// Cache a styled string
const key = 'error:red.bold';
const styled = cache.get(key);
if (!styled) {
  const computed = applyStyles('Error', ['red', 'bold']);
  cache.set(key, computed, 'Error');
}

// Monitor cache effectiveness
const stats = cache.getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
```

## Constructors

### Constructor

> **new StyleCache**(`maxSize?`, `ttl?`): `StyleCache`

Defined in: [src/utils/StyleCache.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L114)

Creates a new StyleCache instance.

#### Parameters

##### maxSize?

`number` = `1000`

Maximum cache entries

##### ttl?

`number` = `0`

TTL in ms (0 = no expiration)

#### Returns

`StyleCache`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/utils/StyleCache.ts:231](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L231)

Clears the entire cache.

Use this when:
- Memory pressure is high
- Style configuration changes
- Application is resetting

#### Returns

`void`

***

### get()

> **get**(`key`): `null` \| `CacheEntry`

Defined in: [src/utils/StyleCache.ts:161](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L161)

Retrieves a cached entry.

Checks TTL if configured and updates hit statistics.
Returns null for expired or missing entries.

#### Parameters

##### key

`string`

The cache key

#### Returns

`null` \| `CacheEntry`

The cached entry or null

***

### getStats()

> **getStats**(): `object`

Defined in: [src/utils/StyleCache.ts:251](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L251)

Gets cache statistics for monitoring.

Provides insights into cache effectiveness:
- Hit rate: Higher is better (>80% is good)
- Size: Current entries vs max
- Eviction rate: Lower is better

#### Returns

`object`

Cache statistics

##### evictions

> **evictions**: `number`

##### hitRate

> **hitRate**: `string`

##### hits

> **hits**: `number`

##### maxSize

> **maxSize**: `number`

##### misses

> **misses**: `number`

##### sets

> **sets**: `number`

##### size

> **size**: `number`

***

### set()

> **set**(`key`, `styled`, `plain`): `void`

Defined in: [src/utils/StyleCache.ts:201](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L201)

Stores a styled string in the cache.

Implements LRU eviction when cache is full.
The least recently used entry is removed to make space.

#### Parameters

##### key

`string`

The cache key

##### styled

`string`

The styled text with ANSI codes

##### plain

`string`

The plain text without styling

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `StyleCache`

Defined in: [src/utils/StyleCache.ts:127](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L127)

Gets the singleton cache instance.
Creates one if it doesn't exist.

#### Returns

`StyleCache`

The global cache instance

#### Static

***

### makeKey()

> `static` **makeKey**(`text`, `styles?`, `useColors?`): `string`

Defined in: [src/utils/StyleCache.ts:146](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L146)

Generates a cache key from style parameters.

This method creates a deterministic key from the text and styles,
ensuring consistent cache hits for identical styling operations.

#### Parameters

##### text

`string`

The text to style

##### styles?

`string`[]

Optional style names

##### useColors?

`boolean` = `true`

Whether colors are enabled

#### Returns

`string`

The cache key

#### Static

***

### reset()

> `static` **reset**(): `void`

Defined in: [src/utils/StyleCache.ts:272](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L272)

Resets the global singleton instance.
Useful for testing or configuration changes.

#### Returns

`void`

#### Static
