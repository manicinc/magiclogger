# Function: workerHandler()

> **workerHandler**(`handler`): `void`

Defined in: [src/transports/WorkerTransport.ts:295](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L295)

Worker thread handler for receiving log batches.
Use this in your worker script.

## Parameters

### handler

(`entries`) => `void`

## Returns

`void`

## Example

```javascript
// log-worker.js
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');

const stream = fs.createWriteStream(workerData.logFile);

parentPort.on('message', ({ type, entries }) => {
  if (type === 'batch') {
    for (const entry of entries) {
      stream.write(JSON.stringify(entry) + '\\n');
    }
  }
});
```
