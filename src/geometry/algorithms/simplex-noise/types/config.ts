/**
 * @file algorithms/geometry/algorithms/simplex-noise/types/config
 * @module algorithms/geometry/algorithms/simplex-noise/types/config
 * @description Configuration type definitions for Simplex Noise.
 */

import type { Point4D } from "./points.js";

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

