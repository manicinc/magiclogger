# Interface: TagMatchCriteria

Defined in: [src/core/TagManager.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L126)

Tag match criteria.

 TagMatchCriteria

## Properties

### caseSensitive?

> `optional` **caseSensitive**: `boolean`

Defined in: [src/core/TagManager.ts:142](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L142)

Case sensitive matching.

#### Default

```ts
false
```

***

### mode?

> `optional` **mode**: `"any"` \| `"all"` \| `"exact"`

Defined in: [src/core/TagManager.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L131)

Match mode.

#### Default

```ts
'any'
```

***

### tags

> **tags**: `string`[]

Defined in: [src/core/TagManager.ts:136](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L136)

Tags to match.
