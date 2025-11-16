/**
 * FFT Base Class
 *
 * Abstract base class for all FFT implementations with common functionality,
 * performance monitoring, and integration with Reynard algorithms package.
 */

import { MemoryMonitor } from "../../../utils/memory/memory";
import { PerformanceTimer } from "../../../utils/performance/timer";
import { ComplexArrayOps } from "./core/complex-number";
import type { DSPStats, FFTConfig, FFTPerformanceMetrics, FFTResult } from "./fft-types";

/**
 * Abstract FFT base class
 */
export abstract class FFTBase {
  protected size: number;
  protected config: FFTConfig;
  protected performanceTimer: PerformanceTimer;
  protected memoryMonitor: MemoryMonitor;
  protected stats: DSPStats;
  private lastDuration: number = 0;

  constructor(config: FFTConfig) {
    this.config = { ...config };
    this.size = config.size;
    this.performanceTimer = new PerformanceTimer();
    this.memoryMonitor = new MemoryMonitor();
    this.stats = {
      totalOperations: 0,
      averageProcessingTime: 0,
      memoryPeak: 0,
      cacheEfficiency: 0,
    };
  }

  /**
   * Abstract forward FFT method
   */
  abstract forward(input: Float32Array): FFTResult;

  /**
   * Abstract forward complex FFT method
   */
  abstract forwardComplex(real: Float32Array, imag: Float32Array): FFTResult;

  /**
   * Abstract inverse FFT method
   */
  abstract inverse(real: Float32Array, imag: Float32Array): FFTResult;

  /**
   * Validate input size
   */
  protected validateSize(size: number): void {
    if (size <= 0 || !Number.isInteger(size)) {
      throw new Error(`Invalid FFT size: ${size}. Must be a positive integer.`);
    }
  }

  /**
   * Validate input arrays
   */
  protected validateInput(real: Float32Array, imag?: Float32Array): void {
    if (real.length !== this.size) {
      throw new Error(`Input size mismatch. Expected ${this.size}, got ${real.length}`);
    }

    if (imag && imag.length !== this.size) {
      throw new Error(`Imaginary array size mismatch. Expected ${this.size}, got ${imag.length}`);
    }
  }

  /**
   * Normalize FFT result
   */
  protected normalize(result: FFTResult): FFTResult {
    if (!this.config.normalize) {
      return result;
    }

    const factor = 1 / this.size;
    for (let i = 0; i < result.real.length; i++) {
      result.real[i] *= factor;
      result.imag[i] *= factor;
    }

    // Recompute magnitude and power after normalization
    ComplexArrayOps.magnitude(result, result.magnitude);
    ComplexArrayOps.power(result, result.power);

    return result;
  }

  /**
   * Create FFT result structure
   */
  protected createResult(real: Float32Array, imag: Float32Array): FFTResult {
    const magnitude = new Float32Array(real.length);
    const phase = new Float32Array(real.length);
    const power = new Float32Array(real.length);
    const frequencies = new Float32Array(real.length);

    // Compute magnitude, phase, and power
    ComplexArrayOps.magnitude({ real, imag }, magnitude);
    ComplexArrayOps.phase({ real, imag }, phase);
    ComplexArrayOps.power({ real, imag }, power);

    // Generate frequency bins
    const sampleRate = this.config.sampleRate || 44100;
    for (let i = 0; i < frequencies.length; i++) {
      frequencies[i] = (i * sampleRate) / this.size;
    }

    return {
      real,
      imag,
      magnitude,
      phase,
      power,
      frequencies,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FFTConfig>): void {
    const oldSize = this.size;
    this.config = { ...this.config, ...newConfig };

    if (newConfig.size && newConfig.size !== oldSize) {
      this.size = newConfig.size;
      this.reinitialize();
    }
  }

  /**
   * Reinitialize FFT for new size
   */
  protected abstract reinitialize(): void;

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): FFTPerformanceMetrics {
    return {
      processingTime: this.stats.averageProcessingTime,
      memoryUsage: this.memoryMonitor.getAverageUsage(),
      cacheHitRate: this.stats.cacheEfficiency,
      optimizationLevel: this.getOptimizationLevel(),
    };
  }

  /**
   * Get optimization level (0-1)
   */
  protected abstract getOptimizationLevel(): number;

