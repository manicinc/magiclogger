# Interface: CustomColorDefinition

Defined in: [src/colors/CustomColorRegistry.ts:22](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L22)

Custom color definition supporting multiple formats.

## Properties

### ansi?

> `optional` **ansi**: `string`

Defined in: [src/colors/CustomColorRegistry.ts:24](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L24)

ANSI escape sequence (e.g., '\x1b[38;2;255;87;51m')

***

### code256?

> `optional` **code256**: `number`

Defined in: [src/colors/CustomColorRegistry.ts:28](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L28)

256-color palette code (0-255)

***

### description?

> `optional` **description**: `string`

Defined in: [src/colors/CustomColorRegistry.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L34)

Description for documentation

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [src/colors/CustomColorRegistry.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L32)

Fallback to use if terminal doesn't support this color

***

### hex?

> `optional` **hex**: `string`

Defined in: [src/colors/CustomColorRegistry.ts:30](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L30)

Hex color (e.g., '#FF5733') - will be converted to RGB

***

### rgb?

> `optional` **rgb**: \[`number`, `number`, `number`\]

Defined in: [src/colors/CustomColorRegistry.ts:26](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L26)

RGB values [r, g, b] for 24-bit color
