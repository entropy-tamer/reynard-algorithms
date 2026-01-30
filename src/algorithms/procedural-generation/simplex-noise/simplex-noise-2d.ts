/**
 * @file Simplex Noise 2D Operations
 *
 * Handles 2D noise generation and related utilities
 * for the Simplex Noise algorithm.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type {
  SimplexNoiseConfig,
  NoiseStats,
  NoiseResult,
  Noise2DOptions,
  FractalNoiseOptions,
} from "./simplex-noise-types";
import { generateNoise2D, generateFractalNoise } from "./simplex-noise-generation";

/**
 * Generate 2D simplex noise at the given coordinates
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param config Simplex noise configuration
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns The noise value in the range [-1, 1]
 *
 * @example
 * // Generate a single 2D noise value at (10, 20)
 * const value = noise2D(10, 20, { frequency: 0.01, amplitude: 1 }, grad3, perm, permMod12);
 * // value is in the range [-1, 1]
 */
export function noise2D(
  x: number,
  y: number,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): number {
  return generateNoise2D(x, y, config, grad3, perm, permMod12);
}

/**
 * Generate 2D fractal noise
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param config Simplex noise configuration
 * @param options Fractal noise options
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Fractal noise value
 *
 * @example
 * // Generate fractal noise with 5 octaves at (0.5, 0.5)
 * const v = fractalNoise2D(0.5, 0.5, { frequency: 1 }, { octaves: 5 }, grad3, perm, permMod12);
 */
export function fractalNoise2D(
  x: number,
  y: number,
  config: SimplexNoiseConfig,
  options: Partial<FractalNoiseOptions>,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): number {
  return generateFractalNoise(x, y, undefined, undefined, config, options, grad3, [], perm, permMod12);
}

/**
 * Generate 2D noise with options
 *
 * @param options 2D noise options
 * @param config Simplex noise configuration
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise result
 *
 * @example
 * // Generate a 128x128 noise field starting at (0,0) with step size 0.02
 * const result = generateNoise2DWithOptions(
 *   { width: 128, height: 128, offsetX: 0, offsetY: 0, stepSize: 0.02 },
 *   { frequency: 1, amplitude: 1 },
 *   grad3,
 *   perm,
 *   permMod12
 * );
 * // Access values and stats
 * // result.values, result.stats
 */
export function generateNoise2DWithOptions(
  options: Noise2DOptions,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): NoiseResult {
  const startTime = performance.now();
  const values: number[] = [];
  const { width, height, offsetX = 0, offsetY = 0, stepSize = 1 } = options;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseX = offsetX + x * stepSize;
      const noiseY = offsetY + y * stepSize;
      const value = generateNoise2D(noiseX, noiseY, config, grad3, perm, permMod12);
      values.push(value);
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  const variance = computeVariance(values);
  const stats: NoiseStats = {
    sampleCount: values.length,
    executionTime,
    minValue: values.length ? Math.min(...values) : 0,
    maxValue: values.length ? Math.max(...values) : 0,
    averageValue: values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
    standardDeviation: Math.sqrt(variance),
    success: true,
  };

  return {
    values,
    stats,
  };
}

/**
 * Generate 2D fractal noise with options
 *
 * @param options 2D noise options
 * @param config Simplex noise configuration
 * @param fractalOptions Fractal noise options
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise result
 *
 * @example
 * // Fractal noise field with 6 octaves and step size 0.01
 * const result = generateFractalNoise2DWithOptions(
 *   { width: 64, height: 64, offsetX: 10, offsetY: 20, stepSize: 0.01 },
 *   { frequency: 1 },
 *   { octaves: 6, persistence: 0.5, lacunarity: 2 },
 *   grad3,
 *   perm,
 *   permMod12
 * );
 */
export function generateFractalNoise2DWithOptions(
  options: Noise2DOptions,
  config: SimplexNoiseConfig,
  fractalOptions: Partial<FractalNoiseOptions>,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): NoiseResult {
  const startTime = performance.now();
  const values: number[] = [];
  const { width, height, offsetX = 0, offsetY = 0, stepSize = 1 } = options;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseX = offsetX + x * stepSize;
      const noiseY = offsetY + y * stepSize;
      const value = generateFractalNoise(
        noiseX,
        noiseY,
        undefined,
        undefined,
        config,
        fractalOptions,
        grad3,
        [],
        perm,
        permMod12
      );
      values.push(value);
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  const variance = computeVariance(values);
  const stats: NoiseStats = {
    sampleCount: values.length,
    executionTime,
    minValue: values.length ? Math.min(...values) : 0,
    maxValue: values.length ? Math.max(...values) : 0,
    averageValue: values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
    standardDeviation: Math.sqrt(variance),
    success: true,
  };

  return {
    values,
    stats,
  };
}

/**
 * Compute variance of values
 *
 * @param values Array of values
 * @returns Variance
 *
 * @example
 * // Compute variance of an array of numbers
 * const v = computeVariance([1, 2, 3, 4]);
 */
function computeVariance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => (val - mean) ** 2);
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}
