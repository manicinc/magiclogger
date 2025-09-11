# Class: CustomColorRegistry

Defined in: [src/colors/CustomColorRegistry.ts:60](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L60)

Registry for custom color definitions.
This is a singleton that lazily initializes to avoid impacting bundle size.

 CustomColorRegistry

## Example

```typescript
// Only loaded when explicitly used
const registry = CustomColorRegistry.getInstance();

// Add custom brand color with fallback
registry.registerColor('brandOrange', {
  rgb: [255, 87, 51],
  fallback: 'orange',
  description: 'Company brand orange'
});

// Use in theme
logger.setTheme({
  header: ['brandOrange', 'bold']
});
```

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/colors/CustomColorRegistry.ts:323](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L323)

Clear all custom colors.

#### Returns

`void`

***

### exportDefinitions()

> **exportDefinitions**(): `Record`\<`string`, [`CustomColorDefinition`](../interfaces/CustomColorDefinition.md)\>

Defined in: [src/colors/CustomColorRegistry.ts:437](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L437)

Export color definitions for debugging/documentation.

#### Returns

`Record`\<`string`, [`CustomColorDefinition`](../interfaces/CustomColorDefinition.md)\>

All custom color definitions

***

### getColorCode()

> **getColorCode**(`name`): `undefined` \| `string`

Defined in: [src/colors/CustomColorRegistry.ts:235](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L235)

Get ANSI escape sequence for a custom color.

#### Parameters

##### name

`string`

Color name

#### Returns

`undefined` \| `string`

ANSI escape sequence or undefined

***

### getColorNames()

> **getColorNames**(): `string`[]

Defined in: [src/colors/CustomColorRegistry.ts:316](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L316)

Get all registered custom color names.

#### Returns

`string`[]

Array of color names

***

### getFallback()

> **getFallback**(`name`): `undefined` \| `string`

Defined in: [src/colors/CustomColorRegistry.ts:297](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L297)

Get fallback color name for a custom color.

#### Parameters

##### name

`string`

Color name

#### Returns

`undefined` \| `string`

Fallback color name

***

### getTerminalSupport()

> **getTerminalSupport**(): `null` \| \{ `basic`: `boolean`; `color256`: `boolean`; `rgb`: `boolean`; \}

Defined in: [src/colors/CustomColorRegistry.ts:450](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L450)

Get terminal support information.

#### Returns

`null` \| \{ `basic`: `boolean`; `color256`: `boolean`; `rgb`: `boolean`; \}

Terminal color support levels

***

### hasColor()

> **hasColor**(`name`): `boolean`

Defined in: [src/colors/CustomColorRegistry.ts:307](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L307)

Check if a color is registered.

#### Parameters

##### name

`string`

Color name

#### Returns

`boolean`

True if registered

***

### registerColor()

> **registerColor**(`name`, `definition`): `void`

Defined in: [src/colors/CustomColorRegistry.ts:176](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L176)

Register a custom color.

#### Parameters

##### name

`string`

Unique color name

##### definition

[`CustomColorDefinition`](../interfaces/CustomColorDefinition.md)

Color definition

#### Returns

`void`

#### Throws

If color name conflicts with existing colors

#### Example

```typescript
// RGB color
registry.registerColor('neonPink', {
  rgb: [255, 16, 240],
  fallback: 'magenta'
});

// 256-color palette
registry.registerColor('darkOlive', {
  code256: 58,
  fallback: 'green'
});

// Hex color
registry.registerColor('skyBlue', {
  hex: '#87CEEB',
  fallback: 'cyan'
});

// Direct ANSI sequence (advanced)
registry.registerColor('customBlink', {
  ansi: '\x1b[5;38;2;255;255;0m',
  fallback: 'yellow',
  description: 'Blinking yellow text'
});
```

***

### registerColors()

> **registerColors**(`colors`): `void`

Defined in: [src/colors/CustomColorRegistry.ts:223](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L223)

Register multiple colors at once.

#### Parameters

##### colors

`Record`\<`string`, [`CustomColorDefinition`](../interfaces/CustomColorDefinition.md)\>

Map of color definitions

#### Returns

`void`

#### Example

```typescript
registry.registerColors({
  brandPrimary: { hex: '#FF5733', fallback: 'orange' },
  brandSecondary: { hex: '#3366FF', fallback: 'blue' },
  brandAccent: { rgb: [0, 255, 127], fallback: 'green' }
});
```

***

### removeColor()

> **removeColor**(`name`): `boolean`

Defined in: [src/colors/CustomColorRegistry.ts:334](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L334)

Remove a specific custom color.

#### Parameters

##### name

`string`

Color name to remove

#### Returns

`boolean`

True if removed

***

### getInstance()

> `static` **getInstance**(): `CustomColorRegistry`

Defined in: [src/colors/CustomColorRegistry.ts:78](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/colors/CustomColorRegistry.ts#L78)

Get or create the singleton instance.

#### Returns

`CustomColorRegistry`

The registry instance
