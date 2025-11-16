/**
 * Twiddle Factor Cache
 *
 * Precomputed twiddle factors for FFT algorithms with efficient caching strategies.
 */

import { ComplexNumber } from "./complex-number";

/**
 * Twiddle factor entry
 */
interface TwiddleEntry {
  N: number;
  k: number;
  real: number;
  imag: number;
}

/**
 * Twiddle factor cache
 */
class TwiddleFactorCache {
  private cache = new Map<string, TwiddleEntry>();
  private maxCacheSize = 10000;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  /**
   * Get twiddle factor W_N^k = e^(-2πik/N)
   */
  get(N: number, k: number): TwiddleEntry {
    const key = `${N}_${k}`;

    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key)!;
    }

    this.stats.misses++;

    // Evict if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    // Compute twiddle factor
    const angle = (-2 * Math.PI * k) / N;
    const twiddle: TwiddleEntry = {
      N,
      k,
      real: Math.cos(angle),
      imag: Math.sin(angle),
    };

    this.cache.set(key, twiddle);
    return twiddle;
  }

  /**
   * Precompute all twiddle factors for size N
   */
  precompute(N: number): void {
    for (let k = 0; k < N; k++) {
      this.get(N, k);
    }
  }

  /**
   * Evict oldest entry (simple FIFO)
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0 ? this.stats.hits / (this.stats.hits + this.stats.misses) : 0;

    return {
      ...this.stats,
      hitRate,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
    };
  }
}

/**
 * Global twiddle factor cache instance
 */
const twiddleCache = new TwiddleFactorCache();

/**
 * Twiddle factor utilities
 */
export class TwiddleFactors {
  /**
   * Get twiddle factor W_N^k
   */
  static get(N: number, k: number): { real: number; imag: number } {
    const entry = twiddleCache.get(N, k);
    return { real: entry.real, imag: entry.imag };
  }

  /**
   * Precompute all twiddle factors for size N
   */
  static precompute(N: number): void {
    twiddleCache.precompute(N);
  }

  /**
   * Get twiddle factor as complex number
   */
  static getComplex(N: number, k: number): ComplexNumber {
    const twiddle = this.get(N, k);
    return new ComplexNumber(twiddle.real, twiddle.imag);
  }

  /**
   * Get twiddle factor as array [real, imag]
   */
  static getArray(N: number, k: number): [number, number] {
    const twiddle = this.get(N, k);
    return [twiddle.real, twiddle.imag];
  }

  /**
   * Batch compute twiddle factors for butterfly operations
   * Returns array of {real, imag} objects
   */
  static getButterflyFactors(N: number, stage: number): Array<{ real: number; imag: number }> {
    const factors: Array<{ real: number; imag: number }> = [];
    const step = N / (1 << stage);

    for (let k = 0; k < step; k++) {
      factors.push(this.get(N, k * (1 << stage)));
    }

    return factors;
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    twiddleCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return twiddleCache.getStats();
  }
}

/**
 * Optimized twiddle factor computation for specific patterns
 */
export class OptimizedTwiddleFactors {
  /**
   * Compute twiddle factors for Radix-2 FFT
   */
  static computeRadix2(N: number): Float32Array[] {
    const real = new Float32Array(N / 2);
    const imag = new Float32Array(N / 2);

    for (let k = 0; k < N / 2; k++) {
      const angle = (-2 * Math.PI * k) / N;
      real[k] = Math.cos(angle);
      imag[k] = Math.sin(angle);
    }

    return [real, imag];
  }
}
