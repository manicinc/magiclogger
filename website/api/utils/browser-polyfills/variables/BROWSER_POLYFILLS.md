# Variable: BROWSER\_POLYFILLS

> `const` **BROWSER\_POLYFILLS**: `object`

Defined in: [src/utils/browser-polyfills.ts:129](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/browser-polyfills.ts#L129)

## Type Declaration

### fs

> **fs**: `object`

#### fs.appendFileSync()

> **appendFileSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

##### Parameters

###### \_args

...`any`[]

##### Returns

`void`

#### fs.existsSync()

> **existsSync**: (`_path`) => `boolean`

##### Parameters

###### \_path

`string`

##### Returns

`boolean`

#### fs.mkdirSync()

> **mkdirSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

##### Parameters

###### \_args

...`any`[]

##### Returns

`void`

#### fs.readdirSync()

> **readdirSync**: (`_path`) => `never`[]

##### Parameters

###### \_path

`string`

##### Returns

`never`[]

#### fs.readFile()

> **readFile**: (`_path`) => `Promise`\<`Uint8Array`\>

##### Parameters

###### \_path

`string`

##### Returns

`Promise`\<`Uint8Array`\>

#### fs.readFileSync()

> **readFileSync**: (`_path`, `_encoding?`) => `string`

##### Parameters

###### \_path

`string`

###### \_encoding?

`string`

##### Returns

`string`

#### fs.rmdirSync()

> **rmdirSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

##### Parameters

###### \_args

...`any`[]

##### Returns

`void`

#### fs.statSync()

> **statSync**: (`_path`) => `object`

##### Parameters

###### \_path

`string`

##### Returns

`object`

###### atime

> **atime**: `Date`

###### atimeMs

> **atimeMs**: `number` = `0`

###### birthtime

> **birthtime**: `Date`

###### birthtimeMs

> **birthtimeMs**: `number` = `0`

###### blksize

> **blksize**: `number` = `0`

###### blocks

> **blocks**: `number` = `0`

###### ctime

> **ctime**: `Date`

###### ctimeMs

> **ctimeMs**: `number` = `0`

###### dev

> **dev**: `number` = `0`

###### gid

> **gid**: `number` = `0`

###### ino

> **ino**: `number` = `0`

###### isBlockDevice()

> **isBlockDevice**: () => `boolean`

###### Returns

`boolean`

###### isCharacterDevice()

> **isCharacterDevice**: () => `boolean`

###### Returns

`boolean`

###### isDirectory()

> **isDirectory**: () => `boolean`

###### Returns

`boolean`

###### isFIFO()

> **isFIFO**: () => `boolean`

###### Returns

`boolean`

###### isFile()

> **isFile**: () => `boolean`

###### Returns

`boolean`

###### isSocket()

> **isSocket**: () => `boolean`

###### Returns

`boolean`

###### isSymbolicLink()

> **isSymbolicLink**: () => `boolean`

###### Returns

`boolean`

###### mode

> **mode**: `number` = `0`

###### mtime

> **mtime**: `Date`

###### mtimeMs

> **mtimeMs**: `number` = `0`

###### nlink

> **nlink**: `number` = `0`

###### rdev

> **rdev**: `number` = `0`

###### size

> **size**: `number` = `0`

###### uid

> **uid**: `number` = `0`

#### fs.unlinkSync()

> **unlinkSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

##### Parameters

###### \_args

...`any`[]

##### Returns

`void`

#### fs.writeFileSync()

> **writeFileSync**: (...`_args`) => `void` = `noop`

Browser polyfills for Node.js built-in modules.
These are no-op or dummy implementations for browser compatibility.

##### Parameters

###### \_args

...`any`[]

##### Returns

`void`

### os

> **os**: `object`

#### os.arch()

> **arch**: () => `string`

##### Returns

`string`

#### os.cpus()

> **cpus**: () => `never`[]

##### Returns

`never`[]

#### os.EOL

> **EOL**: `string` = `'\n'`

#### os.freemem()

> **freemem**: () => `number`

##### Returns

`number`

#### os.homedir()

> **homedir**: () => `string`

##### Returns

`string`

#### os.hostname()

> **hostname**: () => `string`

##### Returns

`string`

#### os.platform()

> **platform**: () => `string`

##### Returns

`string`

#### os.release()

> **release**: () => `string`

##### Returns

`string`

#### os.tmpdir()

> **tmpdir**: () => `string`

##### Returns

`string`

#### os.totalmem()

> **totalmem**: () => `number`

##### Returns

`number`

#### os.type()

> **type**: () => `string`

##### Returns

`string`

#### os.uptime()

> **uptime**: () => `number`

##### Returns

`number`

### path

> **path**: `object`

#### path.basename()

> **basename**: (`p`, `ext?`) => `string`

##### Parameters

###### p

`string`

###### ext?

`string`

##### Returns

`string`

#### path.delimiter

> **delimiter**: `string` = `':'`

#### path.dirname()

> **dirname**: (`p`) => `string`

##### Parameters

###### p

`string`

##### Returns

`string`

#### path.extname()

> **extname**: (`p`) => `string`

##### Parameters

###### p

`string`

##### Returns

`string`

#### path.isAbsolute()

> **isAbsolute**: (`p`) => `boolean`

##### Parameters

###### p

`string`

##### Returns

`boolean`

#### path.join()

> **join**: (...`paths`) => `string`

##### Parameters

###### paths

...`string`[]

##### Returns

`string`

#### path.resolve()

> **resolve**: (...`paths`) => `string`

##### Parameters

###### paths

...`string`[]

##### Returns

`string`

#### path.sep

> **sep**: `string` = `'/'`
