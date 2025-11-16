/**
 * Bit Reversal Operations
 *
 * Efficient bit reversal for FFT algorithms with caching for common sizes.
 */

/**
 * Bit reversal lookup table cache
 */
class BitReversalCache {
  private cache = new Map<number, Uint32Array>();
  private maxCachedSize = 65536; // Cache up to 64K

  /**
   * Get bit reversal permutation for given size
   */
  get(size: number): Uint32Array {
    if (size > this.maxCachedSize) {
      return this.computeBitReversal(size);
    }

    if (!this.cache.has(size)) {
      this.cache.set(size, this.computeBitReversal(size));
    }

    return this.cache.get(size)!;
  }

  /**
   * Compute bit reversal permutation
   */
  private computeBitReversal(size: number): Uint32Array {
    const permutation = new Uint32Array(size);
    const bits = Math.log2(size);

    for (let i = 0; i < size; i++) {
      permutation[i] = this.reverseBits(i, bits);
    }

    return permutation;
  }

  /**
   * Reverse bits of a number
   */
  private reverseBits(n: number, bits: number): number {
    let result = 0;
    for (let i = 0; i < bits; i++) {
      result = (result << 1) | (n & 1);
      n >>= 1;
    }
    return result;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cachedSizes: this.cache.size,
      maxCachedSize: this.maxCachedSize,
      memoryUsage: Array.from(this.cache.values()).reduce((sum, arr) => sum + arr.length * 4, 0),
    };
  }
}

/**
 * Global bit reversal cache instance
 */
const bitReversalCache = new BitReversalCache();

/**
 * Bit reversal utilities
 */
export class BitReversal {
  /**
   * Get bit reversal permutation for FFT
   */
  static getPermutation(size: number): Uint32Array {
    if (!this.isPowerOf2(size)) {
      throw new Error(`Bit reversal requires power-of-2 size, got ${size}`);
    }
    return bitReversalCache.get(size);
  }

  /**
   * Apply bit reversal permutation in-place
   */
  static applyPermutation<T extends Float32Array | Uint32Array>(array: T, permutation: Uint32Array): void {
    for (let i = 0; i < array.length; i++) {
      const j = permutation[i];
      if (i < j) {
        // Swap elements
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }
  }

  /**
   * Apply bit reversal to complex array
   */
  static applyComplexPermutation(real: Float32Array, imag: Float32Array, permutation: Uint32Array): void {
    for (let i = 0; i < real.length; i++) {
      const j = permutation[i];
      if (i < j) {
        // Swap real parts
        const tempReal = real[i];
        real[i] = real[j];
        real[j] = tempReal;

        // Swap imaginary parts
        const tempImag = imag[i];
        imag[i] = imag[j];
        imag[j] = tempImag;
      }
    }
  }

  /**
   * Check if number is power of 2
   */
  static isPowerOf2(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  /**
   * Get next power of 2
   */
  static nextPowerOf2(n: number): number {
    if (n <= 0) return 1;
    if (this.isPowerOf2(n)) return n;

    let power = 1;
    while (power < n) {
      power <<= 1;
    }
    return power;
  }

  /**
   * Get previous power of 2
   */
  static prevPowerOf2(n: number): number {
    if (n <= 1) return 1;
    if (this.isPowerOf2(n)) return n;

    let power = 1;
    while (power < n) {
      power <<= 1;
    }
    return power >> 1;
  }

  /**
   * Check if number is power of 4
   */
  static isPowerOf4(n: number): boolean {
    return n > 0 && this.isPowerOf2(n) && (n & 0xaaaaaaaa) === 0;
  }

  /**
   * Get log2 of power-of-2 number
   */
  static log2(n: number): number {
    if (!this.isPowerOf2(n)) {
      throw new Error(`log2 requires power-of-2 input, got ${n}`);
    }

    let log = 0;
    let num = n;
    while (num > 1) {
      num >>= 1;
      log++;
    }
    return log;
  }

  /**
   * Clear bit reversal cache
   */
  static clearCache(): void {
    bitReversalCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return bitReversalCache.getStats();
  }
}
