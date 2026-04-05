/**
 * Perlin Noise Algorithms
 *
 * Implementation of Perlin noise for procedural generation.
 * Supports 2D, 3D, and 4D noise with fractal variations.
 */
import type { FractalPerlinNoiseOptions, MultiscalePerlinNoiseOptions, MultiscalePerlinNoiseResult, PerlinNoiseConfig, PerlinNoiseOptions, PerlinNoiseResult } from "./perlin-noise-types.js";
/**
 * 2D Perlin noise with pre-computed tables (optimized with inlined functions)
 * @param x
 * @param y
 * @param seed
 * @param gradients
 * @param perm
 * @example
 */
export declare function perlinNoise2D(x: number, y: number, seed?: number, gradients?: Array<{
    x: number;
    y: number;
}>, perm?: Uint8Array): number;
/**
 * 3D Perlin noise (simplified - uses 2D gradients)
 * @param x
 * @param y
 * @param z
 * @param seed
 * @example
 */
export declare function perlinNoise3D(x: number, y: number, z: number, seed?: number): number;
/**
 * Fractal Perlin noise (multiple octaves)
 * @param x
 * @param y
 * @param options
 * @param seed
 * @param gradients
 * @param perm
 * @example
 */
export declare function fractalPerlinNoise2D(x: number, y: number, options: FractalPerlinNoiseOptions, seed?: number, gradients?: Array<{
    x: number;
    y: number;
}>, perm?: Uint8Array): number;
/**
 * Perlin noise class for convenient usage
 */
export declare class PerlinNoise {
    private config;
    private seed;
    private cachedGradients;
    private cachedPermutation;
    private cachedSeed;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<PerlinNoiseConfig>);
    /**
     * Ensure lookup tables are generated and cached for current seed
     * @example
     */
    private ensureTables;
    /**
     * Generate 2D noise
     * @param x
     * @param y
     * @param options
     * @example
     */
    noise2D(x: number, y: number, options?: PerlinNoiseOptions): number;
    /**
     * Generate 3D noise
     * @param x
     * @param y
     * @param z
     * @param options
     * @example
     */
    noise3D(x: number, y: number, z: number, options?: PerlinNoiseOptions): number;
    /**
     * Generate fractal 2D noise
     * @param x
     * @param y
     * @param options
     * @example
     */
    fractalNoise2D(x: number, y: number, options?: FractalPerlinNoiseOptions): number;
    /**
     * Generate noise with result information
     * @param x
     * @param y
     * @param options
     * @example
     */
    noise2DWithResult(x: number, y: number, options?: PerlinNoiseOptions): PerlinNoiseResult;
    /**
     * Generate multiscale 2D noise
     * @param x
     * @param y
     * @param options
     * @example
     */
    multiscaleNoise2D(x: number, y: number, options: MultiscalePerlinNoiseOptions): MultiscalePerlinNoiseResult;
    /**
     * Generate multiscale 3D noise
     * @param x
     * @param y
     * @param z
     * @param options
     * @example
     */
    multiscaleNoise3D(x: number, y: number, z: number, options: MultiscalePerlinNoiseOptions): MultiscalePerlinNoiseResult;
}
//# sourceMappingURL=perlin-noise-core.d.ts.map