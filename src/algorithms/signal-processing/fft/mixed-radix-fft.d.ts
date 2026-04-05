/**
 * Mixed-Radix FFT Implementation
 *
 * Bluestein's algorithm for arbitrary sizes (not just powers of 2).
 * Uses convolution-based approach to handle any input size.
 */
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";
/**
 * Mixed-Radix FFT implementation using Bluestein's algorithm
 */
export declare class MixedRadixFFT extends FFTBase {
    private paddedSize;
    private radix2FFT;
    private chirpSignalReal;
    private chirpSignalImag;
    private chirpConjReal;
    private chirpConjImag;
    /**
     *
     * @param config
     * @example
     */
    constructor(config: FFTConfig);
    /**
     * Initialize FFT data structures
     * @example
     */
    private initialize;
    /**
     * Precompute chirp signals for Bluestein's algorithm
     * Chirp signal: W_N^(k^2/2) where W_N = e^(-2πi/N)
     * @example
     */
    private precomputeChirpSignals;
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
     * Compute FFT using Bluestein's algorithm
     * @param real
     * @param imag
     * @example
     */
    private computeBluesteinFFT;
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
     * Get supported sizes (any positive integer, but with performance warnings)
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
//# sourceMappingURL=mixed-radix-fft.d.ts.map