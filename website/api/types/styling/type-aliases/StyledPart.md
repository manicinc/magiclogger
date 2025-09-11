# Type Alias: StyledPart

> **StyledPart** = \[`string`, [`ColorName`](../../colors/type-aliases/ColorName.md)[]\]

Defined in: [src/types/styling.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L17)

Represents a styled text part with optional color/style modifiers.
Used by the parts API for explicit style control.

## Example

```typescript
const part: StyledPart = ['Error:', 'red', 'bold'];
const simplePart: StyledPart = ['Plain text'];
```
