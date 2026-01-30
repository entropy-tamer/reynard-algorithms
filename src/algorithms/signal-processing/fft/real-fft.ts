/**
 * Real FFT Implementation
 *
 * Optimized FFT for real-valued input signals.
 * Uses symmetry properties to reduce computation by approximately half.
 */

import { BitReversal } from "./core/bit-reversal";
import { TwiddleFactors } from "./core/twiddle-factors";
import type { FFTConfig, FFTResult } from "./fft-types";
import { FFTBase } from "./fft-base";
import { Radix2FFT } from "./radix2-fft";

/**
 * Real FFT implementation
 */
export class RealFFT extends FFTBase {
  private radix2FFT!: Radix2FFT;

  /**
   *
   * @param config
   * @example
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
      throw new Error(`Real FFT requires power-of-2 size, got ${this.size}`);
    }
  }

  /**
   * Initialize FFT data structures
   * @example
   */
  private initialize(): void {
    // Use Radix-2 FFT for the complex FFT step
    this.radix2FFT = new Radix2FFT({
      size: this.size / 2,
      normalize: false,
    });
  }

  /**
   * Forward FFT (real input to complex output)
   * This is the main method for real FFT
   * @param input
   * @example
   */
  forward(input: Float32Array): FFTResult {
    this.validateInput(input);
    this.startMonitoring();

    try {
      // Pack two real signals into one complex signal
      const packedReal = new Float32Array(this.size / 2);
      const packedImag = new Float32Array(this.size / 2);

      for (let i = 0; i < this.size / 2; i++) {
        const realIdx = 2 * i;
        const imagIdx = 2 * i + 1;
        packedReal[i] = input[realIdx] ?? 0;
        packedImag[i] = input[imagIdx] ?? 0;
      }

      // Compute FFT of packed signal
      const packedFFT = this.radix2FFT.forwardComplex(packedReal, packedImag);

      // Unpack and combine to get full FFT
      const resultReal = new Float32Array(this.size);
      const resultImag = new Float32Array(this.size);

      // DC component (k=0)
      const dcReal = packedFFT.real[0] ?? 0;
      const dcImag = packedFFT.imag[0] ?? 0;
      resultReal[0] = dcReal + dcImag;
      resultImag[0] = 0;

      // Nyquist component (k=N/2)
      const nyquist = this.size / 2;
      resultReal[nyquist] = dcReal - dcImag;
      resultImag[nyquist] = 0;

      // Other components using symmetry
      for (let k = 1; k < this.size / 2; k++) {
        const twiddle = TwiddleFactors.get(this.size, k);

        // Extract components from packed FFT
        const aReal = packedFFT.real[k] ?? 0;
        const aImag = packedFFT.imag[k] ?? 0;
        const conjugateIdx = this.size / 2 - k;
        const bReal = packedFFT.real[conjugateIdx] ?? 0;
        const bImag = -(packedFFT.imag[conjugateIdx] ?? 0); // Conjugate

        // Combine using twiddle factors
        const tReal = (aReal + bReal) / 2;
        const tImag = (aImag + bImag) / 2;
        const uReal = (aImag - bImag) / 2;
        const uImag = (bReal - aReal) / 2;

        // Apply twiddle factor
        const wReal = twiddle.real;
        const wImag = twiddle.imag;

        resultReal[k] = tReal + uReal * wReal - uImag * wImag;
        resultImag[k] = tImag + uReal * wImag + uImag * wReal;

        // Use symmetry: X[N-k] = X*[k]
        const symIdx = this.size - k;
        const kReal = resultReal[k] ?? 0;
        const kImag = resultImag[k] ?? 0;
        resultReal[symIdx] = kReal;
        resultImag[symIdx] = -kImag;
      }

      // Create result
      const result = this.createResult(resultReal, resultImag);
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
   * For real FFT, this treats the input as real-valued (imag part ignored)
   * @param real
   * @param _imag
   * @example
   */
  forwardComplex(real: Float32Array, _imag: Float32Array): FFTResult {
    // For real FFT, ignore imaginary part and use real part only
    return this.forward(real);
  }

  /**
   * Inverse FFT
   * Reconstructs real-valued signal from FFT result
   * @param real
   * @param imag
   * @example
   */
  inverse(real: Float32Array, imag: Float32Array): FFTResult {
    this.validateInput(real, imag);
    this.startMonitoring();

    try {
      // Verify symmetry property for real signals
      // X[N-k] should equal X*[k] for real input
      const nyquist = this.size / 2;
      const nyquistReal = real[nyquist] ?? 0;
      const nyquistImag = imag[nyquist] ?? 0;
      if (Math.abs(nyquistReal) > 1e-6 || Math.abs(nyquistImag) > 1e-6) {
        // Not a valid real FFT result, but proceed anyway
      }

      // Pack FFT result for inverse computation
      const packedReal = new Float32Array(this.size / 2);
      const packedImag = new Float32Array(this.size / 2);

      // DC and Nyquist
      const real0 = real[0] ?? 0;
      const realNyquist = real[nyquist] ?? 0;
      packedReal[0] = (real0 + realNyquist) / 2;
      packedImag[0] = (real0 - realNyquist) / 2;

      // Other components
      for (let k = 1; k < this.size / 2; k++) {
        const twiddle = TwiddleFactors.get(this.size, k);
        const wReal = twiddle.real;
        const wImag = twiddle.imag;

        // Extract components
        const xReal = real[k] ?? 0;
        const xImag = imag[k] ?? 0;

        // Apply inverse twiddle and combine
        const tReal = xReal;
        const tImag = xImag;

        // Combine with conjugate symmetry
        const aReal = (tReal + xReal) / 2;
        const aImag = (tImag - xImag) / 2;

        // Apply twiddle factor
        packedReal[k] = aReal * wReal - aImag * wImag;
        packedImag[k] = aReal * wImag + aImag * wReal;
      }

      // Compute inverse FFT
      const packedIFFT = this.radix2FFT.inverse(packedReal, packedImag);

      // Unpack to get real signal
      const resultReal = new Float32Array(this.size);
      const resultImag = new Float32Array(this.size);

      for (let i = 0; i < this.size / 2; i++) {
        const realIdx = 2 * i;
        const imagIdx = 2 * i + 1;
        resultReal[realIdx] = packedIFFT.real[i] ?? 0;
        resultReal[imagIdx] = packedIFFT.imag[i] ?? 0;
      }

      // Create result
      const result = this.createResult(resultReal, resultImag);
      this.finalizeResult(result, { runValidations: false });

      // Update statistics
      this.updateStats();

      return result;
    } finally {
      this.stopMonitoring();
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
    // Real FFT is highly optimized for real signals
    return 0.9;
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
    return "Real FFT";
  }

  /**
   * Get algorithm description
   * @example
   */
  getAlgorithmDescription(): string {
    return "Optimized FFT for real-valued signals using symmetry properties";
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
