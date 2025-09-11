# Type Alias: WordStyleMap

> **WordStyleMap** = `Record`\<`number`, [`ColorName`](../../colors/type-aliases/ColorName.md)[]\>

Defined in: [src/types/styling.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L34)

Maps word indices to their respective styles.
Used by the index-based styling API.

## Example

```typescript
const styleMap: WordStyleMap = {
  0: ['red', 'bold'],    // First word
  2: ['yellow'],         // Third word
  5: ['cyan', 'underline'] // Sixth word
};
```
