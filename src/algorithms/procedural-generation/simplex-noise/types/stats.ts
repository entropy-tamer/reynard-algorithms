/**
 * @file algorithms/geometry/algorithms/simplex-noise/types/stats
 * @module algorithms/geometry/algorithms/simplex-noise/types/stats
 * @description Statistics and result type definitions for Simplex Noise.
 */

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
  minValue?: number;
  /** Optional alias used by generators */
  min?: number;
  /**
   * The maximum noise value generated.
   */
  maxValue?: number;
  /** Optional alias used by generators */
  max?: number;
  /**
   * The average noise value generated.
   */
  averageValue?: number;
  /** Optional alias used by generators */
  mean?: number;
  /**
   * The standard deviation of noise values.
   */
  standardDeviation: number;
  /** Optional variance alias sometimes computed */
  variance?: number;
  /**
   * Whether the generation was successful.
   */
  success?: boolean;
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
  /** Optional dimension metadata (count or shape) */
  dimensions?: number | { width: number; height: number; depth?: number; time?: number };
  /** Optional generation success flag */
  success?: boolean;
}
