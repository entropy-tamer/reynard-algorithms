/**
 * Radix-2 FFT Implementation
 *
 * Cooley-Tukey algorithm for power-of-2 sizes with in-place computation
 * and bit-reversal optimization.
 */

import { BitReversal } from "./core/bit-reversal";
import { TwiddleFactors } from "./core/twiddle-factors";
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";

/**
 * Radix-2 FFT implementation
 */
export class Radix2FFT extends FFTBase {
  private bitReversalPermutation!: Uint32Array;

  /**
   * Creates a radix-2 Cooley-Tukey transform that requires a power-of-two length.
   * The size is validated and the bit-reversal permutation is precomputed for the in-place butterflies.
   *
   * @param config Transform size and optional normalization settings.
   * @throws If the configured size is not a power of two.
   * Complexity: see `fft-radix2` in ~/src/foxtools/registry/algorithms/ (verified: O(N log N) time for transform length N, O(N) space).
   */
  constructor(config: FFTConfig) {
    super(config);
    this.validateRadix2Size();
    this.initialize();
  }

  /**
   * Validate that size is power of 2
   * @example
   */
  private validateRadix2Size(): void {
    if (!BitReversal.isPowerOf2(this.size)) {
      throw new Error(`Radix-2 FFT requires power-of-2 size, got ${this.size}`);
    }
  }

  /**
   * Initialize FFT data structures
   * @example
   */
  private initialize(): void {
    this.bitReversalPermutation = BitReversal.getPermutation(this.size);
  }

  /**
   * Computes the forward radix-2 FFT of a real-valued signal, producing the
   * complex frequency spectrum in bit-reversed input order followed by
   * in-place butterfly stages. The transform length must be a power of two;
   * otherwise construction already rejects the configuration.
   *
   * @param input Real-valued time-domain samples, length equal to the configured FFT size.
   * @returns FFT result with real and imaginary spectrum arrays and run metadata.
   * Complexity: see `fft-radix2` in ~/src/foxtools/registry/algorithms/ (verified: O(N log N) time for transform length N, O(N) space)
   * @example
   * ```typescript
   * const spectrum = new Radix2FFT({ size: 1024 }).forward(new Float32Array(1024));
   * console.log(spectrum.real.length);
   * ```
   */
  forward(input: Float32Array): FFTResult {
    this.validateInput(input);
    this.startMonitoring();

    try {
      // Create complex arrays
      const real = new Float32Array(this.size);
      const imag = new Float32Array(this.size);

      // Copy input to real part
      real.set(input);

      // Perform in-place FFT
      this.computeFFT(real, imag);

      // Create result
      const result = this.createResult(real, imag);
      this.finalizeResult(result);

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Forward complex FFT
   * @param real
   * @param imag
   * @example
   */
  forwardComplex(real: Float32Array, imag: Float32Array): FFTResult {
    this.validateInput(real, imag);
    this.startMonitoring();

    try {
      // Create copies to avoid modifying input
      const realCopy = new Float32Array(real);
      const imagCopy = new Float32Array(imag);

      // Perform in-place FFT
      this.computeFFT(realCopy, imagCopy);

      // Create result
      const result = this.createResult(realCopy, imagCopy);
      this.finalizeResult(result);

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Inverse FFT
   * @param real
   * @param imag
   * @example
   */
  inverse(real: Float32Array, imag: Float32Array): FFTResult {
    this.validateInput(real, imag);
    this.startMonitoring();

    try {
      // Create copies to avoid modifying input
      const realCopy = new Float32Array(real);
      const imagCopy = new Float32Array(imag);

      // Conjugate input for inverse FFT
      for (let i = 0; i < this.size; i++) {
        const value = imagCopy[i];
        if (value !== undefined) {
          imagCopy[i] = -value;
        }
      }

      // Perform forward FFT
      this.computeFFT(realCopy, imagCopy);

      // Conjugate result
      for (let i = 0; i < this.size; i++) {
        const value = imagCopy[i];
        if (value !== undefined) {
          imagCopy[i] = -value;
        }
      }

      // Create result
      const result = this.createResult(realCopy, imagCopy);
      this.finalizeResult(result, { runValidations: false });

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Core FFT computation using Cooley-Tukey algorithm
   * @param real
   * @param imag
   * @example
   */
  private computeFFT(real: Float32Array, imag: Float32Array): void {
    // Apply bit-reversal permutation
    BitReversal.applyComplexPermutation(real, imag, this.bitReversalPermutation);

    // Decimation-in-time FFT
    for (let size = 2; size <= this.size; size *= 2) {
      const halfSize = size / 2;
      const step = this.size / size;

      for (let i = 0; i < this.size; i += size) {
        for (let j = 0; j < halfSize; j++) {
          const k = i + j;
          const twiddleIndex = j * step;

          // Get twiddle factor
          const twiddle = TwiddleFactors.get(this.size, twiddleIndex);

          // Butterfly operation
          const realK = real[k];
          const imagK = imag[k];
          const realKHalf = real[k + halfSize];
          const imagKHalf = imag[k + halfSize];

          if (realK !== undefined && imagK !== undefined && realKHalf !== undefined && imagKHalf !== undefined) {
            const tempReal = realKHalf * twiddle.real - imagKHalf * twiddle.imag;
            const tempImag = realKHalf * twiddle.imag + imagKHalf * twiddle.real;

            real[k + halfSize] = realK - tempReal;
            imag[k + halfSize] = imagK - tempImag;
            real[k] = realK + tempReal;
            imag[k] = imagK + tempImag;
          }
        }
      }
    }
  }

  /**
   * Reinitialize for new size
   * @example
   */
  protected reinitialize(): void {
    this.validateRadix2Size();
    this.initialize();
  }

  /**
   * Get optimization level
   * @example
   */
  protected getOptimizationLevel(): number {
    // Radix-2 is moderately optimized
    return 0.7;
  }

  /**
   * Check if size is supported
   * @param size
   * @example
   */
  isSizeSupported(size: number): boolean {
    return BitReversal.isPowerOf2(size);
  }

  /**
   * Get supported sizes (powers of 2 up to 64K)
   * @example
   */
  getSupportedSizes(): number[] {
    const sizes: number[] = [];
    for (let i = 1; i <= 16; i++) {
      sizes.push(1 << i); // 2, 4, 8, 16, ..., 65536
    }
    return sizes;
  }

  /**
   * Get algorithm name
   * @example
   */
  getAlgorithmName(): string {
    return "Radix-2 Cooley-Tukey";
  }

  /**
   * Get algorithm description
   * @example
   */
  getAlgorithmDescription(): string {
    return "Decimation-in-time FFT using Cooley-Tukey algorithm for power-of-2 sizes";
  }

  /**
   * Get computational complexity
   * @example
   */
  getComplexity(): { time: string; space: string } {
    return {
      time: "O(N log N)",
      space: "O(N)",
    };
  }
}
