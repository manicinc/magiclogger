# Variable: fs

> `const` **fs**: `object`

Defined in: [src/utils/browser-polyfills.ts:12](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/browser-polyfills.ts#L12)

## Type Declaration

### appendFileSync()

> **appendFileSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

#### Parameters

##### \_args

...`any`[]

#### Returns

`void`

### existsSync()

> **existsSync**: (`_path`) => `boolean`

#### Parameters

##### \_path

`string`

#### Returns

`boolean`

### mkdirSync()

> **mkdirSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

#### Parameters

##### \_args

...`any`[]

#### Returns

`void`

### readdirSync()

> **readdirSync**: (`_path`) => `never`[]

#### Parameters

##### \_path

`string`

#### Returns

`never`[]

### readFile()

> **readFile**: (`_path`) => `Promise`\<`Uint8Array`\>

#### Parameters

##### \_path

`string`

#### Returns

`Promise`\<`Uint8Array`\>

### readFileSync()

> **readFileSync**: (`_path`, `_encoding?`) => `string`

#### Parameters

##### \_path

`string`

##### \_encoding?

`string`

#### Returns

`string`

### rmdirSync()

> **rmdirSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

#### Parameters

##### \_args

...`any`[]

#### Returns

`void`

### statSync()

> **statSync**: (`_path`) => `object`

#### Parameters

##### \_path

`string`

#### Returns

`object`

##### atime

> **atime**: `Date`

##### atimeMs

> **atimeMs**: `number` = `0`

##### birthtime

> **birthtime**: `Date`

##### birthtimeMs

> **birthtimeMs**: `number` = `0`

##### blksize

> **blksize**: `number` = `0`

##### blocks

> **blocks**: `number` = `0`

##### ctime

> **ctime**: `Date`

##### ctimeMs

> **ctimeMs**: `number` = `0`

##### dev

> **dev**: `number` = `0`

##### gid

> **gid**: `number` = `0`

##### ino

> **ino**: `number` = `0`

##### isBlockDevice()

> **isBlockDevice**: () => `boolean`

###### Returns

`boolean`

##### isCharacterDevice()

> **isCharacterDevice**: () => `boolean`

###### Returns

`boolean`

##### isDirectory()

> **isDirectory**: () => `boolean`

###### Returns

`boolean`

##### isFIFO()

> **isFIFO**: () => `boolean`

###### Returns

`boolean`

##### isFile()

> **isFile**: () => `boolean`

###### Returns

`boolean`

##### isSocket()

> **isSocket**: () => `boolean`

###### Returns

`boolean`

##### isSymbolicLink()

> **isSymbolicLink**: () => `boolean`

###### Returns

`boolean`

##### mode

> **mode**: `number` = `0`

##### mtime

> **mtime**: `Date`

##### mtimeMs

> **mtimeMs**: `number` = `0`

##### nlink

> **nlink**: `number` = `0`

##### rdev

> **rdev**: `number` = `0`

##### size

> **size**: `number` = `0`

##### uid

> **uid**: `number` = `0`

### unlinkSync()

> **unlinkSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

#### Parameters

##### \_args

...`any`[]

#### Returns

`void`

### writeFileSync()

> **writeFileSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

#### Parameters

##### \_args

...`any`[]

#### Returns

`void`