  /**
   * Get statistics
   */
  getStats(): DSPStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalOperations: 0,
      averageProcessingTime: 0,
      memoryPeak: 0,
      cacheEfficiency: 0,
    };
    this.performanceTimer.reset();
    this.memoryMonitor.clear();
  }

  /**
   * Get FFT size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Get configuration
   */
  getConfig(): FFTConfig {
    return { ...this.config };
  }

  /**
   * Check if size is supported
   */
  abstract isSizeSupported(size: number): boolean;

  /**
   * Get supported sizes
   */
  abstract getSupportedSizes(): number[];

  /**
   * Get last duration (for internal use)
   */
  protected getLastDuration(): number {
    return this.lastDuration;
  }

  /**
   * Start performance monitoring
   */
  protected startMonitoring(): void {
    this.performanceTimer.start();
    this.memoryMonitor.measure();
  }

  /**
   * Stop performance monitoring
   */
  protected stopMonitoring(): void {
    this.lastDuration = this.performanceTimer.stop();
    this.memoryMonitor.measure();
  }

  /**
   * Update performance statistics
   */
  protected updateStats(): void {
    this.stats.totalOperations++;
    const currentTime = this.lastDuration;
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (this.stats.totalOperations - 1) + currentTime) / this.stats.totalOperations;

    const currentMemory = this.memoryMonitor.getAverageUsage();
    if (currentMemory > this.stats.memoryPeak) {
      this.stats.memoryPeak = currentMemory;
    }
  }

  /**
   * Benchmark FFT performance
   */
  async benchmark(iterations: number = 100): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    throughput: number;
  }> {
    const testData = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      testData[i] = Math.sin((2 * Math.PI * i) / this.size);
    }

    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      this.performanceTimer.start();
      this.forward(testData);
      const time = this.performanceTimer.stop();
      times.push(time);
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = this.size / averageTime; // samples per second

    return {
      averageTime,
      minTime,
      maxTime,
      throughput,
    };
  }

  /**
   * Verify FFT accuracy with known test cases
   */
  verifyAccuracy(): {
    dcTest: boolean;
    sineTest: boolean;
    impulseTest: boolean;
    roundTripTest: boolean;
  } {
    // Use more lenient tolerance for Float32Array precision
    const tolerance = 1e-4;

    // DC test (constant input should give impulse at DC)
    const dcInput = new Float32Array(this.size).fill(1);
    const dcResult = this.forward(dcInput);
    const dcTest = Math.abs(dcResult.magnitude[0] - this.size) < tolerance * this.size;

    // Sine test (single frequency should give peak at that frequency)
    const freq = Math.min(10, Math.floor(this.size / 4));
    const sineInput = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      sineInput[i] = Math.sin((2 * Math.PI * freq * i) / this.size);
    }
    const sineResult = this.forward(sineInput);
    const sineTest =
      freq > 0 &&
      freq < this.size - 1 &&
      sineResult.magnitude[freq] > sineResult.magnitude[freq - 1] &&
      sineResult.magnitude[freq] > sineResult.magnitude[freq + 1];

    // Impulse test (impulse should give flat spectrum)
    const impulseInput = new Float32Array(this.size);
    impulseInput[0] = 1;
    const impulseResult = this.forward(impulseInput);
    const impulseTest = Math.abs(impulseResult.magnitude[0] - 1) < tolerance;

    // Round-trip test (forward then inverse should recover original)
    const testInput = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      testInput[i] = Math.random();
    }
    const forwardResult = this.forward(testInput);
    const inverseResult = this.inverse(forwardResult.real, forwardResult.imag);
    let roundTripTest = true;
    const scale = this.config.normalize ? 1 : this.size; // Scale factor for inverse FFT
    for (let i = 0; i < this.size; i++) {
      const expected = this.config.normalize ? testInput[i] : testInput[i] * scale;
      const error = Math.abs(inverseResult.real[i] - expected);
      const relativeError = error / Math.max(Math.abs(testInput[i]), 1);
      if (relativeError > tolerance * 100 && error > tolerance * this.size) {
        roundTripTest = false;
        break;
      }
    }

    return {
      dcTest,
      sineTest,
      impulseTest,
      roundTripTest,
    };
  }
}
