/**
 * Simplex Noise 4D Generation
 *
 * Split out of `simplex-noise-core-functions.ts` for the same reason as the 2D
 * generator: a caller that imports one dimension should not link the other
 * three. See `simplex-noise-generate-2d.ts` for the measurement.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type { SimplexNoiseConfig } from "./simplex-noise-types";
import { simplex4D } from "./simplex-noise-simplex-4d";

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
