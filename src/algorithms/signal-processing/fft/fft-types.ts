/**
 * FFT Type Definitions
 *
 * Core type definitions for the FFT implementation including
 * complex number representations, FFT configurations, and algorithm types.
 *
 * @file Defines shared FFT-related type interfaces and enums.
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
export enum FFTNormalizationMode {
  NONE = "none",
  STANDARD = "standard",
  ARTICLE = "article",
}

export enum FFTCoefficientStrategy {
  NONE = "none",
  ARTICLE = "article",
}

export type FFTCoefficientRepresentation = FFTCoefficientStrategy;

export interface FFTValidationIntegerCyclesOptions {
  enabled?: boolean;
  fundamentalFrequency?: number;
  tolerance?: number;
  minimumCycles?: number;
}

export interface FFTValidationTransientOptions {
  enabled?: boolean;
  lowFrequencyThreshold?: number;
  energyRatioThreshold?: number;
}

export interface FFTValidationOptions {
  integerCycles?: FFTValidationIntegerCyclesOptions;
  transients?: FFTValidationTransientOptions;
}

export interface FFTConfig {
  size: number;
  algorithm?: FFTAlgorithm;
  normalize?: boolean;
  normalizationMode?: FFTNormalizationMode;
  coefficientStrategy?: FFTCoefficientStrategy;
  validation?: FFTValidationOptions;
  fundamentalFrequency?: number;
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
  normalizationMode?: FFTNormalizationMode;
  coefficients?: HarmonicCoefficients;
  warnings?: FFTValidationWarning[];
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

export interface HarmonicCoefficients {
  cosine: Float32Array;
  sine: Float32Array;
  magnitude: Float32Array;
  phase: Float32Array;
  normalization: FFTNormalizationMode;
  strategy: FFTCoefficientStrategy;
}

export interface FFTValidationWarning {
  type: "integer-cycles" | "transients";
  severity: "info" | "warning";
  message: string;
  details?: Record<string, number>;
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
