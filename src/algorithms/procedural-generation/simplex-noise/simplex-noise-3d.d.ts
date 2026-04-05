/**
 * Simplex Noise 3D Operations
 *
 * Handles 3D noise generation and related utilities
 * for the Simplex Noise algorithm.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */
import type { SimplexNoiseConfig, NoiseResult, Noise3DOptions, FractalNoiseOptions } from "./simplex-noise-types";
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
export declare function noise3D(x: number, y: number, z: number, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): number;
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
export declare function fractalNoise3D(x: number, y: number, z: number, config: SimplexNoiseConfig, options: Partial<FractalNoiseOptions>, grad3: number[][], perm: number[], permMod12: number[]): number;
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
export declare function generateNoise3DWithOptions(options: Noise3DOptions, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): NoiseResult;
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
export declare function generateFractalNoise3DWithOptions(options: Noise3DOptions, config: SimplexNoiseConfig, fractalOptions: Partial<FractalNoiseOptions>, grad3: number[][], perm: number[], permMod12: number[]): NoiseResult;
//# sourceMappingURL=simplex-noise-3d.d.ts.map