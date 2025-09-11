# Type Alias: SimpleThemeDefinition

> **SimpleThemeDefinition** = `Record`\<`string`, [`ColorName`](../../colors/type-aliases/ColorName.md)[]\>

Defined in: [src/types/logger.ts:21](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L21)

A theme defines color/style mappings for log levels.

Each key represents a log level or category, and the value is
an array of `ColorName` styles applied to messages of that level.

## Example

```ts
{
 *   info: ['cyan', 'bold'],
 *   error: ['brightRed', 'bold'],
 *   header: ['brightWhite', 'bgBlue', 'bold']
 * }
```
