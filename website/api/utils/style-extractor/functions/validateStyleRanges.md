# Function: validateStyleRanges()

> **validateStyleRanges**(`plainText`, `styles?`): `boolean`

Defined in: [src/utils/style-extractor.ts:167](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/style-extractor.ts#L167)

Validates that style ranges don't exceed message bounds.

## Parameters

### plainText

`string`

Plain text message

### styles?

[`StyleRange`](../../../types/transport/type-aliases/StyleRange.md)[]

Array of style ranges

## Returns

`boolean`

True if all ranges are valid
