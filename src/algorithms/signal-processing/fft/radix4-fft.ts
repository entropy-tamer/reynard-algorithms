/**
 * Radix-4 FFT Implementation
 *
 * Cooley-Tukey algorithm optimized for power-of-4 sizes with in-place computation.
 * Radix-4 reduces the number of stages by half compared to Radix-2, but each stage
 * processes 4 elements at a time.
 */

import { BitReversal } from "./core/bit-reversal";
import { TwiddleFactors } from "./core/twiddle-factors";
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";

/**
 * Radix-4 FFT implementation
 */
export class Radix4FFT extends FFTBase {
  private bitReversalPermutation!: Uint32Array;

  constructor(config: FFTConfig) {
    super(config);
    this.validateRadix4Size();
    this.initialize();
  }

  /**
   * Validate that size is power of 4
   */
  private validateRadix4Size(): void {
    if (!BitReversal.isPowerOf4(this.size)) {
      throw new Error(`Radix-4 FFT requires power-of-4 size, got ${this.size}`);
    }
  }

  /**
   * Initialize FFT data structures
   */
  private initialize(): void {
    this.bitReversalPermutation = BitReversal.getPermutation(this.size);
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
   * Core FFT computation using Radix-4 Cooley-Tukey algorithm
   */
  private computeFFT(real: Float32Array, imag: Float32Array): void {
    // Apply bit-reversal permutation
    BitReversal.applyComplexPermutation(real, imag, this.bitReversalPermutation);

    // Decimation-in-time FFT with Radix-4 butterflies
    for (let size = 4; size <= this.size; size *= 4) {
      const quarterSize = size / 4;
      const step = this.size / size;

      for (let i = 0; i < this.size; i += size) {
        // Process 4-point DFTs
        for (let j = 0; j < quarterSize; j++) {
          const k0 = i + j;
          const k1 = k0 + quarterSize;
          const k2 = k1 + quarterSize;
          const k3 = k2 + quarterSize;

          // Get twiddle factors
          const w1 = TwiddleFactors.get(this.size, j * step);
          const w2 = TwiddleFactors.get(this.size, 2 * j * step);
          const w3 = TwiddleFactors.get(this.size, 3 * j * step);

          // Radix-4 butterfly operation
          // First, compute 4-point DFT
          const a0Real = real[k0];
          const a0Imag = imag[k0];
          const a1Real = real[k1] * w1.real - imag[k1] * w1.imag;
          const a1Imag = real[k1] * w1.imag + imag[k1] * w1.real;
          const a2Real = real[k2] * w2.real - imag[k2] * w2.imag;
          const a2Imag = real[k2] * w2.imag + imag[k2] * w2.real;
          const a3Real = real[k3] * w3.real - imag[k3] * w3.imag;
          const a3Imag = real[k3] * w3.imag + imag[k3] * w3.real;

          // 4-point DFT computation
          const t0Real = a0Real + a2Real;
          const t0Imag = a0Imag + a2Imag;
          const t1Real = a0Real - a2Real;
          const t1Imag = a0Imag - a2Imag;
          const t2Real = a1Real + a3Real;
          const t2Imag = a1Imag + a3Imag;
          const t3Real = a1Real - a3Real;
          const t3Imag = a1Imag - a3Imag;

          // Multiply t3 by -j (rotate by -90 degrees)
          const t3RotatedReal = t3Imag;
          const t3RotatedImag = -t3Real;

          // Final outputs
          real[k0] = t0Real + t2Real;
          imag[k0] = t0Imag + t2Imag;
          real[k1] = t1Real + t3RotatedReal;
          imag[k1] = t1Imag + t3RotatedImag;
          real[k2] = t0Real - t2Real;
          imag[k2] = t0Imag - t2Imag;
          real[k3] = t1Real - t3RotatedReal;
          imag[k3] = t1Imag - t3RotatedImag;
        }
      }
    }
  }

  /**
   * Reinitialize for new size
   */
  protected reinitialize(): void {
    this.validateRadix4Size();
    this.initialize();
  }

  /**
   * Get optimization level
   */
  protected getOptimizationLevel(): number {
    // Radix-4 is more optimized than Radix-2
    return 0.8;
  }

  /**
   * Check if size is supported
   */
  isSizeSupported(size: number): boolean {
    return BitReversal.isPowerOf4(size);
  }

  /**
   * Get supported sizes (powers of 4 up to 64K)
   */
  getSupportedSizes(): number[] {
    const sizes: number[] = [];
    for (let i = 1; i <= 8; i++) {
      const size = Math.pow(4, i); // 4, 16, 64, 256, 1024, 4096, 16384, 65536
      if (size <= 65536) {
        sizes.push(size);
      }
    }
    return sizes;
  }

  /**
   * Get algorithm name
   */
  getAlgorithmName(): string {
    return "Radix-4 Cooley-Tukey";
  }

  /**
   * Get algorithm description
   */
  getAlgorithmDescription(): string {
    return "Decimation-in-time FFT using Radix-4 Cooley-Tukey algorithm for power-of-4 sizes";
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

