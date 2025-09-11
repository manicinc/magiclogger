# Interface: StyleStats

Defined in: [src/types/styling.ts:261](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L261)

Style statistics for a styled string.
Provides metrics about styling usage.

 StyleStats

## Properties

### ansiCodeCount

> **ansiCodeCount**: `number`

Defined in: [src/types/styling.ts:275](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L275)

Number of ANSI codes applied.

***

### mostUsedStyle?

> `optional` **mostUsedStyle**: `string`

Defined in: [src/types/styling.ts:285](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L285)

Most frequently used style.

***

### styleUsage

> **styleUsage**: `Record`\<[`ColorName`](../../colors/type-aliases/ColorName.md), `number`\>

Defined in: [src/types/styling.ts:290](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L290)

Map of style usage counts.

***

### totalLength

> **totalLength**: `number`

Defined in: [src/types/styling.ts:265](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L265)

Total character count (including ANSI codes).

***

### uniqueStyleCount

> **uniqueStyleCount**: `number`

Defined in: [src/types/styling.ts:280](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L280)

Number of different styles used.

***

### visibleLength

> **visibleLength**: `number`

Defined in: [src/types/styling.ts:270](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L270)

Visible character count (excluding ANSI codes).
