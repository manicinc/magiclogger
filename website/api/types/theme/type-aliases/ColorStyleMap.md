# Type Alias: ColorStyleMap

> **ColorStyleMap** = `Partial`\<`Record`\<[`ColorName`](../../colors/type-aliases/ColorName.md), `string`\>\>

Defined in: [src/types/theme.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L62)

A map that overrides specific color names with CSS equivalents.
Used for browser console logging with CSS styles.

## Example

```ts
{
 *   red: 'color: red',
 *   bold: 'font-weight: bold'
 * }
```
