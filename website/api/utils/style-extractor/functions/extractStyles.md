# Function: extractStyles()

> **extractStyles**(`styledMessage`): `object`

Defined in: [src/utils/style-extractor.ts:22](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/style-extractor.ts#L22)

Extracts plain text and style ranges from a message with inline style markup.
Supports <style>text</> angle bracket syntax.

## Parameters

### styledMessage

`string`

Message with inline style markup

## Returns

`object`

Object containing plain text and style ranges

### plainText

> **plainText**: `string`

### styles?

> `optional` **styles**: [`StyleRange`](../../../types/transport/type-aliases/StyleRange.md)[]

## Example

```typescript
const result = extractStyles('<red.bold>Error:</> User <cyan>john@example.com</> not found');
// Returns:
// {
//   plainText: "Error: User john@example.com not found",
//   styles: [[0, 6, "red.bold"], [12, 29, "cyan"]]
// }
```
