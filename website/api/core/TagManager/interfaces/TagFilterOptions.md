# Interface: TagFilterOptions

Defined in: [src/core/TagManager.ts:99](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L99)

Tag filter options.

 TagFilterOptions

## Properties

### custom()?

> `optional` **custom**: (`tag`) => `boolean`

Defined in: [src/core/TagManager.ts:118](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L118)

Custom filter function.

#### Parameters

##### tag

`string`

#### Returns

`boolean`

***

### exclude?

> `optional` **exclude**: `string`[]

Defined in: [src/core/TagManager.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L108)

Exclude tags.

***

### include?

> `optional` **include**: `string`[]

Defined in: [src/core/TagManager.ts:103](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L103)

Include tags.

***

### pattern?

> `optional` **pattern**: `RegExp`

Defined in: [src/core/TagManager.ts:113](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L113)

Pattern to match.
