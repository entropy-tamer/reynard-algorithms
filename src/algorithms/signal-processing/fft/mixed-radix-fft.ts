/**
 * Mixed-Radix FFT Implementation
 *
 * Bluestein's algorithm for arbitrary sizes (not just powers of 2).
 * Uses convolution-based approach to handle any input size.
 */

import { BitReversal } from "./core/bit-reversal";
import { TwiddleFactors } from "./core/twiddle-factors";
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";
import { Radix2FFT } from "./radix2-fft";

/**
 * Mixed-Radix FFT implementation using Bluestein's algorithm
 */
export class MixedRadixFFT extends FFTBase {
  private paddedSize!: number;
  private radix2FFT!: Radix2FFT;
  private chirpSignalReal!: Float32Array;
  private chirpSignalImag!: Float32Array;
  private chirpConjReal!: Float32Array;
  private chirpConjImag!: Float32Array;

  constructor(config: FFTConfig) {
    super(config);
    this.validateSize(this.size);
    this.initialize();
  }

  /**
   * Initialize FFT data structures
   */
  private initialize(): void {
    // Bluestein's algorithm: pad to next power of 2
    this.paddedSize = BitReversal.nextPowerOf2(2 * this.size - 1);

    // Create Radix-2 FFT for convolution
    this.radix2FFT = new Radix2FFT({
      size: this.paddedSize,
      normalize: false,
    });

    // Precompute chirp signals for Bluestein's algorithm
    this.precomputeChirpSignals();
  }

  /**
   * Precompute chirp signals for Bluestein's algorithm
   * Chirp signal: W_N^(k^2/2) where W_N = e^(-2πi/N)
   */
  private precomputeChirpSignals(): void {
    this.chirpSignalReal = new Float32Array(this.size);
    this.chirpSignalImag = new Float32Array(this.size);
    this.chirpConjReal = new Float32Array(this.size);
    this.chirpConjImag = new Float32Array(this.size);

    const piOverN = Math.PI / this.size;

    for (let k = 0; k < this.size; k++) {
      // Chirp: W_N^(k^2/2) = e^(-πi k^2 / N)
      const angle = -piOverN * k * k;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);

      this.chirpSignalReal[k] = cosAngle;
      this.chirpSignalImag[k] = sinAngle;

      // Conjugate for inverse
      this.chirpConjReal[k] = cosAngle;
      this.chirpConjImag[k] = -sinAngle;
    }
  }

  /**
   * Forward FFT (real input to complex output)
   */
  forward(input: Float32Array): FFTResult {
    this.validateInput(input);
    this.startMonitoring();

    try {
      // Create complex arrays
      const real = new Float32Array(input);
      const imag = new Float32Array(this.size);

      // Perform Bluestein's FFT
      const result = this.computeBluesteinFFT(real, imag);

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

      // Perform Bluestein's FFT
      const result = this.computeBluesteinFFT(realCopy, imagCopy);

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

      // Perform Bluestein's FFT
      const result = this.computeBluesteinFFT(realCopy, imagCopy);

      // Conjugate result
      for (let i = 0; i < this.size; i++) {
        imagCopy[i] = -imagCopy[i];
      }

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
    }
  }

  /**
   * Compute FFT using Bluestein's algorithm
   */
  private computeBluesteinFFT(real: Float32Array, imag: Float32Array): FFTResult {
    // Step 1: Multiply input by chirp signal
    const xReal = new Float32Array(this.size);
    const xImag = new Float32Array(this.size);

    for (let k = 0; k < this.size; k++) {
      const chirpReal = this.chirpSignalReal[k];
      const chirpImag = this.chirpSignalImag[k];

      // Complex multiplication: x[k] * chirp[k]
      xReal[k] = real[k] * chirpReal - imag[k] * chirpImag;
      xImag[k] = real[k] * chirpImag + imag[k] * chirpReal;
    }

    // Step 2: Pad to power of 2
    const paddedReal = new Float32Array(this.paddedSize);
    const paddedImag = new Float32Array(this.paddedSize);

    paddedReal.set(xReal);
    paddedImag.set(xImag);

    // Step 3: Create convolution kernel (chirp signal padded and reversed)
    const kernelReal = new Float32Array(this.paddedSize);
    const kernelImag = new Float32Array(this.paddedSize);

    // First element
    kernelReal[0] = this.chirpConjReal[0];
    kernelImag[0] = this.chirpConjImag[0];

    // Reverse and pad chirp signal
    for (let k = 1; k < this.size; k++) {
      kernelReal[this.paddedSize - k] = this.chirpConjReal[k];
      kernelImag[this.paddedSize - k] = this.chirpConjImag[k];
    }

    // Step 4: Compute FFT of padded signal and kernel
    const xFFT = this.radix2FFT.forwardComplex(paddedReal, paddedImag);
    const kernelFFT = this.radix2FFT.forwardComplex(kernelReal, kernelImag);

    // Step 5: Multiply in frequency domain (convolution)
    const convReal = new Float32Array(this.paddedSize);
    const convImag = new Float32Array(this.paddedSize);

    for (let k = 0; k < this.paddedSize; k++) {
      const xReal = xFFT.real[k];
      const xImag = xFFT.imag[k];
      const kReal = kernelFFT.real[k];
      const kImag = kernelFFT.imag[k];

      // Complex multiplication
      convReal[k] = xReal * kReal - xImag * kImag;
      convImag[k] = xReal * kImag + xImag * kReal;
    }

    // Step 6: Compute inverse FFT
    const convIFFT = this.radix2FFT.inverse(convReal, convImag);

    // Step 7: Extract result and multiply by chirp signal
    const resultReal = new Float32Array(this.size);
    const resultImag = new Float32Array(this.size);

    for (let k = 0; k < this.size; k++) {
      const convReal = convIFFT.real[k];
      const convImag = convIFFT.imag[k];
      const chirpReal = this.chirpSignalReal[k];
      const chirpImag = this.chirpSignalImag[k];

      // Complex multiplication: conv[k] * chirp[k]
      resultReal[k] = convReal * chirpReal - convImag * chirpImag;
      resultImag[k] = convReal * chirpImag + convImag * chirpReal;
    }

    // Create result
    const result = this.createResult(resultReal, resultImag);
    this.normalize(result);

    return result;
  }

  /**
   * Reinitialize for new size
   */
  protected reinitialize(): void {
    this.validateSize(this.size);
    this.initialize();
  }

  /**
   * Get optimization level
   */
  protected getOptimizationLevel(): number {
    // Mixed-radix is less optimized due to padding overhead
    return 0.5;
  }

  /**
   * Check if size is supported
   */
  isSizeSupported(size: number): boolean {
    return size > 0 && Number.isInteger(size);
  }

  /**
   * Get supported sizes (any positive integer, but with performance warnings)
   */
  getSupportedSizes(): number[] {
    // Return some example sizes
    return [100, 256, 512, 1000, 1024, 2048, 4096, 8192];
  }

  /**
   * Get algorithm name
   */
  getAlgorithmName(): string {
    return "Mixed-Radix (Bluestein)";
  }

  /**
   * Get algorithm description
   */
  getAlgorithmDescription(): string {
    return "Bluestein's algorithm for arbitrary sizes using convolution-based approach";
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

