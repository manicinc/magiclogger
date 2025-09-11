# Class: StyleBuilder

Defined in: [src/core/StyleBuilder.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L38)

StyleBuilder provides a chainable API for building styled strings.

Similar to popular libraries like Chalk, it allows intuitive chaining
of color and style modifiers. The builder uses a Proxy-based approach
to provide dynamic property access and efficient caching of style combinations.

 StyleBuilder

## Example

```typescript
const style = new StyleBuilder();

// Chain multiple styles
const text = style.red.bold('Error message');

// Create reusable style functions
const errorStyle = style.red.bold.underline;
const successStyle = style.green.bold;

console.log(errorStyle('Critical error'));
console.log(successStyle('Operation complete'));

// Combine with template literals
const message = `${style.cyan('User')} ${style.yellow.bold('logged in')}`;
```

## Constructors

### Constructor

> **new StyleBuilder**(`useColors`, `initialStyles`): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:213](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L213)

Creates a new StyleBuilder instance.

#### Parameters

##### useColors

`boolean` = `true`

Whether to apply colors to output

##### initialStyles

`string`[] = `[]`

Initial styles to apply (used internally for chaining)

#### Returns

`StyleBuilder`

## Accessors

### bgBlack

#### Get Signature

> **get** **bgBlack**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:742](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L742)

Apply black background color.

##### Returns

`StyleBuilder`

New builder with black background

***

### bgBlue

#### Get Signature

> **get** **bgBlue**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:706](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L706)

Apply blue background color.

##### Returns

`StyleBuilder`

New builder with blue background

***

### bgBrightBlack

#### Get Signature

> **get** **bgBrightBlack**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:836](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L836)

Apply bright black background color.

##### Returns

`StyleBuilder`

New builder with bright black background

***

### bgBrightBlue

#### Get Signature

> **get** **bgBrightBlue**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:800](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L800)

Apply bright blue background color.

##### Returns

`StyleBuilder`

New builder with bright blue background

***

### bgBrightBrown

#### Get Signature

> **get** **bgBrightBrown**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:910](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L910)

##### Returns

`StyleBuilder`

***

### bgBrightCyan

#### Get Signature

> **get** **bgBrightCyan**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:818](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L818)

Apply bright cyan background color.

##### Returns

`StyleBuilder`

New builder with bright cyan background

***

### bgBrightGreen

#### Get Signature

> **get** **bgBrightGreen**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:782](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L782)

Apply bright green background color.

##### Returns

`StyleBuilder`

New builder with bright green background

***

### bgBrightIndigo

#### Get Signature

> **get** **bgBrightIndigo**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:924](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L924)

##### Returns

`StyleBuilder`

***

### bgBrightLime

#### Get Signature

> **get** **bgBrightLime**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:938](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L938)

##### Returns

`StyleBuilder`

***

### bgBrightMagenta

#### Get Signature

> **get** **bgBrightMagenta**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:809](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L809)

Apply bright magenta background color.

##### Returns

`StyleBuilder`

New builder with bright magenta background

***

### bgBrightOrange

#### Get Signature

> **get** **bgBrightOrange**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:854](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L854)

##### Returns

`StyleBuilder`

***

### bgBrightPink

#### Get Signature

> **get** **bgBrightPink**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:896](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L896)

##### Returns

`StyleBuilder`

***

### bgBrightPurple

#### Get Signature

> **get** **bgBrightPurple**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:868](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L868)

##### Returns

`StyleBuilder`

***

### bgBrightRed

#### Get Signature

> **get** **bgBrightRed**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:773](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L773)

Apply bright red background color.

##### Returns

`StyleBuilder`

New builder with bright red background

***

### bgBrightTeal

#### Get Signature

> **get** **bgBrightTeal**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:882](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L882)

##### Returns

`StyleBuilder`

***

### bgBrightWhite

#### Get Signature

> **get** **bgBrightWhite**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:827](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L827)

Apply bright white background color.

##### Returns

`StyleBuilder`

New builder with bright white background

***

### bgBrightYellow

#### Get Signature

> **get** **bgBrightYellow**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:791](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L791)

Apply bright yellow background color.

##### Returns

`StyleBuilder`

New builder with bright yellow background

***

### bgBrown

#### Get Signature

> **get** **bgBrown**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:907](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L907)

##### Returns

`StyleBuilder`

***

### bgCyan

#### Get Signature

> **get** **bgCyan**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:724](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L724)

Apply cyan background color.

##### Returns

`StyleBuilder`

New builder with cyan background

***

### bgGray

#### Get Signature

> **get** **bgGray**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:751](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L751)

Apply gray background color.

##### Returns

`StyleBuilder`

New builder with gray background

***

### bgGreen

#### Get Signature

