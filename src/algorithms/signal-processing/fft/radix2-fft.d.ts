/**
 * Radix-2 FFT Implementation
 *
 * Cooley-Tukey algorithm for power-of-2 sizes with in-place computation
 * and bit-reversal optimization.
 */
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";
/**
 * Radix-2 FFT implementation
 */
export declare class Radix2FFT extends FFTBase {
    private bitReversalPermutation;
    /**
     *
     * @param config
     * @example
     */
    constructor(config: FFTConfig);
    /**
     * Validate that size is power of 2
     * @example
     */
    private validateRadix2Size;
    /**
     * Initialize FFT data structures
     * @example
     */
    private initialize;
    /**
     * Forward FFT (real input to complex output)
     * @param input
     * @example
     */
    forward(input: Float32Array): FFTResult;
    /**
     * Forward complex FFT
     * @param real
     * @param imag
     * @example
     */
    forwardComplex(real: Float32Array, imag: Float32Array): FFTResult;
    /**
     * Inverse FFT
     * @param real
     * @param imag
     * @example
     */
    inverse(real: Float32Array, imag: Float32Array): FFTResult;
    /**
     * Core FFT computation using Cooley-Tukey algorithm
     * @param real
     * @param imag
     * @example
     */
    private computeFFT;
    /**
     * Reinitialize for new size
     * @example
     */
    protected reinitialize(): void;
    /**
     * Get optimization level
     * @example
     */
    protected getOptimizationLevel(): number;
    /**
     * Check if size is supported
     * @param size
     * @example
     */
    isSizeSupported(size: number): boolean;
    /**
     * Get supported sizes (powers of 2 up to 64K)
     * @example
     */
    getSupportedSizes(): number[];
    /**
     * Get algorithm name
     * @example
     */
    getAlgorithmName(): string;
    /**
     * Get algorithm description
     * @example
     */
    getAlgorithmDescription(): string;
    /**
     * Get computational complexity
     * @example
     */
    getComplexity(): {
        time: string;
        space: string;
    };
}
//# sourceMappingURL=radix2-fft.d.ts.map