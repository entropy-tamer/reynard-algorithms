/**
 * @file Test Utilities for FFT Library
 *
 * Common test functions and utilities for FFT testing.
 */

import type { FFTResult } from "../../../algorithms/signal-processing/fft/fft-types";

/**
 * Test signal generators
 */
export class TestSignalGenerator {
  /**
   * Generate sine wave
   * @param size - Number of samples
   * @param frequency - Frequency in Hz
   * @param sampleRate - Sample rate in Hz (default: 44100)
   * @returns Float32Array containing sine wave samples
   * @example
   * ```ts
   * const signal = TestSignalGenerator.sineWave(1024, 1000, 44100);
   * ```
   */
  static sineWave(size: number, frequency: number, sampleRate: number = 44100): Float32Array {
    const signal = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      signal[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    }
    return signal;
  }

  /**
   * Generate cosine wave
   * @param size - Number of samples
   * @param frequency - Frequency in Hz
   * @param sampleRate - Sample rate in Hz (default: 44100)
   * @returns Float32Array containing cosine wave samples
   * @example
   * ```ts
   * const signal = TestSignalGenerator.cosineWave(1024, 1000, 44100);
   * ```
   */
  static cosineWave(size: number, frequency: number, sampleRate: number = 44100): Float32Array {
    const signal = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      signal[i] = Math.cos((2 * Math.PI * frequency * i) / sampleRate);
    }
    return signal;
  }

  /**
   * Generate impulse (delta function)
   * @param size - Number of samples
   * @param position - Position of impulse (default: 0)
   * @returns Float32Array containing impulse signal
   * @example
   * ```ts
   * const signal = TestSignalGenerator.impulse(1024, 0);
   * ```
   */
  static impulse(size: number, position: number = 0): Float32Array {
    const signal = new Float32Array(size);
    if (position >= 0 && position < size) {
      signal[position] = 1;
    }
    return signal;
  }

  /**
   * Generate DC signal (constant)
   * @param size - Number of samples
   * @param amplitude - Signal amplitude (default: 1)
   * @returns Float32Array containing constant signal
   * @example
   * ```ts
   * const signal = TestSignalGenerator.dcSignal(1024, 1);
   * ```
   */
  static dcSignal(size: number, amplitude: number = 1): Float32Array {
    return new Float32Array(size).fill(amplitude);
  }

  /**
   * Generate white noise
   * @param size - Number of samples
   * @param amplitude - Noise amplitude (default: 1)
   * @returns Float32Array containing white noise samples
   * @example
   * ```ts
   * const signal = TestSignalGenerator.whiteNoise(1024, 0.5);
   * ```
   */
  static whiteNoise(size: number, amplitude: number = 1): Float32Array {
    const signal = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      signal[i] = (Math.random() - 0.5) * 2 * amplitude;
    }
    return signal;
  }

  /**
   * Generate chirp signal (frequency sweep)
   * @param size - Number of samples
   * @param startFreq - Starting frequency in Hz
   * @param endFreq - Ending frequency in Hz
   * @param sampleRate - Sample rate in Hz (default: 44100)
   * @returns Float32Array containing chirp signal
   * @example
   * ```ts
   * const signal = TestSignalGenerator.chirp(1024, 1000, 5000, 44100);
   * ```
   */
  static chirp(size: number, startFreq: number, endFreq: number, sampleRate: number = 44100): Float32Array {
    const signal = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const t = i / sampleRate;
      const freq = startFreq + (endFreq - startFreq) * t;
      signal[i] = Math.sin(2 * Math.PI * freq * t);
    }
    return signal;
  }

  /**
   * Generate multi-tone signal
   * @param size - Number of samples
   * @param frequencies - Array of frequencies in Hz
   * @param amplitudes - Array of amplitudes (default: all 1)
   * @param sampleRate - Sample rate in Hz (default: 44100)
   * @returns Float32Array containing multi-tone signal
   * @example
   * ```ts
   * const signal = TestSignalGenerator.multiTone(1024, [1000, 3000, 5000], [], 44100);
   * ```
   */
  static multiTone(
    size: number,
    frequencies: number[],
    amplitudes: number[] = [],
    sampleRate: number = 44100
  ): Float32Array {
    const signal = new Float32Array(size);
    const amps = amplitudes.length === frequencies.length ? amplitudes : frequencies.map(() => 1);

    for (let i = 0; i < size; i++) {
      let sum = 0;
      for (let j = 0; j < frequencies.length; j++) {
        sum += amps[j] * Math.sin((2 * Math.PI * frequencies[j] * i) / sampleRate);
      }
      signal[i] = sum;
    }
    return signal;
  }
}

/**
 * FFT validation utilities
 */
export class FFTValidator {
  private static readonly TOLERANCE = 1e-10;

