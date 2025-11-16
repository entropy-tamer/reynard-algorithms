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
  private twiddleFactors!: Array<{ real: number; imag: number }>;

  constructor(config: FFTConfig) {
    super(config);
    this.validateRadix2Size();
    this.initialize();
  }

  /**
   * Validate that size is power of 2
   */
  private validateRadix2Size(): void {
    if (!BitReversal.isPowerOf2(this.size)) {
      throw new Error(`Radix-2 FFT requires power-of-2 size, got ${this.size}`);
    }
  }

  /**
   * Initialize FFT data structures
   */
  private initialize(): void {
    this.bitReversalPermutation = BitReversal.getPermutation(this.size);
    this.twiddleFactors = TwiddleFactors.getButterflyFactors(this.size, 1);
  }

  /**
   * Forward FFT (real input to complex output)
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
      this.normalize(result);

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Forward complex FFT
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
      this.normalize(result);

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Inverse FFT
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
        imagCopy[i] = -imagCopy[i];
      }

      // Perform forward FFT
      this.computeFFT(realCopy, imagCopy);

      // Conjugate result
      for (let i = 0; i < this.size; i++) {
        imagCopy[i] = -imagCopy[i];
      }

      // Create result
      const result = this.createResult(realCopy, imagCopy);
      this.normalize(result);

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Core FFT computation using Cooley-Tukey algorithm
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
          const tempReal = real[k + halfSize] * twiddle.real - imag[k + halfSize] * twiddle.imag;
          const tempImag = real[k + halfSize] * twiddle.imag + imag[k + halfSize] * twiddle.real;

          real[k + halfSize] = real[k] - tempReal;
          imag[k + halfSize] = imag[k] - tempImag;
          real[k] += tempReal;
          imag[k] += tempImag;
        }
      }
    }
  }

  /**
   * Reinitialize for new size
   */
  protected reinitialize(): void {
    this.validateRadix2Size();
    this.initialize();
  }

  /**
   * Get optimization level
   */
  protected getOptimizationLevel(): number {
    // Radix-2 is moderately optimized
    return 0.7;
  }

  /**
   * Check if size is supported
   */
  isSizeSupported(size: number): boolean {
    return BitReversal.isPowerOf2(size);
  }

  /**
   * Get supported sizes (powers of 2 up to 64K)
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
   */
  getAlgorithmName(): string {
    return "Radix-2 Cooley-Tukey";
  }

  /**
   * Get algorithm description
   */
  getAlgorithmDescription(): string {
    return "Decimation-in-time FFT using Cooley-Tukey algorithm for power-of-2 sizes";
  }

  /**
   * Get computational complexity
   */
  getComplexity(): { time: string; space: string } {
    return {
      time: "O(N log N)",
      space: "O(N)",
    };
  }
}

