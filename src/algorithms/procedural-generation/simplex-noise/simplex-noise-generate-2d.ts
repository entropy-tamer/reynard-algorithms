/**
 * Simplex Noise 2D Generation
 *
 * The 2D generator on its own, so a consumer that only ever calls `noise2D`
 * does not link the 3D and 4D implementations.
 *
 * This file exists because of a measurement, not a preference. In one bundled
 * `simplex-noise-core-functions.ts`, importing `generateNoise2D` pulled
 * `simplex-noise-simplex-3d` and `-4d` through the sibling exports: 6.7 KiB of
 * shipped bytes for dimensions the caller never asked for. Splitting by
 * dimension is what lets a bundler answer "give me two dimensions" with two.
 *
 * `simplex-noise-core-functions.ts` re-exports all three, so the public API and
 * every existing import path are unchanged.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type { SimplexNoiseConfig } from "./simplex-noise-types";
import { simplex2D } from "./simplex-noise-simplex-2d";

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
