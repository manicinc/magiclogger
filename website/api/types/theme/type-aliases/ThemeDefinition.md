# Type Alias: ThemeDefinition

> **ThemeDefinition** = `Partial`\<`Record`\<[`StylePreset`](../../preset/type-aliases/StylePreset.md) \| `string`, [`ColorName`](../../colors/type-aliases/ColorName.md)[]\>\> & `object`

Defined in: [src/types/theme.ts:24](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L24)

A theme definition maps log levels, style presets, and tags to arrays of color/style names.
Keys are StylePreset strings such as 'info', 'error', 'success', or custom presets.
Tags can have associated styles that are automatically applied.

## Type Declaration

### tags?

> `optional` **tags**: `Record`\<`string`, [`ColorName`](../../colors/type-aliases/ColorName.md)[]\>

Tag-specific styles that are automatically applied when tags are used.
Maps tag names to arrays of color/style names.

## Example

```ts
{
 *   info: ['cyan', 'bold'],
 *   error: ['brightRed', 'bold'],
 *   header: ['brightWhite', 'bgBlue', 'bold'],
 *   tags: {
 *     api: ['cyan', 'bold'],
 *     database: ['yellow'],
 *     critical: ['white', 'bgRed', 'bold']
 *   }
 * }
```
