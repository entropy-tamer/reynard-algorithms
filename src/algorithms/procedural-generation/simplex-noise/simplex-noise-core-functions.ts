/**
 * Simplex Noise Core Functions
 *
 * Handles core simplex noise calculation functions
 * for 2D, 3D, and 4D noise generation.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type { SimplexNoiseConfig, FractalNoiseOptions } from "./simplex-noise-types";
import { simplex2D } from "./simplex-noise-simplex-2d";
import { simplex3D } from "./simplex-noise-simplex-3d";
import { simplex4D } from "./simplex-noise-simplex-4d";

/**
 * Generate 2D noise
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param config Simplex noise configuration
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise value
 * @example
 * const noise = generateNoise2D(0.5, 0.3, config, grad3, perm, permMod12);
 * console.log(noise); // Output: noise value based on configuration
 */
export function generateNoise2D(
  x: number,
  y: number,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): number {
  const scaledX = (x + config.offset!.x) * config.frequency! * config.scale!;
  const scaledY = (y + config.offset!.y) * config.frequency! * config.scale!;

  let value = simplex2D(scaledX, scaledY, grad3, perm, permMod12);
  value *= config.amplitude!;

  if (config.normalize) {
    value = (value + 1) / 2;
  }

  return value;
}

/**
 * Generate 3D noise
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param config Simplex noise configuration
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise value
 * @example
 * const noise = generateNoise3D(0.5, 0.3, 0.7, config, grad3, perm, permMod12);
 * console.log(noise); // Output: noise value based on configuration
 */
export function generateNoise3D(
  x: number,
  y: number,
  z: number,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): number {
  const scaledX = (x + config.offset!.x) * config.frequency! * config.scale!;
  const scaledY = (y + config.offset!.y) * config.frequency! * config.scale!;
  const scaledZ = (z + config.offset!.z) * config.frequency! * config.scale!;

  let value = simplex3D(scaledX, scaledY, scaledZ, grad3, perm, permMod12);
  value *= config.amplitude!;

  if (config.normalize) {
    value = (value + 1) / 2;
  }

  return value;
}

/**
 * Generate 4D noise
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param w W coordinate
 * @param config Simplex noise configuration
 * @param grad4 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise value
 * @example
 * const noise = generateNoise4D(0.5, 0.3, 0.7, 0.2, config, grad4, perm, permMod12);
 * console.log(noise); // Output: noise value based on configuration
 */
export function generateNoise4D(
  x: number,
  y: number,
  z: number,
  w: number,
  config: SimplexNoiseConfig,
  grad4: number[][],
  perm: number[],
  permMod12: number[]
): number {
  const scaledX = (x + config.offset!.x) * config.frequency! * config.scale!;
  const scaledY = (y + config.offset!.y) * config.frequency! * config.scale!;
  const scaledZ = (z + config.offset!.z) * config.frequency! * config.scale!;
  const scaledW = (w + config.offset!.w) * config.frequency! * config.scale!;

  let value = simplex4D(scaledX, scaledY, scaledZ, scaledW, grad4, perm, permMod12);
  value *= config.amplitude!;

  if (config.normalize) {
    value = (value + 1) / 2;
  }

  return value;
}

/**
 * Generate fractal noise
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate (optional)
 * @param w W coordinate (optional)
 * @param config Simplex noise configuration
 * @param options Fractal noise options
 * @param grad3 Gradient table for 3D
 * @param grad4 Gradient table for 4D
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Fractal noise value
 * @example
 * const noise = generateFractalNoise(0.5, 0.3, undefined, undefined, config, options, grad3, grad4, perm, permMod12);
 * console.log(noise); // Output: fractal noise value with multiple octaves
 */
export function generateFractalNoise(
  x: number,
  y: number,
  z: number | undefined,
  w: number | undefined,
  config: SimplexNoiseConfig,
  options: Partial<FractalNoiseOptions> = {},
  grad3: number[][],
  grad4: number[][],
  perm: number[],
  permMod12: number[]
): number {
  const fractalOptions: FractalNoiseOptions = {
    octaves: options.octaves ?? config.octaves ?? 1,
    persistence: options.persistence ?? config.persistence ?? 0.5,
    lacunarity: options.lacunarity ?? config.lacunarity ?? 2,
  };

  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < (fractalOptions.octaves ?? 1); i++) {
    let noiseValue: number;

    if (w !== undefined) {
      noiseValue = generateNoise4D(
        x * frequency,
        y * frequency,
        (z ?? 0) * frequency,
        w * frequency,
        config,
        grad4,
        perm,
        permMod12
      );
    } else if (z !== undefined) {
      noiseValue = generateNoise3D(x * frequency, y * frequency, z * frequency, config, grad3, perm, permMod12);
    } else {
      noiseValue = generateNoise2D(x * frequency, y * frequency, config, grad3, perm, permMod12);
    }

    value += noiseValue * amplitude;
    maxValue += amplitude;
    amplitude *= fractalOptions.persistence ?? 0.5;
    frequency *= fractalOptions.lacunarity ?? 2;
  }

  return value / maxValue;
}
