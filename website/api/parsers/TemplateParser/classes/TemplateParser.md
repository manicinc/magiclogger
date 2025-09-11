# Class: TemplateParser

Defined in: [src/parsers/TemplateParser.ts:57](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L57)

TemplateParser handles parsing and formatting of template strings with style syntax.
Supports both @style{text} syntax and <style>text</> angle bracket syntax.

 TemplateParser

## Example

```typescript
const parser = new TemplateParser();

// Parse template with @ syntax
const result = parser.parse`@red.bold{Error:} Message failed`;

// Parse with variables
const user = 'john';
const result = parser.parse`@green{User ${user}} logged in`;

// Parse with angle bracket syntax
const result = parser.parseString('<red.bold>Error:</> Connection failed');

// Parse complex nested styles
const result = parser.parse`
  @white.bgBlue.bold{ HEADER }
  @yellow{Warning:} System at @red{critical} state
`;
```

## Constructors

### Constructor

> **new TemplateParser**(`useColors?`): `TemplateParser`

Defined in: [src/parsers/TemplateParser.ts:180](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L180)

Creates a new TemplateParser instance.

#### Parameters

##### useColors?

`boolean` = `true`

Whether to apply colors to output

#### Returns

`TemplateParser`

## Methods

### createBracketParser()

> **createBracketParser**(): (`text`) => `string`

Defined in: [src/parsers/TemplateParser.ts:416](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L416)

Creates a bracket parser function bound to this parser.
Returns a function that parses angle bracket syntax.

#### Returns

Angle bracket parser function

> (`text`): `string`

##### Parameters

###### text

`string`

##### Returns

`string`

#### Example

```typescript
const parseBrackets = parser.createBracketParser();
const result = parseBrackets('<red>Error:</> Failed');
```

***

### createFormatter()

> **createFormatter**(): (`strings`, ...`values`) => `string`

Defined in: [src/parsers/TemplateParser.ts:571](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L571)

Creates a formatter function bound to this parser.
Returns a tagged template literal function.

#### Returns

Template literal tag function

> (`strings`, ...`values`): `string`

##### Parameters

###### strings

`TemplateStringsArray`

###### values

...`unknown`[]

##### Returns

`string`

#### Example

```typescript
const fmt = parser.createFormatter();
const result = fmt`@red{Error:} ${message}`;
```

***

### parse()

> **parse**(`strings`, ...`values`): `string`

Defined in: [src/parsers/TemplateParser.ts:200](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L200)

Parses a template literal with @style{} syntax.
This is the main entry point for template literal parsing.

#### Parameters

##### strings

`TemplateStringsArray`

Template literal strings

##### values

...`unknown`[]

Interpolated values

#### Returns

`string`

Formatted string with styles applied

#### Example

```typescript
const result = parser.parse`
  @red.bold{Error:} ${errorMessage}
  @yellow{Warning:} System at @red{${criticalLevel}%}
`;
```

***

### parseAngleBrackets()

> **parseAngleBrackets**(`text`): `string`

Defined in: [src/parsers/TemplateParser.ts:319](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L319)

Parses a string with angle bracket syntax <style>text</>.

#### Parameters

##### text

`string`

Text with angle bracket syntax

#### Returns

`string`

Formatted string with styles applied

#### Example

```typescript
const result = parser.parseAngleBrackets('<red.bold>Error:</> <yellow>Warning</> detected');
```

***

### parseMixed()

> **parseMixed**(`text`): `string`

Defined in: [src/parsers/TemplateParser.ts:821](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L821)

Combines multiple style syntaxes in a single text.
Processes both @{} and <> syntax.

#### Parameters

##### text

`string`

Text with mixed syntax

#### Returns

`string`

Formatted text with styles applied

#### Example

```typescript
const result = parser.parseMixed(
  '@red{Error:} <yellow>Warning</> detected'
);
```

***

### parseString()

> **parseString**(`text`): `string`

Defined in: [src/parsers/TemplateParser.ts:250](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L250)

Parses a string with style syntax (not a template literal).
Supports both @style{text} and <style>text</> syntax.

#### Parameters

##### text

`string`

Text with style syntax

#### Returns

`string`

Formatted string with styles applied

#### Example

```typescript
// @ syntax
const result = parser.parseString('@red.bold{Error:} Connection failed');

// Angle bracket syntax
const result = parser.parseString('<red.bold>Error:</> Connection failed');
```

***

### clearCache()

> `static` **clearCache**(): `void`

Defined in: [src/parsers/TemplateParser.ts:608](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L608)

Clears the template cache.
Useful for testing or when color support changes.

#### Returns

`void`

#### Static

#### Example

```typescript
TemplateParser.clearCache();
```

***

### convertSyntax()

> `static` **convertSyntax**(`text`, `from`, `to`): `string`

Defined in: [src/parsers/TemplateParser.ts:760](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L760)

Converts between different style syntaxes.

#### Parameters

##### text

`string`

Text to convert

##### from

Source syntax ('at' for @{}, 'angle' for <>)

`"at"` | `"angle"`

##### to

Target syntax ('at' for @{}, 'angle' for <>)

`"at"` | `"angle"`

#### Returns

`string`

Converted text

#### Static

#### Example

```typescript
// Convert @ syntax to angle brackets
const result = TemplateParser.convertSyntax(
  '@red{Error:} @yellow{Warning}',
  'at',
  'angle'
);
// Returns: '<red>Error:</> <yellow>Warning</>'

// Convert angle brackets to @ syntax
const result = TemplateParser.convertSyntax(
  '<red>Error:</> <yellow>Warning</>',
  'angle',
  'at'
);
// Returns: '@red{Error:} @yellow{Warning}'
```

***

### escape()

> `static` **escape**(`text`): `string`

Defined in: [src/parsers/TemplateParser.ts:628](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L628)

Escapes special characters in template syntax.
Use this when you want to display literal @{}, <>, or </> in output.

#### Parameters

##### text

`string`

Text to escape

#### Returns

`string`

Escaped text

#### Static

#### Example

```typescript
const escaped = TemplateParser.escape('Use @{} or <> for styling');
// Returns: 'Use \\@{} or \\<\\> for styling'
```

***

### unescape()

> `static` **unescape**(`text`): `string`

Defined in: [src/parsers/TemplateParser.ts:645](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L645)

Unescapes special characters in template syntax.

#### Parameters

##### text

`string`

Text to unescape

#### Returns

`string`

Unescaped text

#### Static

#### Example

```typescript
const unescaped = TemplateParser.unescape('Use \\@{} or \\<\\> for styling');
// Returns: 'Use @{} or <> for styling'
```

***

### validate()

> `static` **validate**(`template`): `object`

Defined in: [src/parsers/TemplateParser.ts:666](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/parsers/TemplateParser.ts#L666)

Validates template syntax without applying styles.
Useful for checking if a template is valid before use.
Supports both @{} and <> syntax.

#### Parameters

##### template

`string`

Template to validate

#### Returns

`object`

Validation result with any errors

##### errors

> **errors**: `string`[]

##### valid

> **valid**: `boolean`

#### Static

#### Example

```typescript
const result = TemplateParser.validate('@red{text} <blue>other</>');
if (!result.valid) {
  console.error('Template errors:', result.errors);
}
```
