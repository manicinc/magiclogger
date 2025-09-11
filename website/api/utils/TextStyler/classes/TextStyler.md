# Class: TextStyler

Defined in: [src/utils/TextStyler.ts:53](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L53)

TextStyler provides utility functions for various text styling operations.
This class contains the core logic for all styling APIs, ensuring consistency
across different styling methods.

Now uses angle bracket syntax: <style>text</> instead of [[style]]text[[/]]

 TextStyler

## Example

```typescript
// Style parts of text
const styled = TextStyler.styleParts([
  ['Error:', 'red', 'bold'],
  [' Something went wrong']
]);

// Style by word index
const styled = TextStyler.styleByIndex(
  'Error: Connection failed',
  { 0: ['red', 'bold'], 2: ['yellow'] }
);

// Parse angle bracket syntax
const styled = TextStyler.parseBrackets(
  '<red.bold>Error:</> Failed'
);
```

## Constructors

### Constructor

> **new TextStyler**(): `TextStyler`

#### Returns

`TextStyler`

## Methods

### combinedStyle()

> `static` **combinedStyle**(`text`, `options`): `string`

Defined in: [src/utils/TextStyler.ts:700](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L700)

Combines multiple styling methods in a single text.
Processes brackets first, then applies additional styling.

#### Parameters

##### text

`string`

Text to style

##### options

Styling options

###### additionalParts?

[`Part`](../type-aliases/Part.md)[]

###### styleMap?

[`StyleMap`](../type-aliases/StyleMap.md)

###### useColors?

`boolean`

#### Returns

`string`

Styled text

#### Example

```typescript
const result = TextStyler.combinedStyle(
  '<red>Error:</> Connection to <yellow>database</> failed',
  {
    additionalParts: [[' [CRITICAL]', 'red', 'bold', 'blink']],
    useColors: true
  }
);
```

***

### escapeBrackets()

> `static` **escapeBrackets**(`text`): `string`

Defined in: [src/utils/TextStyler.ts:818](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L818)

Escapes angle bracket syntax in text to display literal brackets.

#### Parameters

##### text

`string`

Text to escape

#### Returns

`string`

Escaped text

***

### parseBrackets()

> `static` **parseBrackets**(`text`, `useColors?`): `string`

Defined in: [src/utils/TextStyler.ts:331](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L331)

Parses and applies angle bracket syntax styling <style>text</>.
Angle brackets are used to avoid conflicts with other syntax in text.

#### Parameters

##### text

`string`

Text with angle bracket syntax

##### useColors?

`boolean` = `true`

Whether to apply colors

#### Returns

`string`

Styled text

#### Example

```typescript
const result = TextStyler.parseBrackets(
  '<green.bold>SUCCESS:</> All <yellow>10</> tests passed'
);
```

***

### parseBracketsWithExtraction()

> `static` **parseBracketsWithExtraction**(`text`, `useColors`): `object`

Defined in: [src/utils/TextStyler.ts:401](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L401)

Parses angle bracket styled text and extracts both plain text and style ranges.
This is the enhanced version that supports the optimized MAGIC Schema format.

#### Parameters

##### text

`string`

Text with angle bracket styling

##### useColors

`boolean` = `true`

#### Returns

`object`

Object with plain text, styled text, and style ranges

##### plainText

> **plainText**: `string`

##### styledText

> **styledText**: `string`

##### styles?

> `optional` **styles**: [`StyleRange`](../../../types/transport/type-aliases/StyleRange.md)[]

#### Example

```typescript
const result = TextStyler.parseBracketsWithExtraction(
  '<red.bold>Error:</> User <cyan>john@example.com</> not found'
);
// Returns: {
//   plainText: "Error: User john@example.com not found",
//   styledText: "\x1b[31m\x1b[1mError:\x1b[0m User \x1b[36mjohn@example.com\x1b[0m not found",
//   styles: [[0, 6, "red.bold"], [12, 29, "cyan"]]
// }
```

***

### parseStyleString()

> `static` **parseStyleString**(`styleString`): `string`[]

Defined in: [src/utils/TextStyler.ts:535](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L535)

Parses a style string into an array of valid color names.
Handles dot-separated styles like "red.bold.underline".

#### Parameters

##### styleString

`string`

Style string to parse

#### Returns

`string`[]

Array of valid color names

#### Example

```typescript
const styles = TextStyler.parseStyleString('red.bold.underline');
// Returns: ['red', 'bold', 'underline']
```

***

### stripStyles()

> `static` **stripStyles**(`text`): `string`

Defined in: [src/utils/TextStyler.ts:738](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L738)

Strips all ANSI color codes from text.
Useful for getting plain text from styled strings.

#### Parameters

##### text

`string`

Text with ANSI codes

#### Returns

`string`

Plain text

#### Example

```typescript
const plain = TextStyler.stripStyles(styledText);
```

***

### styleByIndex()

> `static` **styleByIndex**(`text`, `styleMap`, `useColors?`): `string`

Defined in: [src/utils/TextStyler.ts:276](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L276)

Styles text by applying colors to specific word indices.
Words are split by whitespace and indexed starting from 0.

#### Parameters

##### text

`string`

Text to style

##### styleMap

[`StyleMap`](../type-aliases/StyleMap.md)

Map of word indices to styles

##### useColors?

`boolean` = `true`

Whether to apply colors

#### Returns

`string`

Styled text

#### Example

```typescript
const result = TextStyler.styleByIndex(
  'GET /api/users 200 OK 45ms',
  {
    0: ['blue', 'bold'],      // "GET"
    1: ['cyan'],               // "/api/users"
    2: ['green', 'bold'],      // "200"
    3: ['green'],              // "OK"
    4: ['magenta']             // "45ms"
  }
);
```

***

### styleParts()

> `static` **styleParts**(`parts`, `useColors?`): `string`

Defined in: [src/utils/TextStyler.ts:215](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L215)

Styles an array of text parts with their respective styles.
Each part is a tuple where the first element is text and
the rest are style names to apply.

#### Parameters

##### parts

[`Part`](../type-aliases/Part.md)[]

Array of text parts with styles

##### useColors?

`boolean` = `true`

Whether to apply colors

#### Returns

`string`

Combined styled string

#### Example

```typescript
const result = TextStyler.styleParts([
  ['SUCCESS:', 'green', 'bold'],
  [' All tests passed'],
  [' (100%)', 'dim']
]);
```

***

### unescapeBrackets()

> `static` **unescapeBrackets**(`text`): `string`

Defined in: [src/utils/TextStyler.ts:828](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L828)

Unescapes angle bracket syntax in text.

#### Parameters

##### text

`string`

Text to unescape

#### Returns

`string`

Unescaped text

***

### validateStyleMap()

> `static` **validateStyleMap**(`text`, `styleMap`): `object`

Defined in: [src/utils/TextStyler.ts:759](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L759)

Validates a style map to ensure all indices are valid.

#### Parameters

##### text

`string`

Text to validate against

##### styleMap

[`StyleMap`](../type-aliases/StyleMap.md)

Style map to validate

#### Returns

`object`

Validation result

##### errors

> **errors**: `string`[]

##### valid

> **valid**: `boolean`

***

### visibleLength()

> `static` **visibleLength**(`text`): `number`

Defined in: [src/utils/TextStyler.ts:748](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TextStyler.ts#L748)

Counts visible characters in styled text (excluding ANSI codes).

#### Parameters

##### text

`string`

Text with potential ANSI codes

#### Returns

`number`

Visible character count
