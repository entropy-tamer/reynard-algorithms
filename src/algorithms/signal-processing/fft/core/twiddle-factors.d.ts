/**
 * Twiddle Factor Cache
 *
 * Precomputed twiddle factors for FFT algorithms with efficient caching strategies.
 */
import { ComplexNumber } from "./complex-number";
/**
 * Twiddle factor utilities
 */
export declare class TwiddleFactors {
    /**
     * Get twiddle factor W_N^k
     * @param N
     * @param k
     * @example
     */
    static get(N: number, k: number): {
        real: number;
        imag: number;
    };
    /**
     * Precompute all twiddle factors for size N
     * @param N
     * @example
     */
    static precompute(N: number): void;
    /**
     * Get twiddle factor as complex number
     * @param N
     * @param k
     * @example
     */
    static getComplex(N: number, k: number): ComplexNumber;
    /**
     * Get twiddle factor as array [real, imag]
     * @param N
     * @param k
     * @example
     */
    static getArray(N: number, k: number): [number, number];
    /**
     * Batch compute twiddle factors for butterfly operations
     * Returns array of {real, imag} objects
     * @param N
     * @param stage
     * @example
     */
    static getButterflyFactors(N: number, stage: number): Array<{
        real: number;
        imag: number;
    }>;
    /**
     * Clear cache
     * @example
     */
    static clearCache(): void;
    /**
     * Get cache statistics
     * @example
     */
    static getCacheStats(): {
        hitRate: number;
        cacheSize: number;
        maxCacheSize: number;
        hits: number;
        misses: number;
        evictions: number;
    };
}
/**
 * Optimized twiddle factor computation for specific patterns
 */
export declare class OptimizedTwiddleFactors {
    /**
     * Compute twiddle factors for Radix-2 FFT
     * @param N
     * @example
     */
    static computeRadix2(N: number): Float32Array[];
}
//# sourceMappingURL=twiddle-factors.d.ts.map