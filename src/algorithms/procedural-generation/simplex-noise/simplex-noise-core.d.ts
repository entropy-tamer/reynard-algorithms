/**
 * @file Implements the Simplex Noise algorithm for procedural noise generation.
 * @module algorithms/geometry/algorithms/simplex-noise/simplex-noise-core
 */
import { SimplexNoiseConfig, NoiseResult, Noise2DOptions, Noise3DOptions, Noise4DOptions, FractalNoiseOptions, NoiseAnalysisOptions, NoiseAnalysis, NoiseFilterOptions, NoiseFilterResult, MultiscaleSimplexNoiseOptions, MultiscaleSimplexNoiseResult } from "./simplex-noise-types";
/**
 * The SimplexNoise class provides an implementation of the Simplex Noise algorithm
 * for generating high-quality procedural noise. It supports 2D, 3D, and 4D noise
 * generation with fractal noise capabilities.
 *
 * @example
 * ```typescript
 * const simplexNoise = new SimplexNoise({ seed: 12345 });
 * const noise2D = simplexNoise.noise2D(10, 20);
 * const noise3D = simplexNoise.noise3D(10, 20, 30);
 * const fractalNoise = simplexNoise.fractalNoise2D(10, 20, { octaves: 4 });
 * ```
 */
export declare class SimplexNoise {
    private config;
    private grad3;
    private grad4;
    private perm;
    private permMod12;
    /**
     * Creates an instance of SimplexNoise.
     * @param config - Optional configuration for the noise generator.
     * @example
     */
    constructor(config?: Partial<SimplexNoiseConfig>);
    /**
     * Generates 2D simplex noise at the given coordinates.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @returns The noise value in the range [-1, 1].
     * @example
     */
    noise2D(x: number, y: number): number;
    /**
     * Generates 3D simplex noise at the given coordinates.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param z - Z coordinate.
     * @returns The noise value in the range [-1, 1].
     * @example
     */
    noise3D(x: number, y: number, z: number): number;
    /**
     * Generates 4D simplex noise at the given coordinates.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param z - Z coordinate.
     * @param w - W coordinate.
     * @returns The noise value in the range [-1, 1].
     * @example
     */
    noise4D(x: number, y: number, z: number, w: number): number;
    /**
     * Generates 2D fractal noise.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param options - Fractal noise options.
     * @returns Fractal noise value.
     * @example
     */
    fractalNoise2D(x: number, y: number, options?: Partial<FractalNoiseOptions>): number;
    /**
     * Generates 3D fractal noise.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param z - Z coordinate.
     * @param options - Fractal noise options.
     * @returns Fractal noise value.
     * @example
     */
    fractalNoise3D(x: number, y: number, z: number, options?: Partial<FractalNoiseOptions>): number;
    /**
     * Generates 4D fractal noise.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param z - Z coordinate.
     * @param w - W coordinate.
     * @param options - Fractal noise options.
     * @returns Fractal noise value.
     * @example
     */
    fractalNoise4D(x: number, y: number, z: number, w: number, options?: Partial<FractalNoiseOptions>): number;
    /**
     * Generates 2D noise with options.
     * @param options - 2D noise options.
     * @returns Noise result.
     * @example
     */
    generateNoise2D(options: Noise2DOptions): NoiseResult;
    /**
     * Generates 3D noise with options.
     * @param options - 3D noise options.
     * @returns Noise result.
     * @example
     */
    generateNoise3D(options: Noise3DOptions): NoiseResult;
    /**
     * Generates 4D noise with options.
     * @param options - 4D noise options.
     * @returns Noise result.
     * @example
     */
    generateNoise4D(options: Noise4DOptions): NoiseResult;
    /**
     * Generates 2D fractal noise with options.
     * @param options - 2D noise options.
     * @param fractalOptions - Fractal noise options.
     * @returns Noise result.
     * @example
     */
    generateFractalNoise2D(options: Noise2DOptions, fractalOptions?: Partial<FractalNoiseOptions>): NoiseResult;
    /**
     * Generates 3D fractal noise with options.
     * @param options - 3D noise options.
     * @param fractalOptions - Fractal noise options.
     * @returns Noise result.
     * @example
     */
    generateFractalNoise3D(options: Noise3DOptions, fractalOptions?: Partial<FractalNoiseOptions>): NoiseResult;
    /**
     * Generates 4D fractal noise with options.
     * @param options - 4D noise options.
     * @param fractalOptions - Fractal noise options.
     * @returns Noise result.
     * @example
     */
    generateFractalNoise4D(options: Noise4DOptions, fractalOptions?: Partial<FractalNoiseOptions>): NoiseResult;
    /**
     * Analyzes noise properties.
     * @param values - Array of noise values.
     * @param options - Analysis options.
     * @returns Noise analysis.
     * @example
     */
    analyzeNoise(values: number[], options?: Partial<NoiseAnalysisOptions>): NoiseAnalysis;
    /**
     * Applies noise filter.
     * @param values - Array of noise values.
     * @param options - Filter options.
     * @returns Filter result.
     * @example
     */
    filterNoise(values: number[], options: NoiseFilterOptions): NoiseFilterResult;
    /**
     * Gets the current configuration.
     * @returns Current configuration.
     * @example
     */
    getConfig(): SimplexNoiseConfig;
    /**
     * Updates the configuration.
     * @param newConfig - New configuration values.
     * @example
     */
    updateConfig(newConfig: Partial<SimplexNoiseConfig>): void;
    /**
     * Initialize gradient tables
     * @example
     */
    private initializeGradients;
    /**
     * Initialize permutation tables
     * @example
     */
    private initializePermutation;
    /**
     * Generates 2D multiscale noise.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param options - Multiscale noise options.
     * @returns Multiscale noise result with individual scales and combined value.
     * @example
     * ```typescript
     * const result = simplexNoise.multiscaleNoise2D(10, 20, {
     *   scales: [
     *     { frequency: 0.01, amplitude: 1.0, name: "terrain" },
     *     { frequency: 0.05, amplitude: 0.5, name: "features" }
     *   ],
     *   combinationMode: "additive"
     * });
     * console.log(result.combined); // Combined value
     * console.log(result.scales.get("terrain")); // Individual scale value
     * ```
     */
    multiscaleNoise2D(x: number, y: number, options: MultiscaleSimplexNoiseOptions): MultiscaleSimplexNoiseResult;
    /**
     * Generates 3D multiscale noise.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param z - Z coordinate.
     * @param options - Multiscale noise options.
     * @returns Multiscale noise result with individual scales and combined value.
     * @example
     */
    multiscaleNoise3D(x: number, y: number, z: number, options: MultiscaleSimplexNoiseOptions): MultiscaleSimplexNoiseResult;
    /**
     * Generates 4D multiscale noise.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param z - Z coordinate.
     * @param w - W coordinate.
     * @param options - Multiscale noise options.
     * @returns Multiscale noise result with individual scales and combined value.
     * @example
     */
    multiscaleNoise4D(x: number, y: number, z: number, w: number, options: MultiscaleSimplexNoiseOptions): MultiscaleSimplexNoiseResult;
}
//# sourceMappingURL=simplex-noise-core.d.ts.map