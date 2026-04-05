/**
 * Array Buffer Pool for pre-allocated Float32Array management
 */
export class ArrayBufferPool {
  private buffers: Float32Array[] = [];
  private available: boolean[] = [];
  private nextFree: number = 0;
  private bufferSize: number;
  private poolSize: number;

  constructor(bufferSize: number, poolSize: number) {
    this.bufferSize = bufferSize;
    this.poolSize = poolSize;
    
    // Pre-allocate all buffers as Float32Array
    for (let i = 0; i < poolSize; i++) {
      this.buffers.push(new Float32Array(bufferSize));
      this.available.push(true);
    }
  }

  getBuffer(): Float32Array | null {
    if (this.nextFree < this.buffers.length) {
      const buffer = this.buffers[this.nextFree];
      if (buffer) {
        this.available[this.nextFree] = false;
        this.nextFree = this.findNextFree();
        return buffer;
      }
    }
    
    // Pool exhausted - return null to indicate new allocation needed
    return null;
  }

  releaseBuffer(buffer: Float32Array): void {
    const index = this.buffers.indexOf(buffer);
    if (index !== -1) {
      this.available[index] = true;
      if (index < this.nextFree) {
        this.nextFree = index;
      }
    }
  }

  private findNextFree(): number {
    for (let i = this.nextFree; i < this.available.length; i++) {
      if (this.available[i]) {
        return i;
      }
    }
    return this.available.length;
  }

  clear(): void {
    // Reset all buffers to available
    for (let i = 0; i < this.available.length; i++) {
      this.available[i] = true;
    }
    this.nextFree = 0;
  }
}