  /**
   * Check if two FFT results are approximately equal
   * @param result1 - First FFT result
   * @param result2 - Second FFT result
   * @param tolerance - Comparison tolerance (default: 1e-10)
   * @returns True if results are approximately equal
   * @example
   * ```ts
   * const equal = FFTValidator.areEqual(result1, result2, 1e-6);
   * ```
   */
  static areEqual(result1: FFTResult, result2: FFTResult, tolerance: number = this.TOLERANCE): boolean {
    if (result1.real.length !== result2.real.length) return false;
    if (result1.imag.length !== result2.imag.length) return false;

    for (let i = 0; i < result1.real.length; i++) {
      if (Math.abs(result1.real[i] - result2.real[i]) > tolerance) return false;
      if (Math.abs(result1.imag[i] - result2.imag[i]) > tolerance) return false;
    }

    return true;
  }

  /**
   * Check Parseval's theorem (energy conservation)
   * For non-normalized FFT: sum(|x[n]|^2) = (1/N) * sum(|X[k]|^2)
   * @param timeDomain - Original time domain signal
   * @param fftResult - FFT result
   * @param tolerance - Comparison tolerance (default: 1e-7)
   * @returns True if Parseval's theorem is satisfied
   * @example
   * ```ts
   * const valid = FFTValidator.checkParsevalsTheorem(signal, fftResult);
   * ```
   */
  static checkParsevalsTheorem(
    timeDomain: Float32Array,
    fftResult: FFTResult,
    tolerance: number = this.TOLERANCE * 1000 // More lenient tolerance for Parseval
  ): boolean {
    // Time domain energy
    let timeEnergy = 0;
    for (let i = 0; i < timeDomain.length; i++) {
      timeEnergy += timeDomain[i] * timeDomain[i];
    }

    // Frequency domain energy (Parseval's theorem)
    // For non-normalized FFT: sum(|x[n]|^2) = (1/N) * sum(|X[k]|^2)
    let freqEnergy = 0;
    for (let i = 0; i < fftResult.real.length; i++) {
      freqEnergy += fftResult.real[i] * fftResult.real[i] + fftResult.imag[i] * fftResult.imag[i];
    }

    // Normalize by N (since FFT result is not normalized by default)
    freqEnergy = freqEnergy / timeDomain.length;

    // Allow for some numerical error - use relative error
    const error = Math.abs(timeEnergy - freqEnergy);
    const relativeError = error / Math.max(timeEnergy, freqEnergy, 1);
    return relativeError < tolerance;
  }

  /**
   * Check round-trip accuracy (forward then inverse FFT)
   * Note: Inverse FFT result needs to be scaled by N when normalization is disabled
   * @param original - Original signal
   * @param reconstructed - Reconstructed signal from inverse FFT
   * @param tolerance - Comparison tolerance (default: 1e-7)
   * @returns True if round-trip accuracy is maintained
   * @example
   * ```ts
   * const accurate = FFTValidator.checkRoundTripAccuracy(original, reconstructed);
   * ```
   */
  static checkRoundTripAccuracy(
    original: Float32Array,
    reconstructed: Float32Array,
    tolerance: number = this.TOLERANCE * 1000 // Very lenient for round-trip due to Float32Array precision
  ): boolean {
    if (original.length !== reconstructed.length) return false;

    // When normalization is disabled, inverse FFT result is scaled by N
    const scale = original.length;
    let maxError = 0;
    let maxRelativeError = 0;

    for (let i = 0; i < original.length; i++) {
      const scaled = reconstructed[i] / scale;
      const error = Math.abs(original[i] - scaled);
      const relativeError = error / Math.max(Math.abs(original[i]), 1);
      maxError = Math.max(maxError, error);
      maxRelativeError = Math.max(maxRelativeError, relativeError);
    }

    // Use both absolute and relative error checks with very lenient tolerance
    // Float32Array has ~7 decimal digits of precision
    const absoluteTolerance = tolerance * 10;
    const relativeTolerance = tolerance;

    return maxError < absoluteTolerance || maxRelativeError < relativeTolerance;
  }

