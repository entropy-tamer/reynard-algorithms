/**
 * @file algorithms/geometry/algorithms/simplex-noise/types/dimensions
 * @module algorithms/geometry/algorithms/simplex-noise/types/dimensions
 * @description Dimension-specific option type definitions for Simplex Noise.
 */

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
  /** Optional alternative start offsets used by some generators */
  startX?: number;
  startY?: number;
  startZ?: number;
  /** Optional per-axis steps used by some generators */
  stepX?: number;
  stepY?: number;
  stepZ?: number;
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
  /** Optional alternative start offsets used by some generators */
  startX?: number;
  startY?: number;
  startZ?: number;
  startW?: number;
  /** Optional per-axis steps used by some generators */
  stepX?: number;
  stepY?: number;
  stepZ?: number;
  stepW?: number;
}
