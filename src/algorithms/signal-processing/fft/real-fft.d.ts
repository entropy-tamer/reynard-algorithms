/**
 * Real FFT Implementation
 *
 * Optimized FFT for real-valued input signals.
 * Uses symmetry properties to reduce computation by approximately half.
 */
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";
/**
 * Real FFT implementation
 */
export declare class RealFFT extends FFTBase {
    private radix2FFT;
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
     * This is the main method for real FFT
     * @param input
     * @example
     */
    forward(input: Float32Array): FFTResult;
    /**
     * Forward complex FFT
     * For real FFT, this treats the input as real-valued (imag part ignored)
     * @param real
     * @param _imag
     * @example
     */
    forwardComplex(real: Float32Array, _imag: Float32Array): FFTResult;
    /**
     * Inverse FFT
     * Reconstructs real-valued signal from FFT result
     * @param real
     * @param imag
     * @example
     */
    inverse(real: Float32Array, imag: Float32Array): FFTResult;
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
//# sourceMappingURL=real-fft.d.ts.map