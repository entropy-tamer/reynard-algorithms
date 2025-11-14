/**
 * Perlin Noise Types
 *
 * Type definitions for Perlin noise algorithms.
 */

/**
 * Perlin noise configuration
 */
export interface PerlinNoiseConfig {
  /** Seed for random number generation */
  seed?: number;
  /** Frequency of the noise */
  frequency?: number;
  /** Amplitude of the noise */
  amplitude?: number;
  /** Number of octaves for fractal noise */
  octaves?: number;
  /** Persistence between octaves */
  persistence?: number;
  /** Lacunarity (frequency multiplier) */
  lacunarity?: number;
  /** Scale factor */
  scale?: number;
  /** Offset for noise coordinates */
  offset?: { x?: number; y?: number; z?: number; w?: number };
  /** Whether to normalize output */
  normalize?: boolean;
}

/**
 * Perlin noise result
 */
export interface PerlinNoiseResult {
  /** Noise value */
  value: number;
  /** Gradient at this point (for 2D/3D) */
  gradient?: { x: number; y: number; z?: number };
}

/**
 * Perlin noise options
 */
export interface PerlinNoiseOptions {
  /** Frequency multiplier */
  frequency?: number;
  /** Amplitude multiplier */
  amplitude?: number;
  /** Number of octaves */
  octaves?: number;
  /** Persistence */
  persistence?: number;
  /** Lacunarity */
  lacunarity?: number;
  /** Whether to normalize */
  normalize?: boolean;
}

/**
 * Fractal Perlin noise options
 */
export interface FractalPerlinNoiseOptions extends PerlinNoiseOptions {
  /** Number of octaves */
  octaves: number;
  /** Persistence */
  persistence: number;
  /** Lacunarity */
  lacunarity: number;
}

/**
 * Perlin noise statistics
 */
export interface PerlinNoiseStats {
  /** Minimum noise value generated */
  minValue: number;
  /** Maximum noise value generated */
  maxValue: number;
  /** Average noise value */
  averageValue: number;
  /** Standard deviation */
  standardDeviation: number;
}

/**
 * Scale definition for multiscale noise generation
 */
export interface ScaleDefinition {
  /** Frequency for this scale */
  frequency: number;
  /** Amplitude for this scale */
  amplitude: number;
  /** Optional name for this scale (for easier access) */
  name?: string;
}

/**
 * Combination modes for multiscale noise
 */
export type MultiscaleCombinationMode = "additive" | "multiplicative" | "weighted" | "max" | "min";

/**
 * Options for multiscale Perlin noise generation
 */
export interface MultiscalePerlinNoiseOptions {
  /** Array of scale definitions */
  scales: ScaleDefinition[];
  /** How to combine scales (default: "additive") */
  combinationMode?: MultiscaleCombinationMode;
  /** Normalize combined result */
  normalize?: boolean;
  /** Cache individual scale results for lazy access */
  cacheScales?: boolean;
}

/**
 * Statistics for a single scale
 */
export interface ScaleStats {
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Average value */
  average: number;
}

/**
 * Result of multiscale Perlin noise generation
 */
export interface MultiscalePerlinNoiseResult {
  /** Individual scale results keyed by name or index */
  scales: Map<string | number, number>;
  /** Combined result using specified mode */
  combined: number;
  /** Statistics per scale (optional) */
  stats?: Map<string | number, ScaleStats>;
}
