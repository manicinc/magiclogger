# Interface: TagExtractionOptions

Defined in: [src/core/TagManager.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L150)

Tag extraction options.

 TagExtractionOptions

## Properties

### maxExtract?

> `optional` **maxExtract**: `number`

Defined in: [src/core/TagManager.ts:173](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L173)

Maximum tags to extract.

#### Default

```ts
10
```

***

### pattern?

> `optional` **pattern**: `RegExp`

Defined in: [src/core/TagManager.ts:161](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L161)

Pattern to extract tags.

#### Default

```ts
/#(\w+)/g
```

***

### prefix?

> `optional` **prefix**: `string`

Defined in: [src/core/TagManager.ts:167](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L167)

Prefix to look for.

#### Default

```ts
'#'
```

***

### source?

> `optional` **source**: `string`

Defined in: [src/core/TagManager.ts:155](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L155)

Source field to extract from.

#### Default

```ts
'message'
```
