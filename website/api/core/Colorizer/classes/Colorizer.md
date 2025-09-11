# Class: Colorizer

Defined in: [src/core/Colorizer.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L36)

Static utility class for applying ANSI color codes.

This class provides low-level color application functionality
used by other components. It handles:
- ANSI escape code generation
- Color validation
- Terminal capability detection
- Performance optimizations

 Colorizer

## Constructors

### Constructor

> **new Colorizer**(): `Colorizer`

#### Returns

`Colorizer`

## Methods

### applyColors()

> `static` **applyColors**(`text`, `colors`, `useColors`): `string`

Defined in: [src/core/Colorizer.ts:97](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L97)

Apply an array of colors/styles to text

#### Parameters

##### text

`string`

The text to format

##### colors

`string`[]

Array of color names to apply

##### useColors

`boolean` = `true`

Whether to use colors (defaults to true)

#### Returns

`string`

Text with all styles applied

***

### applyPreset()

> `static` **applyPreset**(`text`, `preset`, `useColors`): `string`

Defined in: [src/core/Colorizer.ts:176](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L176)

Apply colors from a preset style

#### Parameters

##### text

`string`

The text to format

##### preset

The preset style name

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

##### useColors

`boolean` = `true`

Whether to use colors (defaults to true)

#### Returns

`string`

Formatted text with preset colors applied

***

### blue()

> `static` **blue**(`text`): `string`

Defined in: [src/core/Colorizer.ts:489](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L489)

Apply blue color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### bold()

> `static` **bold**(`text`): `string`

Defined in: [src/core/Colorizer.ts:585](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L585)

Apply bold style.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### brightBlue()

> `static` **brightBlue**(`text`): `string`

Defined in: [src/core/Colorizer.ts:553](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L553)

Apply bright blue color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### brightCyan()

> `static` **brightCyan**(`text`): `string`

Defined in: [src/core/Colorizer.ts:569](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L569)

Apply bright cyan color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### brightGreen()

> `static` **brightGreen**(`text`): `string`

Defined in: [src/core/Colorizer.ts:537](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L537)

Apply bright green color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### brightMagenta()

> `static` **brightMagenta**(`text`): `string`

Defined in: [src/core/Colorizer.ts:561](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L561)

Apply bright magenta color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### brightRed()

> `static` **brightRed**(`text`): `string`

Defined in: [src/core/Colorizer.ts:529](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L529)

Apply bright red color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### brightWhite()

> `static` **brightWhite**(`text`): `string`

Defined in: [src/core/Colorizer.ts:577](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L577)

Apply bright white color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### brightYellow()

> `static` **brightYellow**(`text`): `string`

Defined in: [src/core/Colorizer.ts:545](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L545)

Apply bright yellow color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### clearCache()

> `static` **clearCache**(): `void`

Defined in: [src/core/Colorizer.ts:353](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L353)

Clear the code cache.

#### Returns

`void`

#### Static

***

### color()

> `static` **color**(`text`, `color`, `useColors`): `string`

Defined in: [src/core/Colorizer.ts:66](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L66)

Apply a single color or style to text

#### Parameters

##### text

`string`

The text to colorize

##### color

`string`

The color or style name to apply

##### useColors

`boolean` = `true`

Whether to use colors (defaults to true)

#### Returns

`string`

Formatted text with color codes

***

### colorParts()

> `static` **colorParts**(`parts`, `useColors`): `string`

Defined in: [src/core/Colorizer.ts:81](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L81)

Apply multiple colors to different parts of a string

#### Parameters

##### parts

`object`[]

Array of objects containing text and color information

##### useColors

`boolean` = `true`

Whether to use colors (defaults to true)

#### Returns

`string`

Combined string with each part colored accordingly

***

### createColorFunction()

> `static` **createColorFunction**(...`colors`): (`text`) => `string`

Defined in: [src/core/Colorizer.ts:636](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L636)

Create a color function for repeated use.

#### Parameters

##### colors

...`string`[]

Colors to apply

#### Returns

Color function

> (`text`): `string`

##### Parameters

###### text

`string`

##### Returns

`string`

#### Static

***

### cyan()

> `static` **cyan**(`text`): `string`

Defined in: [src/core/Colorizer.ts:505](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L505)

Apply cyan color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### dim()

> `static` **dim**(`text`): `string`

Defined in: [src/core/Colorizer.ts:593](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L593)

Apply dim style.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### formatKeyValue()

> `static` **formatKeyValue**(`key`, `value`, `keyColor`, `useColors`): `string`

Defined in: [src/core/Colorizer.ts:214](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L214)

Format a key-value pair with colored key

