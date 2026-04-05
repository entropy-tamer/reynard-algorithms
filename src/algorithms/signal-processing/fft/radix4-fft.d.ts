/**
 * Radix-4 FFT Implementation
 *
 * Cooley-Tukey algorithm optimized for power-of-4 sizes with in-place computation.
 * Radix-4 reduces the number of stages by half compared to Radix-2, but each stage
 * processes 4 elements at a time.
 */
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";
/**
 * Radix-4 FFT implementation
 */
export declare class Radix4FFT extends FFTBase {
    private bitReversalPermutation;
    /**
     *
     * @param config
     * @example
     */
    constructor(config: FFTConfig);
    /**
     * Validate that size is power of 4
     * @example
     */
    private validateRadix4Size;
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
     * Core FFT computation using Radix-4 Cooley-Tukey algorithm
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
     * Get supported sizes (powers of 4 up to 64K)
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
//# sourceMappingURL=radix4-fft.d.ts.map