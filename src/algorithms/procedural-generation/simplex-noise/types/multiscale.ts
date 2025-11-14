/**
 * @file algorithms/geometry/algorithms/simplex-noise/types/multiscale
 * @module algorithms/geometry/algorithms/simplex-noise/types/multiscale
 * @description Multiscale noise type definitions for Simplex Noise.
 */

/**
 * Scale definition for multiscale noise generation
 */
export interface ScaleDefinition {
  /**
   * Frequency for this scale
   */
  frequency: number;
  /**
   * Amplitude for this scale
   */
  amplitude: number;
  /**
   * Optional name for this scale (for easier access)
   */
  name?: string;
}

/**
 * Combination modes for multiscale noise
 */
export type MultiscaleCombinationMode = "additive" | "multiplicative" | "weighted" | "max" | "min";

/**
 * Statistics for a single scale
 */
export interface ScaleStats {
  /**
   * Minimum value
   */
  min: number;
  /**
   * Maximum value
   */
  max: number;
  /**
   * Average value
   */
  average: number;
}

/**
 * Options for multiscale Simplex noise generation
 */
export interface MultiscaleSimplexNoiseOptions {
  /**
   * Array of scale definitions
   */
  scales: ScaleDefinition[];
  /**
   * How to combine scales (default: "additive")
   * @default "additive"
   */
  combinationMode?: MultiscaleCombinationMode;
  /**
   * Normalize combined result
   * @default false
   */
  normalize?: boolean;
  /**
   * Cache individual scale results for lazy access
   * @default false
   */
  cacheScales?: boolean;
}

/**
 * Result of multiscale Simplex noise generation
 */
export interface MultiscaleSimplexNoiseResult {
  /**
   * Individual scale results keyed by name or index
   */
  scales: Map<string | number, number>;
  /**
   * Combined result using specified mode
   */
  combined: number;
  /**
   * Statistics per scale (optional)
   */
  stats?: Map<string | number, ScaleStats>;
}





