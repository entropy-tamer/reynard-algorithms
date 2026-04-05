/**
 * Simplex Noise Multiscale Implementation
 *
 * Multiscale noise generation for Simplex noise, allowing independent
 * scale generation with flexible combination modes.
 */
import type { MultiscaleSimplexNoiseOptions, MultiscaleSimplexNoiseResult, SimplexNoiseConfig } from "./simplex-noise-types";
/**
 * Generate multiscale 2D Simplex noise
 * @param x
 * @param y
 * @param options
 * @param config
 * @param grad3
 * @param perm
 * @param permMod12
 * @example
 */
export declare function generateMultiscaleNoise2D(x: number, y: number, options: MultiscaleSimplexNoiseOptions, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): MultiscaleSimplexNoiseResult;
/**
 * Generate multiscale 3D Simplex noise
 * @param x
 * @param y
 * @param z
 * @param options
 * @param config
 * @param grad3
 * @param perm
 * @param permMod12
 * @example
 */
export declare function generateMultiscaleNoise3D(x: number, y: number, z: number, options: MultiscaleSimplexNoiseOptions, config: SimplexNoiseConfig, grad3: number[][], perm: number[], permMod12: number[]): MultiscaleSimplexNoiseResult;
/**
 * Generate multiscale 4D Simplex noise
 * @param x
 * @param y
 * @param z
 * @param w
 * @param options
 * @param config
 * @param grad4
 * @param perm
 * @param permMod12
 * @example
 */
export declare function generateMultiscaleNoise4D(x: number, y: number, z: number, w: number, options: MultiscaleSimplexNoiseOptions, config: SimplexNoiseConfig, grad4: number[][], perm: number[], permMod12: number[]): MultiscaleSimplexNoiseResult;
//# sourceMappingURL=simplex-noise-multiscale.d.ts.map