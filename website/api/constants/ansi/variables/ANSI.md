# Variable: ANSI

> `const` **ANSI**: `object`

Defined in: [src/constants/ansi.ts:10](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/constants/ansi.ts#L10)

Extended ANSI escape sequences for advanced terminal functionality

## Type Declaration

### ALTERNATE\_BUFFER\_DISABLE

> **ALTERNATE\_BUFFER\_DISABLE**: `string` = `'\x1b[?1049l'`

### ALTERNATE\_BUFFER\_ENABLE

> **ALTERNATE\_BUFFER\_ENABLE**: `string` = `'\x1b[?1049h'`

### BELL

> **BELL**: `string` = `'\x07'`

### BG\_BLACK

> **BG\_BLACK**: `string` = `'\x1b[40m'`

### BG\_BLUE

> **BG\_BLUE**: `string` = `'\x1b[44m'`

### BG\_BRIGHT\_BLACK

> **BG\_BRIGHT\_BLACK**: `string` = `'\x1b[100m'`

### BG\_BRIGHT\_BLUE

> **BG\_BRIGHT\_BLUE**: `string` = `'\x1b[104m'`

### BG\_BRIGHT\_CYAN

> **BG\_BRIGHT\_CYAN**: `string` = `'\x1b[106m'`

### BG\_BRIGHT\_GREEN

> **BG\_BRIGHT\_GREEN**: `string` = `'\x1b[102m'`

### BG\_BRIGHT\_MAGENTA

> **BG\_BRIGHT\_MAGENTA**: `string` = `'\x1b[105m'`

### BG\_BRIGHT\_RED

> **BG\_BRIGHT\_RED**: `string` = `'\x1b[101m'`

### BG\_BRIGHT\_WHITE

> **BG\_BRIGHT\_WHITE**: `string` = `'\x1b[107m'`

### BG\_BRIGHT\_YELLOW

> **BG\_BRIGHT\_YELLOW**: `string` = `'\x1b[103m'`

### BG\_COLOR()

> **BG\_COLOR**: (`r`, `g`, `b`) => `string`

#### Parameters

##### r

`number`

##### g

`number`

##### b

`number`

#### Returns

`string`

### BG\_COLOR\_256()

> **BG\_COLOR\_256**: (`code`) => `string`

#### Parameters

##### code

`number`

#### Returns

`string`

### BG\_CYAN

> **BG\_CYAN**: `string` = `'\x1b[46m'`

### BG\_DEFAULT

> **BG\_DEFAULT**: `string` = `'\x1b[49m'`

### BG\_GREEN

> **BG\_GREEN**: `string` = `'\x1b[42m'`

### BG\_MAGENTA

> **BG\_MAGENTA**: `string` = `'\x1b[45m'`

### BG\_RED

> **BG\_RED**: `string` = `'\x1b[41m'`

### BG\_WHITE

> **BG\_WHITE**: `string` = `'\x1b[47m'`

### BG\_YELLOW

> **BG\_YELLOW**: `string` = `'\x1b[43m'`

### BLINK

> **BLINK**: `string` = `'\x1b[5m'`

### BOLD

> **BOLD**: `string` = `'\x1b[1m'`

### CLEAR\_LINE

> **CLEAR\_LINE**: `string` = `'\x1b[2K'`

### CLEAR\_SCREEN

> **CLEAR\_SCREEN**: `string` = `'\x1b[2J'`

### CURLY\_UNDERLINE

> **CURLY\_UNDERLINE**: `string` = `'\x1b[4:3m'`

### CURSOR\_BAR

> **CURSOR\_BAR**: `string` = `'\x1b[6 q'`

### CURSOR\_BLINKING\_BAR

> **CURSOR\_BLINKING\_BAR**: `string` = `'\x1b[5 q'`

### CURSOR\_BLINKING\_BLOCK

> **CURSOR\_BLINKING\_BLOCK**: `string` = `'\x1b[1 q'`

### CURSOR\_BLINKING\_UNDERLINE

> **CURSOR\_BLINKING\_UNDERLINE**: `string` = `'\x1b[3 q'`

### CURSOR\_BLOCK

> **CURSOR\_BLOCK**: `string` = `'\x1b[2 q'`

### CURSOR\_COLUMN()

> **CURSOR\_COLUMN**: (`n`) => `string`

#### Parameters

##### n

`number` = `1`

#### Returns

`string`

### CURSOR\_DOWN()

> **CURSOR\_DOWN**: (`n`) => `string`

#### Parameters

##### n

`number` = `1`

#### Returns

`string`

### CURSOR\_HIDE

> **CURSOR\_HIDE**: `string` = `'\x1b[?25l'`

### CURSOR\_HOME

> **CURSOR\_HOME**: `string` = `'\x1b[H'`

### CURSOR\_LEFT()

> **CURSOR\_LEFT**: (`n`) => `string`

#### Parameters

##### n

`number` = `1`

#### Returns

`string`

### CURSOR\_NEXT\_LINE()

> **CURSOR\_NEXT\_LINE**: (`n`) => `string`

#### Parameters

##### n

`number` = `1`

#### Returns

`string`

### CURSOR\_POSITION()

> **CURSOR\_POSITION**: (`row`, `col`) => `string`

#### Parameters

##### row

`number`

##### col

`number`

#### Returns

`string`

### CURSOR\_PREV\_LINE()

> **CURSOR\_PREV\_LINE**: (`n`) => `string`

#### Parameters

##### n

`number` = `1`

#### Returns

`string`

### CURSOR\_REQUEST\_POSITION

> **CURSOR\_REQUEST\_POSITION**: `string` = `'\x1b[6n'`

### CURSOR\_RESTORE

> **CURSOR\_RESTORE**: `string` = `'\x1b[u'`

### CURSOR\_RIGHT()

> **CURSOR\_RIGHT**: (`n`) => `string`

#### Parameters

##### n

`number` = `1`

#### Returns

`string`

### CURSOR\_SAVE

> **CURSOR\_SAVE**: `string` = `'\x1b[s'`

### CURSOR\_SHOW

> **CURSOR\_SHOW**: `string` = `'\x1b[?25h'`

### CURSOR\_UNDERLINE

> **CURSOR\_UNDERLINE**: `string` = `'\x1b[4 q'`

### CURSOR\_UP()

> **CURSOR\_UP**: (`n`) => `string`

#### Parameters

##### n

`number` = `1`

#### Returns

`string`

### DASHED\_UNDERLINE

> **DASHED\_UNDERLINE**: `string` = `'\x1b[4:5m'`

### DIM

> **DIM**: `string` = `'\x1b[2m'`

### DISABLE\_LINE\_WRAP

> **DISABLE\_LINE\_WRAP**: `string` = `'\x1b[?7l'`

### DISABLE\_MOUSE

> **DISABLE\_MOUSE**: `string` = `'\x1b[?1003l\x1b[?1002l\x1b[?1000l'`

### DOTTED\_UNDERLINE

> **DOTTED\_UNDERLINE**: `string` = `'\x1b[4:4m'`

### DOUBLE\_UNDERLINE

> **DOUBLE\_UNDERLINE**: `string` = `'\x1b[21m'`

### ENABLE\_LINE\_WRAP

> **ENABLE\_LINE\_WRAP**: `string` = `'\x1b[?7h'`

### ENABLE\_MOUSE

> **ENABLE\_MOUSE**: `string` = `'\x1b[?1000h\x1b[?1002h\x1b[?1003h'`

### ERASE\_DISPLAY

> **ERASE\_DISPLAY**: `string` = `'\x1b[J'`

### ERASE\_DISPLAY\_ALL

> **ERASE\_DISPLAY\_ALL**: `string` = `'\x1b[2J'`

### ERASE\_DISPLAY\_START

> **ERASE\_DISPLAY\_START**: `string` = `'\x1b[1J'`

### ERASE\_LINE

> **ERASE\_LINE**: `string` = `'\x1b[K'`

### ERASE\_LINE\_ALL

> **ERASE\_LINE\_ALL**: `string` = `'\x1b[2K'`

### ERASE\_LINE\_START

> **ERASE\_LINE\_START**: `string` = `'\x1b[1K'`

### ERASE\_SAVED\_LINES

> **ERASE\_SAVED\_LINES**: `string` = `'\x1b[3J'`

### FG\_BLACK

> **FG\_BLACK**: `string` = `'\x1b[30m'`

### FG\_BLUE

> **FG\_BLUE**: `string` = `'\x1b[34m'`

### FG\_BRIGHT\_BLACK

> **FG\_BRIGHT\_BLACK**: `string` = `'\x1b[90m'`

### FG\_BRIGHT\_BLUE

> **FG\_BRIGHT\_BLUE**: `string` = `'\x1b[94m'`

### FG\_BRIGHT\_CYAN

> **FG\_BRIGHT\_CYAN**: `string` = `'\x1b[96m'`

### FG\_BRIGHT\_GREEN

> **FG\_BRIGHT\_GREEN**: `string` = `'\x1b[92m'`

### FG\_BRIGHT\_MAGENTA

> **FG\_BRIGHT\_MAGENTA**: `string` = `'\x1b[95m'`

### FG\_BRIGHT\_RED

> **FG\_BRIGHT\_RED**: `string` = `'\x1b[91m'`

### FG\_BRIGHT\_WHITE

> **FG\_BRIGHT\_WHITE**: `string` = `'\x1b[97m'`

### FG\_BRIGHT\_YELLOW

> **FG\_BRIGHT\_YELLOW**: `string` = `'\x1b[93m'`

### FG\_COLOR()

> **FG\_COLOR**: (`r`, `g`, `b`) => `string`

#### Parameters

##### r

`number`

##### g

`number`

##### b

`number`

#### Returns

`string`

### FG\_COLOR\_256()

> **FG\_COLOR\_256**: (`code`) => `string`

#### Parameters

##### code

`number`

#### Returns

`string`

### FG\_CYAN

> **FG\_CYAN**: `string` = `'\x1b[36m'`

### FG\_DEFAULT

> **FG\_DEFAULT**: `string` = `'\x1b[39m'`

### FG\_GREEN

> **FG\_GREEN**: `string` = `'\x1b[32m'`

### FG\_MAGENTA

> **FG\_MAGENTA**: `string` = `'\x1b[35m'`

### FG\_RED

> **FG\_RED**: `string` = `'\x1b[31m'`

### FG\_WHITE

> **FG\_WHITE**: `string` = `'\x1b[37m'`

### FG\_YELLOW

> **FG\_YELLOW**: `string` = `'\x1b[33m'`

### HIDDEN

> **HIDDEN**: `string` = `'\x1b[8m'`

### HYPERLINK()

> **HYPERLINK**: (`url`, `text`) => `string`

#### Parameters

##### url

`string`

##### text

`string`

#### Returns

`string`

### ITALIC

> **ITALIC**: `string` = `'\x1b[3m'`

### RESET

> **RESET**: `string` = `'\x1b[0m'`

### RESET\_BLINK

> **RESET\_BLINK**: `string` = `'\x1b[25m'`

### RESET\_BOLD\_DIM

> **RESET\_BOLD\_DIM**: `string` = `'\x1b[22m'`

### RESET\_HIDDEN

> **RESET\_HIDDEN**: `string` = `'\x1b[28m'`

### RESET\_ITALIC

> **RESET\_ITALIC**: `string` = `'\x1b[23m'`

### RESET\_REVERSE

> **RESET\_REVERSE**: `string` = `'\x1b[27m'`

### RESET\_STRIKETHROUGH

> **RESET\_STRIKETHROUGH**: `string` = `'\x1b[29m'`

### RESET\_UNDERLINE

> **RESET\_UNDERLINE**: `string` = `'\x1b[24m'`

### REVERSE

> **REVERSE**: `string` = `'\x1b[7m'`

### SCREEN\_RESTORE

> **SCREEN\_RESTORE**: `string` = `'\x1b[?47l'`

### SCREEN\_SAVE

> **SCREEN\_SAVE**: `string` = `'\x1b[?47h'`

### SET\_ICON\_TITLE()

> **SET\_ICON\_TITLE**: (`title`) => `string`

#### Parameters

##### title

`string`

#### Returns

`string`

### SET\_TITLE()

> **SET\_TITLE**: (`title`) => `string`

#### Parameters

##### title

`string`

#### Returns

`string`

### SET\_WINDOW\_TITLE()

> **SET\_WINDOW\_TITLE**: (`title`) => `string`

#### Parameters

##### title

`string`

#### Returns

`string`

### STRIKETHROUGH

> **STRIKETHROUGH**: `string` = `'\x1b[9m'`

### UNDERLINE

> **UNDERLINE**: `string` = `'\x1b[4m'`
