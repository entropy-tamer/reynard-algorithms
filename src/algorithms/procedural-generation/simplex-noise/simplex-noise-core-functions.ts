/**
 * Simplex Noise Core Functions
 *
 * Fractal composition, plus the per-dimension generators re-exported from
 * their own files.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type { SimplexNoiseConfig, FractalNoiseOptions } from "./simplex-noise-types";
import { generateNoise2D } from "./simplex-noise-generate-2d";
import { generateNoise3D } from "./simplex-noise-generate-3d";
import { generateNoise4D } from "./simplex-noise-generate-4d";

/**
 * The per-dimension generators live in their own files. Re-exported here so
 * every existing import path keeps working.
 */
export { generateNoise2D } from "./simplex-noise-generate-2d";
export { generateNoise3D } from "./simplex-noise-generate-3d";
export { generateNoise4D } from "./simplex-noise-generate-4d";

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
