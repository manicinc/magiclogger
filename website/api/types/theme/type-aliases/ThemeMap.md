# Type Alias: ThemeMap

> **ThemeMap** = `Record`\<`string`, [`ThemeDefinition`](ThemeDefinition.md)\>

Defined in: [src/types/theme.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L50)

A map of theme names to their corresponding theme definitions.
Used by ThemeManager to load and switch between preconfigured themes.

## Example

```ts
{
 *   default: {
 *     info: ['blue'],
 *     success: ['green', 'bold'],
 *     tags: { api: ['cyan'], error: ['red', 'bold'] }
 *   },
 *   dark: {
 *     info: ['cyan'],
 *     error: ['brightRed'],
 *     tags: { warning: ['yellow'], debug: ['gray'] }
 *   }
 * }
```
