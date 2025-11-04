/**
 * @file algorithms/geometry/algorithms/simplex-noise/types/fractal
 * @module algorithms/geometry/algorithms/simplex-noise/types/fractal
 * @description Fractal noise option type definitions for Simplex Noise.
 */

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
