# Class: TagManager

Defined in: [src/core/TagManager.ts:304](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L304)

Manages tags for log entries with optional schema validation.

Provides comprehensive tag management including:
- Normalization and validation
- Schema enforcement for structured tags
- Tag extraction from text
- Filtering and matching
- Usage statistics

 TagManager

## Examples

```typescript
const tagManager = new TagManager({
  maxTags: 20,
  autoNormalize: true
});

const tags = tagManager.normalize(['API', 'User Login', 'v2.0']);
// Result: ['api', 'user-login', 'v2-0']
```

```typescript
import { object, string, number } from 'magiclogger/validation';

const tagManager = new TagManager({
  schema: object({
    category: string({ enum: ['error', 'warning', 'info'] }),
    severity: number({ min: 1, max: 10 }),
    component: string()
  }),
  schemaValidationMode: 'throw'
});

tagManager.add({
  category: 'error',
  severity: 8,
  component: 'auth'
}); // Validates against schema
```

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new TagManager**(`options`): `TagManager`

Defined in: [src/core/TagManager.ts:347](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L347)

Creates a new TagManager instance.

#### Parameters

##### options

[`TagManagerOptions`](../interfaces/TagManagerOptions.md) = `{}`

Configuration options

#### Returns

`TagManager`

#### Overrides

`EventEmitter.constructor`

## Methods

### add()

> **add**(`tags`): `boolean`

Defined in: [src/core/TagManager.ts:940](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L940)

Adds tags with optional schema validation.

#### Parameters

##### tags

`unknown`

Tags to add

#### Returns

`boolean`

Whether tags were successfully added

***

### addAlias()

> **addAlias**(`alias`, `target`): `void`

Defined in: [src/core/TagManager.ts:688](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L688)

Add tag alias.

#### Parameters

##### alias

`string`

Alias tag

##### target

`string`

Target tag

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/core/TagManager.ts:1087](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L1087)

Clears all tags.

#### Returns

`void`

***

### clearStats()

> **clearStats**(): `void`

Defined in: [src/core/TagManager.ts:827](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L827)

Clear tag statistics.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [src/core/TagManager.ts:1096](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L1096)

Clean up resources.

#### Returns

`void`

***

### expandHierarchy()

> **expandHierarchy**(`tag`, `includeParents`, `includeChildren`): `string`[]

Defined in: [src/core/TagManager.ts:761](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L761)

Get tag with hierarchy.

#### Parameters

##### tag

`string`

Tag to expand

##### includeParents

`boolean` = `true`

Include parent tags

##### includeChildren

`boolean` = `true`

Include child tags

#### Returns

`string`[]

Expanded tags

***

### extract()

> **extract**(`text`, `options`): `string`[]

Defined in: [src/core/TagManager.ts:567](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L567)

Extract tags from text.

#### Parameters

##### text

`string`

Text to extract from

##### options

[`TagExtractionOptions`](../interfaces/TagExtractionOptions.md) = `{}`

Extraction options

#### Returns

`string`[]

Extracted tags

***

### filter()

> **filter**(`tags`, `options`): `string`[]

Defined in: [src/core/TagManager.ts:597](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L597)

Filter tags based on criteria.

#### Parameters

##### tags

`string`[]

Tags to filter

##### options

[`TagFilterOptions`](../interfaces/TagFilterOptions.md)

Filter options

#### Returns

`string`[]

Filtered tags

***

### format()

> **format**(`tags`, `separator?`): `string`

Defined in: [src/core/TagManager.ts:861](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L861)

Format tags to string.

#### Parameters

##### tags

`string`[]

Tags to format

##### separator?

`string`

Separator to use

#### Returns

`string`

Formatted string

***

### getAliases()

> **getAliases**(): `Map`\<`string`, `string`\>

Defined in: [src/core/TagManager.ts:709](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L709)

Get all aliases.

#### Returns

`Map`\<`string`, `string`\>

All aliases

***

### getAllTags()

> **getAllTags**(): `object`

Defined in: [src/core/TagManager.ts:1077](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L1077)

Gets all tags (both string and structured).

#### Returns

`object`

All tags

##### strings

> **strings**: `string`[]

##### structured

> **structured**: `unknown`[]

***

### getChildren()

> **getChildren**(`parent`): `string`[]

Defined in: [src/core/TagManager.ts:730](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L730)

Get tag children.

#### Parameters

##### parent

`string`

Parent tag

#### Returns

`string`[]

Child tags

***

### getComprehensiveStats()

> **getComprehensiveStats**(): [`TagStats`](../interfaces/TagStats.md)

Defined in: [src/core/TagManager.ts:813](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L813)

Get comprehensive tag statistics.

#### Returns

