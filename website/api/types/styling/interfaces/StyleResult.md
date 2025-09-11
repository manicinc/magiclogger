# Interface: StyleResult

Defined in: [src/types/styling.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L74)

Result of parsing styled text.
Contains the styled output and metadata.

 StyleResult

## Properties

### colorsApplied

> **colorsApplied**: `boolean`

Defined in: [src/types/styling.ts:93](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L93)

Whether colors were actually applied.

***

### plain

> **plain**: `string`

Defined in: [src/types/styling.ts:83](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L83)

The plain text without styles.

***

### styleCount

> **styleCount**: `number`

Defined in: [src/types/styling.ts:88](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L88)

Number of styles applied.

***

### styled

> **styled**: `string`

Defined in: [src/types/styling.ts:78](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L78)

The styled text output.

***

### visibleLength

> **visibleLength**: `number`

Defined in: [src/types/styling.ts:98](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L98)

Visible character count (excluding ANSI codes).