#### Parameters

##### key

`string`

The key to display

##### value

`unknown`

The value to display

##### keyColor

`string` = `'cyan'`

Color for the key

##### useColors

`boolean` = `true`

Whether to use colors (defaults to true)

#### Returns

`string`

Formatted string like "key: value"

***

### getColorLevel()

> `static` **getColorLevel**(): `number`

Defined in: [src/core/Colorizer.ts:405](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L405)

Get color level support.

#### Returns

`number`

Color level (0, 1, 2, or 3)

#### Static

***

### gray()

> `static` **gray**(`text`): `string`

Defined in: [src/core/Colorizer.ts:521](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L521)

Apply gray color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### green()

> `static` **green**(`text`): `string`

Defined in: [src/core/Colorizer.ts:473](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L473)

Apply green color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### hasAnsi()

> `static` **hasAnsi**(`text`): `boolean`

Defined in: [src/core/Colorizer.ts:443](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L443)

Check if text has ANSI codes.

#### Parameters

##### text

`string`

Text to check

#### Returns

`boolean`

True if has ANSI codes

#### Static

***

### highlight()

> `static` **highlight**(`text`, `pattern`, `highlightColor`, `useColors`): `string`

Defined in: [src/core/Colorizer.ts:193](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L193)

Highlight specific matches in text with a given color

#### Parameters

##### text

`string`

The source text

##### pattern

RegExp or string to match

`string` | `RegExp`

##### highlightColor

`string` = `'yellow'`

Color to apply to matches

##### useColors

`boolean` = `true`

Whether to use colors (defaults to true)

#### Returns

`string`

Text with highlighted matches

***

### inverse()

> `static` **inverse**(`text`): `string`

Defined in: [src/core/Colorizer.ts:617](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L617)

Apply inverse style.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### isLinkLike()

> `static` **isLinkLike**(`text`): `boolean`

Defined in: [src/core/Colorizer.ts:249](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L249)

Utility: Check if a string looks like a URL or file path.

#### Parameters

##### text

`string`

The text to check.

#### Returns

`boolean`

True if it is link-like.

***

### italic()

> `static` **italic**(`text`): `string`

Defined in: [src/core/Colorizer.ts:601](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L601)

Apply italic style.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### magenta()

> `static` **magenta**(`text`): `string`

Defined in: [src/core/Colorizer.ts:497](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L497)

Apply magenta color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### rainbow()

> `static` **rainbow**(`text`, `useColors`): `string`

Defined in: [src/core/Colorizer.ts:230](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L230)

Create a rainbow effect on text (each character gets a different color)

#### Parameters

##### text

`string`

The text to rainbow-ify

##### useColors

`boolean` = `true`

Whether to use colors (defaults to true)

#### Returns

`string`

Text with rainbow coloring

***

### red()

> `static` **red**(`text`): `string`

Defined in: [src/core/Colorizer.ts:465](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L465)

Apply red color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### setColorSupport()

> `static` **setColorSupport**(`supported`): `void`

Defined in: [src/core/Colorizer.ts:325](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L325)

Force color support on or off.

#### Parameters

##### supported

`boolean`

Whether colors are supported

#### Returns

`void`

#### Static

***

### strikethrough()

> `static` **strikethrough**(`text`): `string`

Defined in: [src/core/Colorizer.ts:625](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L625)

Apply strikethrough style.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### stripAnsi()

> `static` **stripAnsi**(`text`): `string`

Defined in: [src/core/Colorizer.ts:394](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L394)

Strip ANSI codes from text.

#### Parameters

##### text

`string`

Text with ANSI codes

#### Returns

`string`

Plain text

#### Static

***

### supportsColor()

> `static` **supportsColor**(): `boolean`

Defined in: [src/core/Colorizer.ts:260](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L260)

Check if the terminal supports color.

#### Returns

`boolean`

True if colors are supported

#### Static

***

### underline()

> `static` **underline**(`text`): `string`

Defined in: [src/core/Colorizer.ts:609](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L609)

Apply underline style.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### visibleLength()

> `static` **visibleLength**(`text`): `number`

Defined in: [src/core/Colorizer.ts:455](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L455)

Get visible length of text (excluding ANSI codes).

#### Parameters

##### text

`string`

Text to measure

#### Returns

`number`

Visible length

#### Static

***

### white()

> `static` **white**(`text`): `string`

Defined in: [src/core/Colorizer.ts:513](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L513)

Apply white color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### yellow()

> `static` **yellow**(`text`): `string`

Defined in: [src/core/Colorizer.ts:481](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Colorizer.ts#L481)

Apply yellow color.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static
