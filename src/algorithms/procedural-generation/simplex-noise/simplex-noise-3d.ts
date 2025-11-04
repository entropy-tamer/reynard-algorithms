/**
 * Simplex Noise 3D Operations
 *
 * Handles 3D noise generation and related utilities
 * for the Simplex Noise algorithm.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type {
  SimplexNoiseConfig,
  NoiseStats,
  NoiseResult,
  Noise3DOptions,
  FractalNoiseOptions,
} from "./simplex-noise-types";
import { generateNoise3D, generateFractalNoise } from "./simplex-noise-generation";

/**
 * Generate 3D simplex noise at the given coordinates
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param config Simplex noise configuration
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns The noise value in the range [-1, 1]
 * @example
 */
export function noise3D(
  x: number,
  y: number,
  z: number,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): number {
  return generateNoise3D(x, y, z, config, grad3, perm, permMod12);
}

/**
 * Generate 3D fractal noise
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param config Simplex noise configuration
 * @param options Fractal noise options
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Fractal noise value
 * @example
 */
export function fractalNoise3D(
  x: number,
  y: number,
  z: number,
  config: SimplexNoiseConfig,
  options: Partial<FractalNoiseOptions>,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): number {
  return generateFractalNoise(x, y, z, undefined, config, options, grad3, [], perm, permMod12);
}

/**
 * Generate 3D noise with options
 *
 * @param options 3D noise options
 * @param config Simplex noise configuration
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise result
 * @example
 */
export function generateNoise3DWithOptions(
  options: Noise3DOptions,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): NoiseResult {
  const startTime = performance.now();
  const values: number[] = [];
  const { width, height, depth, startX = 0, startY = 0, startZ = 0, stepX = 1, stepY = 1, stepZ = 1 } = options;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noiseX = startX + x * stepX;
        const noiseY = startY + y * stepY;
        const noiseZ = startZ + z * stepZ;
        const value = generateNoise3D(noiseX, noiseY, noiseZ, config, grad3, perm, permMod12);
        values.push(value);
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
    dimensions: { width, height, depth },
    success: true,
  };
}

/**
 * Generate 3D fractal noise with options
 *
 * @param options 3D noise options
 * @param config Simplex noise configuration
 * @param fractalOptions Fractal noise options
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise result
 * @example
 */
export function generateFractalNoise3DWithOptions(
  options: Noise3DOptions,
  config: SimplexNoiseConfig,
  fractalOptions: Partial<FractalNoiseOptions>,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): NoiseResult {
  const startTime = performance.now();
  const values: number[] = [];
  const { width, height, depth, startX = 0, startY = 0, startZ = 0, stepX = 1, stepY = 1, stepZ = 1 } = options;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noiseX = startX + x * stepX;
        const noiseY = startY + y * stepY;
        const noiseZ = startZ + z * stepZ;
        const value = generateFractalNoise(
          noiseX,
          noiseY,
          noiseZ,
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
    dimensions: { width, height, depth },
    success: true,
  };
}

/**
 * Compute variance of values
 *
 * @param values Array of values
 * @returns Variance
 * @example
 */
function computeVariance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => (val - mean) ** 2);
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}
