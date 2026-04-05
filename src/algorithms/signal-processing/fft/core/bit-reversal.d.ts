/**
 * Bit Reversal Operations
 *
 * Efficient bit reversal for FFT algorithms with caching for common sizes.
 */
/**
 * Bit reversal utilities
 */
export declare class BitReversal {
    /**
     * Get bit reversal permutation for FFT
     * @param size
     * @example
     */
    static getPermutation(size: number): Uint32Array;
    /**
     * Apply bit reversal permutation in-place
     * @param array
     * @param permutation
     * @example
     */
    static applyPermutation<T extends Float32Array | Uint32Array>(array: T, permutation: Uint32Array): void;
    /**
     * Apply bit reversal to complex array
     * @param real
     * @param imag
     * @param permutation
     * @example
     */
    static applyComplexPermutation(real: Float32Array, imag: Float32Array, permutation: Uint32Array): void;
    /**
     * Check if number is power of 2
     * @param n
     * @example
     */
    static isPowerOf2(n: number): boolean;
    /**
     * Get next power of 2
     * @param n
     * @example
     */
    static nextPowerOf2(n: number): number;
    /**
     * Get previous power of 2
     * @param n
     * @example
     */
    static prevPowerOf2(n: number): number;
    /**
     * Check if number is power of 4
     * @param n
     * @example
     */
    static isPowerOf4(n: number): boolean;
    /**
     * Get log2 of power-of-2 number
     * @param n
     * @example
     */
    static log2(n: number): number;
    /**
     * Clear bit reversal cache
     * @example
     */
    static clearCache(): void;
    /**
     * Get cache statistics
     * @example
     */
    static getCacheStats(): {
        cachedSizes: number;
        maxCachedSize: number;
        memoryUsage: number;
    };
}
//# sourceMappingURL=bit-reversal.d.ts.map