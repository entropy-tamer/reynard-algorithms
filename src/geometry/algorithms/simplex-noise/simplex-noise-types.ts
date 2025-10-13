/**
 * @module algorithms/geometry/algorithms/simplex-noise/types
 * @description Defines the types and interfaces for the Simplex Noise algorithm.
 */

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Represents a 3D point with x, y, and z coordinates.
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Represents a 4D point with x, y, z, and w coordinates.
 */
export interface Point4D {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Configuration options for Simplex Noise generation.
 */
export interface SimplexNoiseConfig {
  /**
   * The seed value for random number generation.
   * @default 0
   */
  seed?: number;
  /**
   * The frequency of the noise (higher = more detail).
   * @default 1.0
   */
  frequency?: number;
  /**
   * The amplitude of the noise (higher = more variation).
   * @default 1.0
   */
  amplitude?: number;
  /**
   * The number of octaves for fractal noise.
   * @default 4
   */
  octaves?: number;
  /**
   * The persistence value for fractal noise (how much each octave contributes).
   * @default 0.5
   */
  persistence?: number;
  /**
   * The lacunarity value for fractal noise (frequency multiplier between octaves).
   * @default 2.0
   */
  lacunarity?: number;
  /**
   * The scale factor for the noise.
   * @default 1.0
   */
  scale?: number;
  /**
   * The offset applied to input coordinates.
   * @default { x: 0, y: 0, z: 0, w: 0 }
   */
  offset?: Point4D;
  /**
   * Whether to normalize the output to [0, 1] range.
   * @default false
   */
  normalize?: boolean;
  /**
   * Whether to use improved gradient tables for better quality.
   * @default true
   */
  useImprovedGradients?: boolean;
}

/**
 * Statistics about noise generation.
 */
export interface NoiseStats {
  /**
   * The number of noise samples generated.
   */
  sampleCount: number;
  /**
   * The time taken for generation in milliseconds.
   */
  executionTime: number;
  /**
   * The minimum noise value generated.
   */
  minValue: number;
  /**
   * The maximum noise value generated.
   */
  maxValue: number;
  /**
   * The average noise value generated.
   */
  averageValue: number;
  /**
   * The standard deviation of noise values.
   */
  standardDeviation: number;
  /**
   * Whether the generation was successful.
   */
  success: boolean;
  /**
   * Error message if generation failed.
   */
  error?: string;
}

/**
 * The result of noise generation.
 */
export interface NoiseResult {
  /**
   * The generated noise values.
   */
  values: number[];
  /**
   * Statistics about the generation.
   */
  stats: NoiseStats;
}

/**
 * Options for 2D noise generation.
 */
export interface Noise2DOptions {
  /**
   * Width of the noise field.
   */
  width: number;
  /**
   * Height of the noise field.
   */
  height: number;
  /**
   * X coordinate offset.
   * @default 0
   */
  offsetX?: number;
  /**
   * Y coordinate offset.
   * @default 0
   */
  offsetY?: number;
  /**
   * Step size between samples.
   * @default 1.0
   */
  stepSize?: number;
}

/**
 * Options for 3D noise generation.
 */
export interface Noise3DOptions {
  /**
   * Width of the noise field.
   */
  width: number;
  /**
   * Height of the noise field.
   */
  height: number;
  /**
   * Depth of the noise field.
   */
  depth: number;
  /**
   * X coordinate offset.
   * @default 0
   */
  offsetX?: number;
  /**
   * Y coordinate offset.
   * @default 0
   */
  offsetY?: number;
  /**
   * Z coordinate offset.
   * @default 0
   */
  offsetZ?: number;
  /**
   * Step size between samples.
   * @default 1.0
   */
  stepSize?: number;
}

/**
 * Options for 4D noise generation.
 */
export interface Noise4DOptions {
  /**
   * Width of the noise field.
   */
  width: number;
  /**
   * Height of the noise field.
   */
  height: number;
  /**
   * Depth of the noise field.
   */
  depth: number;
  /**
   * Time dimension of the noise field.
   */
  time: number;
  /**
   * X coordinate offset.
   * @default 0
   */
  offsetX?: number;
  /**
   * Y coordinate offset.
   * @default 0
   */
  offsetY?: number;
  /**
   * Z coordinate offset.
   * @default 0
   */
  offsetZ?: number;
  /**
   * W coordinate offset.
   * @default 0
   */
  offsetW?: number;
  /**
   * Step size between samples.
   * @default 1.0
   */
  stepSize?: number;
}

/**
 * Options for fractal noise generation.
 */
export interface FractalNoiseOptions {
  /**
   * The number of octaves.
   * @default 4
   */
  octaves?: number;
  /**
   * The persistence value.
   * @default 0.5
   */
  persistence?: number;
  /**
   * The lacunarity value.
   * @default 2.0
   */
  lacunarity?: number;
  /**
   * The base frequency.
   * @default 1.0
   */
  baseFrequency?: number;
  /**
   * The base amplitude.
   * @default 1.0
   */
  baseAmplitude?: number;
}

/**
 * Options for noise analysis.
 */
export interface NoiseAnalysisOptions {
  /**
   * Whether to compute statistical properties.
   * @default true
   */
  computeStatistics?: boolean;
  /**
   * Whether to compute frequency domain properties.
   * @default false
   */
  computeFrequencyDomain?: boolean;
  /**
   * Whether to compute spatial properties.
   * @default false
   */
  computeSpatialProperties?: boolean;
}

/**
 * Analysis results for noise.
 */
export interface NoiseAnalysis {
  /**
   * Statistical properties of the noise.
   */
  statistics: {
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
    variance: number;
    skewness: number;
    kurtosis: number;
  };
  /**
   * Frequency domain properties (if computed).
   */
  frequencyDomain?: {
    dominantFrequencies: number[];
    spectralCentroid: number;
    spectralRolloff: number;
  };
  /**
   * Spatial properties (if computed).
   */
  spatialProperties?: {
    correlationLength: number;
    anisotropy: number;
    roughness: number;
  };
}

/**
 * Options for noise filtering.
 */
export interface NoiseFilterOptions {
  /**
   * The type of filter to apply.
   */
  filterType: "lowpass" | "highpass" | "bandpass" | "bandstop";
  /**
   * The cutoff frequency for the filter.
   */
  cutoffFrequency: number;
  /**
   * The filter order (for higher-order filters).
   * @default 1
   */
  order?: number;
  /**
   * The bandwidth for bandpass/bandstop filters.
   * @default 0.1
   */
  bandwidth?: number;
}

/**
 * Result of noise filtering.
 */
export interface NoiseFilterResult {
  /**
   * The filtered noise values.
   */
  filteredValues: number[];
  /**
   * The original noise values.
   */
  originalValues: number[];
  /**
   * The filter response.
   */
  filterResponse: number[];
  /**
   * Statistics about the filtering operation.
   */
  stats: {
    executionTime: number;
    filterGain: number;
    noiseReduction: number;
  };
}
