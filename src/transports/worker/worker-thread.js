/**
 * @fileoverview Worker thread for high-performance async logging
 * 
 * This runs in a separate thread and processes log entries from
 * the ring buffer, writing them to the configured output.
 */

const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const { join } = require('path');

// Extract configuration
const { ringBuffer, metaBuffer, bufferSize } = workerData;

// Create typed arrays for shared buffers
const buffer = new Uint8Array(ringBuffer);
const meta = new Int32Array(metaBuffer);

// Buffer states
const BufferState = {
  EMPTY: 0,
  WRITING: 1,
  READY: 2,
  READING: 3,
};

// Configuration
const HEADER_SIZE = 16;
let readIndex = 0;
let running = true;

// Output stream (configurable)
const outputPath = process.env.MAGICLOGGER_OUTPUT || 'app.log';
const outputStream = fs.createWriteStream(outputPath, { flags: 'a' });

/**
 * Process entries from the ring buffer
 */
async function processBuffer() {
  while (running) {
    const writeIndex = Atomics.load(meta, 0);
    
    // Check for shutdown signal
    if (writeIndex === -1) {
      running = false;
      break;
    }
    
    // Process available entries
    while (readIndex !== writeIndex) {
      // Read header
      const header = new DataView(ringBuffer, readIndex, HEADER_SIZE);
      const dataLen = header.getUint32(0, true);
      const state = header.getUint32(4, true);
      
      // Wait if still writing
      if (state === BufferState.WRITING) {
        await new Promise(resolve => setTimeout(resolve, 0));
        continue;
      }
      
      // Skip if not ready
      if (state !== BufferState.READY) {
        readIndex += HEADER_SIZE + dataLen;
        if (readIndex >= bufferSize) readIndex = 0;
        continue;
      }
      
      // Mark as reading
      header.setUint32(4, BufferState.READING, true);
      
      // Read data
      const data = buffer.slice(
        readIndex + HEADER_SIZE,
        readIndex + HEADER_SIZE + dataLen
      );
      
      // Process the log entry
      try {
        const json = new TextDecoder().decode(data);
        outputStream.write(json + '\n');
      } catch (err) {
        console.error('[Worker] Failed to process entry:', err);
      }
      
      // Mark as empty
      header.setUint32(4, BufferState.EMPTY, true);
      
      // Update read index
      readIndex += HEADER_SIZE + dataLen;
      if (readIndex >= bufferSize) readIndex = 0;
      
      // Update shared read index
      Atomics.store(meta, 1, readIndex);
    }
    
    // Wait for new data
    if (readIndex === writeIndex) {
      const result = Atomics.wait(meta, 0, writeIndex, 100);
      // result is 'ok', 'not-equal', or 'timed-out'
    }
  }
  
  // Cleanup
  outputStream.end();
}

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('[Worker] Uncaught exception:', err);
  process.exit(1);
});

// Start processing
processBuffer().catch(err => {
  console.error('[Worker] Fatal error:', err);
  process.exit(1);
});