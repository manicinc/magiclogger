# Class: Formatter

Defined in: [src/core/Formatter.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L33)

Formatter class for handling text formatting and styling.

This class provides:
- ANSI color code application
- Link detection and preservation
- Text sanitization
- Format stripping
- Template formatting

 Formatter

## Example

```typescript
const formatter = new Formatter(true);

// Apply colors
const colored = formatter.colorize('Hello', ['red', 'bold']);

// Format template
const formatted = formatter.format('User {name} logged in', { name: 'John' });

// Strip ANSI codes
const plain = formatter.stripAnsi(colored);
```

## Constructors

### Constructor

> **new Formatter**(`useColors`): `Formatter`

Defined in: [src/core/Formatter.ts:84](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L84)

Creates a new Formatter instance.

#### Parameters

##### useColors

`boolean` = `true`

Whether to apply colors

#### Returns

`Formatter`

## Methods

### box()

> **box**(`text`, `options`): `string`

Defined in: [src/core/Formatter.ts:416](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L416)

Create a box around text.

#### Parameters

##### text

`string`

Text to box

##### options

Box options

###### align?

`"left"` \| `"right"` \| `"center"`

###### borderColor?

`string`[]

###### borderStyle?

`"single"` \| `"double"` \| `"rounded"`

###### margin?

`number`

###### padding?

`number`

#### Returns

`string`

Boxed text

***

### clearCache()

> **clearCache**(): `void`

Defined in: [src/core/Formatter.ts:587](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L587)

Clear the format cache.

#### Returns

`void`

***

### colorize()

> **colorize**(`text`, `colors`): `string`

Defined in: [src/core/Formatter.ts:95](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L95)

Apply colors to text using ANSI codes.

#### Parameters

##### text

`string`

Text to colorize

##### colors

`string`[]

Colors to apply

#### Returns

`string`

Colorized text

***

### format()

> **format**(`template`, `variables`): `string`

Defined in: [src/core/Formatter.ts:247](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L247)

Format a template string with variables.

#### Parameters

##### template

`string`

Template string with {variables}

##### variables

`Record`\<`string`, `unknown`\>

Variable values

#### Returns

`string`

Formatted string

***

### formatBytes()

> **formatBytes**(`bytes`, `decimals`): `string`

Defined in: [src/core/Formatter.ts:679](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L679)

Format bytes to human readable.

#### Parameters

##### bytes

`number`

Number of bytes

##### decimals

`number` = `2`

Decimal places

#### Returns

`string`

Formatted size

***

### formatDuration()

> **formatDuration**(`ms`): `string`

Defined in: [src/core/Formatter.ts:697](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L697)

Format duration to human readable.

#### Parameters

##### ms

`number`

Duration in milliseconds

#### Returns

`string`

Formatted duration

***

### formatTimestamp()

> **formatTimestamp**(`date`, `format?`): `string`

Defined in: [src/core/Formatter.ts:653](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L653)

Format a timestamp.

#### Parameters

##### date

`Date` = `...`

Date to format

##### format?

`string`

Format string

#### Returns

`string`

Formatted timestamp

***

### gradient()

> **gradient**(`text`, `startColors`, `endColors`): `string`

Defined in: [src/core/Formatter.ts:609](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L609)

Create a gradient effect (for terminals that support it).

#### Parameters

##### text

`string`

Text to gradient

##### startColors

`string`[]

Starting colors

##### endColors

`string`[]

Ending colors

#### Returns

`string`

Gradient text

***

### pad()

> **pad**(`text`, `length`, `char`, `direction`): `string`

Defined in: [src/core/Formatter.ts:286](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L286)

Pad text to a specific length.

#### Parameters

##### text

`string`

Text to pad

##### length

`number`

Desired length

##### char

`string` = `' '`

Padding character

##### direction

Padding direction

`"left"` | `"right"` | `"center"`

#### Returns

`string`

Padded text

***

### preserveLinks()

> **preserveLinks**(`text`): `undefined` \| `null` \| `string`

Defined in: [src/core/Formatter.ts:146](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L146)

Preserve links in text by making them clickable in terminals.

#### Parameters

##### text

`unknown`

Text possibly containing links

#### Returns

`undefined` \| `null` \| `string`

Text with preserved links

***

### rainbow()

> **rainbow**(`text`): `string`

Defined in: [src/core/Formatter.ts:628](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L628)

Apply rainbow colors to text.

#### Parameters

##### text

`string`

Text to rainbow

#### Returns

`string`

Rainbow text

***

### setUseColors()

> **setUseColors**(`useColors`): `void`

Defined in: [src/core/Formatter.ts:596](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L596)

Set whether to use colors.

#### Parameters

##### useColors

`boolean`

Whether to use colors

#### Returns

`void`

***

### stripAnsi()

> **stripAnsi**(`text`): `string`

Defined in: [src/core/Formatter.ts:236](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L236)

Strip ANSI codes from text.

#### Parameters

##### text

`string`

Text with ANSI codes

#### Returns

`string`

Plain text

***

### truncate()

> **truncate**(`text`, `length`, `suffix`): `string`

Defined in: [src/core/Formatter.ts:330](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L330)

Truncate text to a specific length.

#### Parameters

##### text

`string`

Text to truncate

##### length

`number`

Maximum length

##### suffix

`string` = `'...'`

Suffix to add

#### Returns

`string`

Truncated text

***

### wrap()

> **wrap**(`text`, `width`, `indent`): `string`

Defined in: [src/core/Formatter.ts:378](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/Formatter.ts#L378)

Wrap text to a specific width.

#### Parameters

##### text

`string`

Text to wrap

##### width

`number`

Maximum line width

##### indent

`string` = `''`

Indentation for wrapped lines

#### Returns

`string`

Wrapped text
