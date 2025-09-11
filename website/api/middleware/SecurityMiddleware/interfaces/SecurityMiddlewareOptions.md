# Interface: SecurityMiddlewareOptions

Defined in: [src/middleware/SecurityMiddleware.ts:9](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L9)

Security middleware configuration.

## Properties

### customSanitizer()?

> `optional` **customSanitizer**: (`value`) => `string`

Defined in: [src/middleware/SecurityMiddleware.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L55)

Custom sanitization function.

#### Parameters

##### value

`string`

#### Returns

`string`

***

### maxContextDepth?

> `optional` **maxContextDepth**: `number`

Defined in: [src/middleware/SecurityMiddleware.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L32)

Maximum context object depth to prevent deep recursion.

#### Default

```ts
10
```

***

### maxContextKeys?

> `optional` **maxContextKeys**: `number`

Defined in: [src/middleware/SecurityMiddleware.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L38)

Maximum number of context keys.

#### Default

```ts
100
```

***

### maxMessageLength?

> `optional` **maxMessageLength**: `number`

Defined in: [src/middleware/SecurityMiddleware.ts:26](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L26)

Maximum message length to prevent memory attacks.

#### Default

```ts
10000
```

***

### preventInjection?

> `optional` **preventInjection**: `boolean`

Defined in: [src/middleware/SecurityMiddleware.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L20)

Prevent log injection attacks.

#### Default

```ts
true
```

***

### sanitizeNewlines?

> `optional` **sanitizeNewlines**: `boolean`

Defined in: [src/middleware/SecurityMiddleware.ts:14](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L14)

Sanitize newlines and control characters.

#### Default

```ts
true
```

***

### sanitizeUrls?

> `optional` **sanitizeUrls**: `boolean`

Defined in: [src/middleware/SecurityMiddleware.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L50)

Validate and sanitize URLs in context.

#### Default

```ts
true
```

***

### stripAnsi?

> `optional` **stripAnsi**: `boolean`

Defined in: [src/middleware/SecurityMiddleware.ts:44](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L44)

Strip ANSI escape codes from messages.

#### Default

```ts
false
```
