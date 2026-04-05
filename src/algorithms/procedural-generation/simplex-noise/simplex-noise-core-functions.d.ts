/**
 * Simplex Noise Core Functions
 *
 * Handles core simplex noise calculation functions
 * for 2D, 3D, and 4D noise generation.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */
import type { SimplexNoiseConfig, FractalNoiseOptions } from "./simplex-noise-types";
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
export declare function generateNoise2D(x: number, y: number, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): number;
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
export declare function generateNoise3D(x: number, y: number, z: number, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): number;
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
export declare function generateNoise4D(x: number, y: number, z: number, w: number, config: SimplexNoiseConfig, grad4: number[][], perm: number[], permMod12: number[]): number;
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
export declare function generateFractalNoise(x: number, y: number, z: number | undefined, w: number | undefined, config: SimplexNoiseConfig, options: Partial<FractalNoiseOptions> | undefined, grad3: number[][], grad4: number[][], perm: number[], permMod12: number[]): number;
//# sourceMappingURL=simplex-noise-core-functions.d.ts.map