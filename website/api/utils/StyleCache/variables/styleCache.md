# Variable: styleCache

> `const` **styleCache**: [`StyleCache`](../classes/StyleCache.md)

Defined in: [src/utils/StyleCache.ts:296](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/StyleCache.ts#L296)

Global style cache instance for convenience.
Use this for application-wide style caching.

## Example

```typescript
import { styleCache } from './utils/StyleCache';

// Use the global cache
const cached = styleCache.get(key);
if (!cached) {
  styleCache.set(key, styledText, plainText);
}
```
