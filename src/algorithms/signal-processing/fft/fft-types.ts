/**
 * FFT Type Definitions
 *
 * Core type definitions for the FFT implementation including
 * complex number representations, FFT configurations, and algorithm types.
 */

/**
 * Complex number representation using separate real and imaginary arrays
 * for efficient memory layout and SIMD optimization potential
 */
export interface ComplexArray {
  real: Float32Array;
  imag: Float32Array;
}

/**
 * FFT Algorithm types
 */
export enum FFTAlgorithm {
  RADIX_2 = "radix2",
  RADIX_4 = "radix4",
  MIXED_RADIX = "mixed_radix",
  REAL_FFT = "real_fft",
  AUTO = "auto",
}

/**
 * FFT Configuration
 */
export interface FFTConfig {
  size: number;
  algorithm?: FFTAlgorithm;
  normalize?: boolean;
  windowFunction?:
    | "hann"
    | "hamming"
    | "blackman"
    | "blackmanHarris"
    | "kaiser"
    | "bartlett"
    | "triangular"
    | "rectangular";
  kaiserBeta?: number; // For Kaiser window
  sampleRate?: number; // Sample rate for frequency calculations (default: 44100)
}

/**
 * Extended FFT Result interface
 */
export interface FFTResult {
  real: Float32Array;
  imag: Float32Array;
  magnitude: Float32Array;
  phase: Float32Array;
  power: Float32Array;
  frequencies: Float32Array;
}

/**
 * Frequency bin information
 */
export interface FrequencyBin {
  index: number;
  frequency: number;
  magnitude: number;
  phase: number;
  power: number;
}

/**
 * FFT Performance metrics
 */
export interface FFTPerformanceMetrics {
  processingTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  optimizationLevel: number;
}

/**
 * DSP Statistics
 */
export interface DSPStats {
  totalOperations: number;
  averageProcessingTime: number;
  memoryPeak: number;
  cacheEfficiency: number;
}