[`TagStats`](../interfaces/TagStats.md)

Tag statistics

***

### getParents()

> **getParents**(`child`): `string`[]

Defined in: [src/core/TagManager.ts:741](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L741)

Get tag parents.

#### Parameters

##### child

`string`

Child tag

#### Returns

`string`[]

Parent tags

***

### getStats()

> **getStats**(`limit?`): \[`string`, `number`\][]

Defined in: [src/core/TagManager.ts:798](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L798)

Get tag statistics.

#### Parameters

##### limit?

`number`

Limit results

#### Returns

\[`string`, `number`\][]

Tag counts

***

### matches()

> **matches**(`tags`, `criteria`): `boolean`

Defined in: [src/core/TagManager.ts:630](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L630)

Check if tags match criteria.

#### Parameters

##### tags

`string`[]

Tags to check

##### criteria

[`TagMatchCriteria`](../interfaces/TagMatchCriteria.md)

Match criteria

#### Returns

`boolean`

Whether tags match

***

### merge()

> **merge**(...`tagArrays`): `string`[]

Defined in: [src/core/TagManager.ts:661](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L661)

Merge multiple tag arrays.

#### Parameters

##### tagArrays

...(`undefined` \| `string`[])[]

Tag arrays to merge

#### Returns

`string`[]

Merged tags

***

### normalize()

> **normalize**(`tags`): `string`[]

Defined in: [src/core/TagManager.ts:411](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L411)

Normalize tags according to rules.

#### Parameters

##### tags

Tags to normalize

`string` | `string`[]

#### Returns

`string`[]

Normalized tags

***

### parse()

> **parse**(`text`, `separator?`): `string`[]

Defined in: [src/core/TagManager.ts:840](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L840)

Parse tags from string.

#### Parameters

##### text

`string`

Text to parse

##### separator?

`string`

Separator to use

#### Returns

`string`[]

Parsed tags

***

### removeAlias()

> **removeAlias**(`alias`): `void`

Defined in: [src/core/TagManager.ts:698](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L698)

Remove tag alias.

#### Parameters

##### alias

`string`

Alias to remove

#### Returns

`void`

***

### setHierarchy()

> **setHierarchy**(`parent`, `children`): `void`

Defined in: [src/core/TagManager.ts:719](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L719)

Set tag hierarchy.

#### Parameters

##### parent

`string`

Parent tag

##### children

`string`[]

Child tags

#### Returns

`void`

***

### setNormalizationRules()

> **setNormalizationRules**(`rules`): `void`

Defined in: [src/core/TagManager.ts:390](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L390)

Set normalization rules.

#### Parameters

##### rules

[`TagNormalizationRules`](../interfaces/TagNormalizationRules.md)

Normalization rules

#### Returns

`void`

***

### setSchema()

> **setSchema**(`schema`, `mode?`): `void`

Defined in: [src/core/TagManager.ts:926](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L926)

Sets a schema for structured tag validation.

#### Parameters

##### schema

[`AnySchema`](../../../validation/SchemaValidator/type-aliases/AnySchema.md)

Schema definition for tags

##### mode?

Validation mode

`"warn"` | `"silent"` | `"throw"`

#### Returns

`void`

#### Example

```typescript
import { object, string, number, array } from 'magiclogger/validation';

tagManager.setSchema(
  object({
    category: string({ enum: ['bug', 'feature', 'docs'] }),
    priority: number({ min: 1, max: 5 }),
    labels: array(string())
  }),
  'throw'
);
```

***

### setValidationRules()

> **setValidationRules**(`rules`): `void`

Defined in: [src/core/TagManager.ts:400](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L400)

Set validation rules.

#### Parameters

##### rules

[`TagValidationRules`](../interfaces/TagValidationRules.md)

Validation rules

#### Returns

`void`

***

### suggest()

> **suggest**(`partial`, `limit?`): `string`[]

Defined in: [src/core/TagManager.ts:887](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L887)

Get suggested tags based on partial input.

#### Parameters

##### partial

`string`

Partial tag

##### limit?

`number` = `10`

Maximum suggestions

#### Returns

`string`[]

Suggested tags

***

### updateStats()

> **updateStats**(`tags`): `void`

Defined in: [src/core/TagManager.ts:782](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L782)

Update tag statistics.

#### Parameters

##### tags

`string`[]

Tags to count

#### Returns

`void`

***

### validate()

> **validate**(`tags`): [`TagValidationResult`](../interfaces/TagValidationResult.md)

Defined in: [src/core/TagManager.ts:499](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L499)

Validate tags against rules.

#### Parameters

##### tags

Tags to validate

`string` | `string`[]

#### Returns

[`TagValidationResult`](../interfaces/TagValidationResult.md)

Validation result
