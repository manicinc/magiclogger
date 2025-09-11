# Function: applyStyles()

> **applyStyles**(`plainText`, `styles?`, `applyStyleFn?`): `string`

Defined in: [src/utils/style-extractor.ts:88](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/style-extractor.ts#L88)

Applies style ranges back to plain text to reconstruct styled output.

## Parameters

### plainText

`string`

Plain text message

### styles?

[`StyleRange`](../../../types/transport/type-aliases/StyleRange.md)[]

Array of style ranges

### applyStyleFn?

(`text`, `style`) => `string`

Function to apply a style to text

## Returns

`string`

Styled text

## Example

```typescript
const styled = applyStyles(
  "Error: User john@example.com not found",
  [[0, 6, "red.bold"], [12, 29, "cyan"]],
  (text, style) => `<${style}>${text}</>`
);
// Returns: "<red.bold>Error:</> User <cyan>john@example.com</> not found"
```
