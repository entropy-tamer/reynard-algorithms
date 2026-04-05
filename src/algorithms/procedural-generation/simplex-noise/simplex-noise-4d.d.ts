/**
 * @file algorithms/geometry/algorithms/simplex-noise/simplex-noise-4d
 * @module algorithms/geometry/algorithms/simplex-noise
 * @description Simplex Noise 4D Operations - Handles 4D noise generation and related utilities
 */
import type { SimplexNoiseConfig, NoiseResult, Noise4DOptions, FractalNoiseOptions } from "./simplex-noise-types";
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
export declare function noise4D(x: number, y: number, z: number, w: number, config: SimplexNoiseConfig, grad4: number[][], perm: number[], permMod12: number[]): number;
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
export declare function fractalNoise4D(x: number, y: number, z: number, w: number, config: SimplexNoiseConfig, options: Partial<FractalNoiseOptions>, grad4: number[][], perm: number[], permMod12: number[]): number;
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
export declare function generateNoise4DWithOptions(options: Noise4DOptions, config: SimplexNoiseConfig, grad4: number[][], perm: number[], permMod12: number[]): NoiseResult;
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
export declare function generateFractalNoise4DWithOptions(options: Noise4DOptions, config: SimplexNoiseConfig, fractalOptions: Partial<FractalNoiseOptions>, grad4: number[][], perm: number[], permMod12: number[]): NoiseResult;
//# sourceMappingURL=simplex-noise-4d.d.ts.map