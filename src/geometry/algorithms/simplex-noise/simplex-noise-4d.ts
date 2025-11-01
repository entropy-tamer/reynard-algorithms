/**
 * @file algorithms/geometry/algorithms/simplex-noise/simplex-noise-4d
 * @module algorithms/geometry/algorithms/simplex-noise
 * @description Simplex Noise 4D Operations - Handles 4D noise generation and related utilities
 */

import type {
  SimplexNoiseConfig,
  NoiseStats,
  NoiseResult,
  Noise4DOptions,
  FractalNoiseOptions,
} from "./simplex-noise-types";
import { generateNoise4D, generateFractalNoise } from "./simplex-noise-generation";

/**
 * Generate 4D simplex noise at the given coordinates
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param w W coordinate
 * @param config Simplex noise configuration
 * @param grad4 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns The noise value in the range [-1, 1]
 * @example
 * const noise = noise4D(0.5, 0.3, 0.7, 0.2, config, grad4, perm, permMod12);
 * console.log(noise); // Output: noise value in range [-1, 1]
 */
export function noise4D(
  x: number,
  y: number,
  z: number,
  w: number,
  config: SimplexNoiseConfig,
  grad4: number[][],
  perm: number[],
  permMod12: number[]
): number {
  return generateNoise4D(x, y, z, w, config, grad4, perm, permMod12);
}

/**
 * Generate 4D fractal noise
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param w W coordinate
 * @param config Simplex noise configuration
 * @param options Fractal noise options
 * @param grad4 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Fractal noise value
 * @example
 * const noise = fractalNoise4D(0.5, 0.3, 0.7, 0.2, config, options, grad4, perm, permMod12);
 * console.log(noise); // Output: fractal noise value with multiple octaves
 */
export function fractalNoise4D(
  x: number,
  y: number,
  z: number,
  w: number,
  config: SimplexNoiseConfig,
  options: Partial<FractalNoiseOptions>,
  grad4: number[][],
  perm: number[],
  permMod12: number[]
): number {
  return generateFractalNoise(x, y, z, w, config, options, [], grad4, perm, permMod12);
}

/**
 * Generate 4D noise with options
 *
 * @param options 4D noise options
 * @param config Simplex noise configuration
 * @param grad4 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise result
 * @example
 * const result = generateNoise4DWithOptions({ width: 10, height: 10, depth: 10, time: 10 }, config, grad4, perm, permMod12);
 * console.log(result.stats.mean); // Output: average noise value
 */
export function generateNoise4DWithOptions(
  options: Noise4DOptions,
  config: SimplexNoiseConfig,
  grad4: number[][],
  perm: number[],
  permMod12: number[]
): NoiseResult {
  const startTime = performance.now();
  const values: number[] = [];
  const { width, height, depth, time, startX = 0, startY = 0, startZ = 0, startW = 0, stepX = 1, stepY = 1, stepZ = 1, stepW = 1 } = options;

  for (let w = 0; w < time; w++) {
    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const noiseX = startX + x * stepX;
          const noiseY = startY + y * stepY;
          const noiseZ = startZ + z * stepZ;
          const noiseW = startW + w * stepW;
          const value = generateNoise4D(noiseX, noiseY, noiseZ, noiseW, config, grad4, perm, permMod12);
          values.push(value);
        }
      }
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  const stats: NoiseStats = {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((sum, val) => sum + val, 0) / values.length,
    variance: computeVariance(values),
    standardDeviation: Math.sqrt(computeVariance(values)),
    executionTime,
    sampleCount: values.length,
  };

  return {
    values,
    stats,
    dimensions: { width, height, depth, time },
    success: true,
  };
}

/**
 * Generate 4D fractal noise with options
 *
 * @param options 4D noise options
 * @param config Simplex noise configuration
 * @param fractalOptions Fractal noise options
 * @param grad4 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise result
 * @example
 * const result = generateFractalNoise4DWithOptions({ width: 10, height: 10, depth: 10, time: 10 }, config, fractalOptions, grad4, perm, permMod12);
 * console.log(result.stats.mean); // Output: average fractal noise value
 */
export function generateFractalNoise4DWithOptions(
  options: Noise4DOptions,
  config: SimplexNoiseConfig,
  fractalOptions: Partial<FractalNoiseOptions>,
  grad4: number[][],
  perm: number[],
  permMod12: number[]
): NoiseResult {
  const startTime = performance.now();
  const values: number[] = [];
  const { width, height, depth, time, startX = 0, startY = 0, startZ = 0, startW = 0, stepX = 1, stepY = 1, stepZ = 1, stepW = 1 } = options;

  for (let w = 0; w < time; w++) {
    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const noiseX = startX + x * stepX;
          const noiseY = startY + y * stepY;
          const noiseZ = startZ + z * stepZ;
          const noiseW = startW + w * stepW;
          const value = generateFractalNoise(noiseX, noiseY, noiseZ, noiseW, config, fractalOptions, [], grad4, perm, permMod12);
          values.push(value);
        }
      }
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  const stats: NoiseStats = {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((sum, val) => sum + val, 0) / values.length,
    variance: computeVariance(values),
    standardDeviation: Math.sqrt(computeVariance(values)),
    executionTime,
    sampleCount: values.length,
  };

  return {
    values,
    stats,
    dimensions: { width, height, depth, time },
    success: true,
  };
}

/**
 * Compute variance of values
 *
 * @param values Array of values
 * @returns Variance
 * @example
 * const variance = computeVariance([0.1, 0.5, 0.9, 0.3]);
 * console.log(variance); // Output: variance value
 */
function computeVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => (val - mean) ** 2);
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}
