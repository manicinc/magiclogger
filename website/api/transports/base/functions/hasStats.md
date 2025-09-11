# Function: hasStats()

> **hasStats**(`transport`): `transport is Transport & { getStats: () => TransportStats }`

Defined in: [src/transports/base/Transport.ts:761](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L761)

Type guard for checking if transport has stats.

## Parameters

### transport

`unknown`

Object to check

## Returns

`transport is Transport & { getStats: () => TransportStats }`

True if transport has stats