> **get** **bgGreen**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:688](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L688)

Apply green background color.

##### Returns

`StyleBuilder`

New builder with green background

***

### bgGrey

#### Get Signature

> **get** **bgGrey**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:760](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L760)

Apply grey background color (alias for bgGray).

##### Returns

`StyleBuilder`

New builder with grey background

***

### bgIndigo

#### Get Signature

> **get** **bgIndigo**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:921](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L921)

##### Returns

`StyleBuilder`

***

### bgLime

#### Get Signature

> **get** **bgLime**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:935](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L935)

##### Returns

`StyleBuilder`

***

### bgMagenta

#### Get Signature

> **get** **bgMagenta**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:715](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L715)

Apply magenta background color.

##### Returns

`StyleBuilder`

New builder with magenta background

***

### bgOrange

#### Get Signature

> **get** **bgOrange**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:851](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L851)

##### Returns

`StyleBuilder`

***

### bgPink

#### Get Signature

> **get** **bgPink**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:893](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L893)

##### Returns

`StyleBuilder`

***

### bgPurple

#### Get Signature

> **get** **bgPurple**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:865](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L865)

##### Returns

`StyleBuilder`

***

### bgRed

#### Get Signature

> **get** **bgRed**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:679](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L679)

Apply red background color.

##### Returns

`StyleBuilder`

New builder with red background

***

### bgTeal

#### Get Signature

> **get** **bgTeal**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:879](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L879)

##### Returns

`StyleBuilder`

***

### bgWhite

#### Get Signature

> **get** **bgWhite**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:733](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L733)

Apply white background color.

##### Returns

`StyleBuilder`

New builder with white background

***

### bgYellow

#### Get Signature

> **get** **bgYellow**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:697](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L697)

Apply yellow background color.

##### Returns

`StyleBuilder`

New builder with yellow background

***

### black

#### Get Signature

> **get** **black**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:572](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L572)

Apply black foreground color.

##### Returns

`StyleBuilder`

New builder with black style

***

### blink

#### Get Signature

> **get** **blink**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:987](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L987)

Apply blink text style.

##### Returns

`StyleBuilder`

New builder with blink style

***

### blue

#### Get Signature

> **get** **blue**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:536](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L536)

Apply blue foreground color.

##### Returns

`StyleBuilder`

New builder with blue style

***

### bold

#### Get Signature

> **get** **bold**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:951](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L951)

Apply bold text style.

##### Returns

`StyleBuilder`

New builder with bold style

***

### brightBlack

#### Get Signature

> **get** **brightBlack**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:666](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L666)

Apply bright black foreground color.

##### Returns

`StyleBuilder`

New builder with bright black style

***

### brightBlue

#### Get Signature

> **get** **brightBlue**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:630](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L630)

Apply bright blue foreground color.

##### Returns

`StyleBuilder`

New builder with bright blue style

***

### brightBrown

#### Get Signature

> **get** **brightBrown**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:904](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L904)

##### Returns

`StyleBuilder`

***

### brightCyan

#### Get Signature

> **get** **brightCyan**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:648](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L648)

Apply bright cyan foreground color.

##### Returns

`StyleBuilder`

New builder with bright cyan style

***

### brightGreen

#### Get Signature

> **get** **brightGreen**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:612](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L612)

Apply bright green foreground color.

##### Returns

`StyleBuilder`

New builder with bright green style

***

### brightIndigo

#### Get Signature

> **get** **brightIndigo**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:918](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L918)

##### Returns

`StyleBuilder`

***

### brightLime

#### Get Signature

> **get** **brightLime**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:932](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L932)

##### Returns

`StyleBuilder`

***

### brightMagenta

#### Get Signature

> **get** **brightMagenta**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:639](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L639)

Apply bright magenta foreground color.

##### Returns

`StyleBuilder`

New builder with bright magenta style

***

### brightOrange

#### Get Signature

> **get** **brightOrange**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:848](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L848)

##### Returns

`StyleBuilder`

***

### brightPink

#### Get Signature

> **get** **brightPink**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:890](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L890)

##### Returns

`StyleBuilder`

***

### brightPurple

#### Get Signature

> **get** **brightPurple**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:862](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L862)

##### Returns

`StyleBuilder`

***

### brightRed

#### Get Signature

> **get** **brightRed**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:603](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L603)

Apply bright red foreground color.

##### Returns

`StyleBuilder`

New builder with bright red style

***

### brightTeal

#### Get Signature

> **get** **brightTeal**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:876](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L876)

##### Returns

`StyleBuilder`

***

### brightWhite

#### Get Signature

> **get** **brightWhite**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:657](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L657)

Apply bright white foreground color.

##### Returns

`StyleBuilder`

New builder with bright white style

***

### brightYellow

