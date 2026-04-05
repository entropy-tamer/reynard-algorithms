/**
 * @file Simplex Noise 2D Operations
 *
 * Handles 2D noise generation and related utilities
 * for the Simplex Noise algorithm.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */
import type { SimplexNoiseConfig, NoiseResult, Noise2DOptions, FractalNoiseOptions } from "./simplex-noise-types";
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
export declare function noise2D(x: number, y: number, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): number;
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
export declare function fractalNoise2D(x: number, y: number, config: SimplexNoiseConfig, options: Partial<FractalNoiseOptions>, grad3: number[][], perm: number[], permMod12: number[]): number;
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
export declare function generateNoise2DWithOptions(options: Noise2DOptions, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): NoiseResult;
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
export declare function generateFractalNoise2DWithOptions(options: Noise2DOptions, config: SimplexNoiseConfig, fractalOptions: Partial<FractalNoiseOptions>, grad3: number[][], perm: number[], permMod12: number[]): NoiseResult;
//# sourceMappingURL=simplex-noise-2d.d.ts.map