  /**
   * Check if FFT result has expected properties
   * @param result - FFT result to validate
   * @param expectedSize - Expected size of the result
   * @returns True if result is valid
   * @example
   * ```ts
   * const valid = FFTValidator.validateFFTResult(result, 1024);
   * ```
   */
  static validateFFTResult(result: FFTResult, expectedSize: number): boolean {
    if (result.real.length !== expectedSize) return false;
    if (result.imag.length !== expectedSize) return false;
    if (result.magnitude.length !== expectedSize) return false;
    if (result.phase.length !== expectedSize) return false;
    if (result.power.length !== expectedSize) return false;
    if (result.frequencies.length !== expectedSize) return false;

    // Check that magnitude and power are consistent
    // Use very lenient tolerance for floating point precision (Float32Array has limited precision)
    const tolerance = this.TOLERANCE * 10000; // Very lenient for magnitude/power checks
    for (let i = 0; i < expectedSize; i++) {
      const expectedMagnitude = Math.sqrt(result.real[i] * result.real[i] + result.imag[i] * result.imag[i]);
      const expectedPower = result.real[i] * result.real[i] + result.imag[i] * result.imag[i];

      // Use relative error for better tolerance
      const magnitudeError = Math.abs(result.magnitude[i] - expectedMagnitude);
      const powerError = Math.abs(result.power[i] - expectedPower);
      const maxMagnitude = Math.max(Math.abs(result.magnitude[i]), Math.abs(expectedMagnitude), 1);
      const maxPower = Math.max(Math.abs(result.power[i]), Math.abs(expectedPower), 1);

      if (magnitudeError > tolerance * maxMagnitude && magnitudeError > tolerance) return false;
      if (powerError > tolerance * maxPower && powerError > tolerance) return false;
    }

    return true;
  }

  /**
   * Check if result is real-valued (imaginary part is zero)
   * @param result - FFT result to check
   * @param tolerance - Comparison tolerance (default: 1e-10)
   * @returns True if result is real-valued
   * @example
   * ```ts
   * const isReal = FFTValidator.isRealValued(result);
   * ```
   */
  static isRealValued(result: FFTResult, tolerance: number = this.TOLERANCE): boolean {
    for (let i = 0; i < result.imag.length; i++) {
      if (Math.abs(result.imag[i]) > tolerance) return false;
    }
    return true;
  }

  /**
   * Check if result is purely imaginary (real part is zero)
   * @param result - FFT result to check
   * @param tolerance - Comparison tolerance (default: 1e-10)
   * @returns True if result is purely imaginary
   * @example
   * ```ts
   * const isImag = FFTValidator.isImaginaryValued(result);
   * ```
   */
  static isImaginaryValued(result: FFTResult, tolerance: number = this.TOLERANCE): boolean {
    for (let i = 0; i < result.real.length; i++) {
      if (Math.abs(result.real[i]) > tolerance) return false;
    }
    return true;
  }

  /**
   * Check conjugate symmetry for real input
   * @param result - FFT result to check
   * @param tolerance - Comparison tolerance (default: 1e-10)
   * @returns True if result has conjugate symmetry
   * @example
   * ```ts
   * const hasSymmetry = FFTValidator.checkConjugateSymmetry(result);
   * ```
   */
  static checkConjugateSymmetry(result: FFTResult, tolerance: number = this.TOLERANCE): boolean {
    const n = result.real.length;

    // DC component should be real
    if (Math.abs(result.imag[0]) > tolerance) return false;

    // Nyquist component should be real (if it exists)
    if (n % 2 === 0 && Math.abs(result.imag[n / 2]) > tolerance) return false;

    // Check conjugate symmetry: X[k] = X*[N-k]
    for (let k = 1; k < Math.floor(n / 2); k++) {
      const conjugateIndex = n - k;

      if (Math.abs(result.real[k] - result.real[conjugateIndex]) > tolerance) return false;
      if (Math.abs(result.imag[k] + result.imag[conjugateIndex]) > tolerance) return false;
    }

    return true;
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTester {
  /**
   * Benchmark FFT performance
   * @param fftInstance - FFT instance to benchmark
   * @param testData - Test data array
   * @param iterations - Number of iterations (default: 100)
   * @returns Performance metrics
   * @example
   * ```ts
   * const metrics = await PerformanceTester.benchmarkFFT(fft, testData, 100);
   * ```
   */
  static async benchmarkFFT(
    fftInstance: any,
    testData: Float32Array,
    iterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    throughput: number;
  }> {
    const times: number[] = [];

    // Warm up
    for (let i = 0; i < 10; i++) {
      fftInstance.forward(testData);
    }

    // Benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fftInstance.forward(testData);
      const end = performance.now();
      times.push(end - start);
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = testData.length / averageTime; // samples per second

    return {
      averageTime,
      minTime,
      maxTime,
      throughput,
    };
  }
}

/**
 * Test data sets
 */
export class TestDataSets {
  /**
   * Get standard test sizes
   * @returns Array of standard test sizes
   * @example
   * ```ts
   * const sizes = TestDataSets.getTestSizes();
   * ```
   */
  static getTestSizes(): number[] {
    return [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
  }

  /**
   * Get power-of-2 test sizes
   * @returns Array of power-of-2 test sizes
   * @example
   * ```ts
   * const sizes = TestDataSets.getPowerOf2Sizes();
   * ```
   */
  static getPowerOf2Sizes(): number[] {
    return [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
  }
}
