/**
 * Perlin Noise Multiscale Implementation
 *
 * Multiscale noise generation for Perlin noise, allowing independent
 * scale generation with flexible combination modes.
 */
import type { MultiscalePerlinNoiseOptions, MultiscalePerlinNoiseResult } from "./perlin-noise-types.js";
/**
 * Generate multiscale 2D Perlin noise
 * @param x
 * @param y
 * @param options
 * @param seed
 * @param gradients
 * @param perm
 * @example
 */
export declare function generateMultiscaleNoise2D(x: number, y: number, options: MultiscalePerlinNoiseOptions, seed?: number, gradients?: Array<{
    x: number;
    y: number;
}>, perm?: Uint8Array): MultiscalePerlinNoiseResult;
/**
 * Generate multiscale 3D Perlin noise
 * @param x
 * @param y
 * @param z
 * @param options
 * @param seed
 * @example
 */
export declare function generateMultiscaleNoise3D(x: number, y: number, z: number, options: MultiscalePerlinNoiseOptions, seed?: number): MultiscalePerlinNoiseResult;
//# sourceMappingURL=perlin-noise-multiscale.d.ts.map