#### Get Signature

> **get** **brightYellow**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:621](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L621)

Apply bright yellow foreground color.

##### Returns

`StyleBuilder`

New builder with bright yellow style

***

### brown

#### Get Signature

> **get** **brown**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:901](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L901)

##### Returns

`StyleBuilder`

***

### cyan

#### Get Signature

> **get** **cyan**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:554](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L554)

Apply cyan foreground color.

##### Returns

`StyleBuilder`

New builder with cyan style

***

### dim

#### Get Signature

> **get** **dim**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:960](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L960)

Apply dim text style.

##### Returns

`StyleBuilder`

New builder with dim style

***

### gray

#### Get Signature

> **get** **gray**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:581](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L581)

Apply gray foreground color.

##### Returns

`StyleBuilder`

New builder with gray style

***

### green

#### Get Signature

> **get** **green**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:518](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L518)

Apply green foreground color.

##### Returns

`StyleBuilder`

New builder with green style

***

### grey

#### Get Signature

> **get** **grey**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:590](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L590)

Apply grey foreground color (alias for gray).

##### Returns

`StyleBuilder`

New builder with grey style

***

### hidden

#### Get Signature

> **get** **hidden**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:1014](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L1014)

Apply hidden text style.

##### Returns

`StyleBuilder`

New builder with hidden style

***

### indigo

#### Get Signature

> **get** **indigo**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:915](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L915)

##### Returns

`StyleBuilder`

***

### inverse

#### Get Signature

> **get** **inverse**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:1005](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L1005)

Apply inverse text style (alias for reverse).

##### Returns

`StyleBuilder`

New builder with inverse style

***

### italic

#### Get Signature

> **get** **italic**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:969](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L969)

Apply italic text style.

##### Returns

`StyleBuilder`

New builder with italic style

***

### lime

#### Get Signature

> **get** **lime**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:929](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L929)

##### Returns

`StyleBuilder`

***

### magenta

#### Get Signature

> **get** **magenta**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:545](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L545)

Apply magenta foreground color.

##### Returns

`StyleBuilder`

New builder with magenta style

***

### orange

#### Get Signature

> **get** **orange**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:845](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L845)

##### Returns

`StyleBuilder`

***

### pink

#### Get Signature

> **get** **pink**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:887](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L887)

##### Returns

`StyleBuilder`

***

### purple

#### Get Signature

> **get** **purple**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:859](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L859)

##### Returns

`StyleBuilder`

***

### red

#### Get Signature

> **get** **red**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:509](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L509)

Apply red foreground color.

##### Returns

`StyleBuilder`

New builder with red style

***

### reverse

#### Get Signature

> **get** **reverse**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:996](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L996)

Apply reverse text style (swap foreground and background colors).

##### Returns

`StyleBuilder`

New builder with reverse style

***

### strikethrough

#### Get Signature

> **get** **strikethrough**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:1023](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L1023)

Apply strikethrough text style.

##### Returns

`StyleBuilder`

New builder with strikethrough style

***

### teal

#### Get Signature

> **get** **teal**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:873](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L873)

##### Returns

`StyleBuilder`

***

### underline

#### Get Signature

> **get** **underline**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:978](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L978)

Apply underline text style.

##### Returns

`StyleBuilder`

New builder with underline style

***

### white

#### Get Signature

> **get** **white**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:563](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L563)

Apply white foreground color.

##### Returns

`StyleBuilder`

New builder with white style

***

### yellow

#### Get Signature

> **get** **yellow**(): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:527](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L527)

Apply yellow foreground color.

##### Returns

`StyleBuilder`

New builder with yellow style

## Methods

### getStyles()

> **getStyles**(): `string`[]

Defined in: [src/core/StyleBuilder.ts:474](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L474)

Gets the current style stack.

Useful for debugging or introspection.

#### Returns

`string`[]

Array of accumulated styles

***

### isColorEnabled()

> **isColorEnabled**(): `boolean`

Defined in: [src/core/StyleBuilder.ts:483](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L483)

Checks if colors are enabled for this builder.

#### Returns

`boolean`

Whether colors are enabled

***

### clearCache()

> `static` **clearCache**(): `void`

Defined in: [src/core/StyleBuilder.ts:463](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L463)

Clears the style cache.

Useful for testing or when color support changes.

#### Returns

`void`

#### Static

***

### create()

> `static` **create**(`useColors`): `StyleBuilder`

Defined in: [src/core/StyleBuilder.ts:496](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/StyleBuilder.ts#L496)

Creates a new StyleBuilder with specified color setting.

Useful for creating conditional styling based on environment.

#### Parameters

##### useColors

`boolean`

Whether to use colors

#### Returns

`StyleBuilder`

New StyleBuilder instance

#### Static
