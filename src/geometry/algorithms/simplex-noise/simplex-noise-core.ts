/**
 * @file Implements the Simplex Noise algorithm for procedural noise generation.
 * @module algorithms/geometry/algorithms/simplex-noise/simplex-noise-core
 */

import {
  SimplexNoiseConfig,
  NoiseResult,
  Noise2DOptions,
  Noise3DOptions,
  Noise4DOptions,
  FractalNoiseOptions,
  NoiseAnalysisOptions,
  NoiseAnalysis,
  NoiseFilterOptions,
  NoiseFilterResult,
} from "./simplex-noise-types";

import { initializeGradients, initializePermutation } from "./simplex-noise-init";
import { noise2D, fractalNoise2D, generateNoise2DWithOptions, generateFractalNoise2DWithOptions } from "./simplex-noise-2d";
import { noise3D, fractalNoise3D, generateNoise3DWithOptions, generateFractalNoise3DWithOptions } from "./simplex-noise-3d";
import { noise4D, fractalNoise4D, generateNoise4DWithOptions, generateFractalNoise4DWithOptions } from "./simplex-noise-4d";
import { analyzeNoise, applyFilter, computeFilterResponse, computeFilterGain, computeNoiseReduction } from "./simplex-noise-utils";

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
export class SimplexNoise {
  private config: SimplexNoiseConfig;
  private grad3!: number[][];
  private grad4!: number[][];
  private p!: number[];
  private perm!: number[];
  private permMod12!: number[];

  /**
   * Creates an instance of SimplexNoise.
   * @param config - Optional configuration for the noise generator.
   */
  constructor(config: Partial<SimplexNoiseConfig> = {}) {
    this.config = {
      seed: 0,
      frequency: 1.0,
      amplitude: 1.0,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 1.0,
      offset: { x: 0, y: 0, z: 0, w: 0 },
      normalize: false,
      useImprovedGradients: true,
      ...config,
    };

    this.initializeGradients();
    this.initializePermutation();
  }

  /**
   * Generates 2D simplex noise at the given coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns The noise value in the range [-1, 1].
   */
  noise2D(x: number, y: number): number {
    return noise2D(x, y, this.config, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 3D simplex noise at the given coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @returns The noise value in the range [-1, 1].
   */
  noise3D(x: number, y: number, z: number): number {
    return noise3D(x, y, z, this.config, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 4D simplex noise at the given coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @param w - W coordinate.
   * @returns The noise value in the range [-1, 1].
   */
  noise4D(x: number, y: number, z: number, w: number): number {
    return noise4D(x, y, z, w, this.config, this.grad4, this.perm, this.permMod12);
  }

  /**
   * Generates 2D fractal noise.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param options - Fractal noise options.
   * @returns Fractal noise value.
   */
  fractalNoise2D(x: number, y: number, options: Partial<FractalNoiseOptions> = {}): number {
    return fractalNoise2D(x, y, this.config, options, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 3D fractal noise.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @param options - Fractal noise options.
   * @returns Fractal noise value.
   */
  fractalNoise3D(x: number, y: number, z: number, options: Partial<FractalNoiseOptions> = {}): number {
    return fractalNoise3D(x, y, z, this.config, options, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 4D fractal noise.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @param w - W coordinate.
   * @param options - Fractal noise options.
   * @returns Fractal noise value.
   */
  fractalNoise4D(x: number, y: number, z: number, w: number, options: Partial<FractalNoiseOptions> = {}): number {
    return fractalNoise4D(x, y, z, w, this.config, options, this.grad4, this.perm, this.permMod12);
  }

  /**
   * Generates 2D noise with options.
   * @param options - 2D noise options.
   * @returns Noise result.
   */
  generateNoise2D(options: Noise2DOptions): NoiseResult {
    return generateNoise2DWithOptions(options, this.config, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 3D noise with options.
   * @param options - 3D noise options.
   * @returns Noise result.
   */
  generateNoise3D(options: Noise3DOptions): NoiseResult {
    return generateNoise3DWithOptions(options, this.config, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 4D noise with options.
   * @param options - 4D noise options.
   * @returns Noise result.
   */
  generateNoise4D(options: Noise4DOptions): NoiseResult {
    return generateNoise4DWithOptions(options, this.config, this.grad4, this.perm, this.permMod12);
  }

  /**
   * Generates 2D fractal noise with options.
   * @param options - 2D noise options.
   * @param fractalOptions - Fractal noise options.
   * @returns Noise result.
   */
  generateFractalNoise2D(options: Noise2DOptions, fractalOptions: Partial<FractalNoiseOptions> = {}): NoiseResult {
    return generateFractalNoise2DWithOptions(options, this.config, fractalOptions, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 3D fractal noise with options.
   * @param options - 3D noise options.
   * @param fractalOptions - Fractal noise options.
   * @returns Noise result.
   */
  generateFractalNoise3D(options: Noise3DOptions, fractalOptions: Partial<FractalNoiseOptions> = {}): NoiseResult {
    return generateFractalNoise3DWithOptions(options, this.config, fractalOptions, this.grad3, this.perm, this.permMod12);
  }

  /**
   * Generates 4D fractal noise with options.
   * @param options - 4D noise options.
   * @param fractalOptions - Fractal noise options.
   * @returns Noise result.
   */
  generateFractalNoise4D(options: Noise4DOptions, fractalOptions: Partial<FractalNoiseOptions> = {}): NoiseResult {
    return generateFractalNoise4DWithOptions(options, this.config, fractalOptions, this.grad4, this.perm, this.permMod12);
  }

  /**
   * Analyzes noise properties.
   * @param values - Array of noise values.
   * @param options - Analysis options.
   * @returns Noise analysis.
   */
  analyzeNoise(values: number[], options: Partial<NoiseAnalysisOptions> = {}): NoiseAnalysis {
    return analyzeNoise(values, options);
  }

  /**
   * Applies noise filter.
   * @param values - Array of noise values.
   * @param options - Filter options.
   * @returns Filter result.
   */
  filterNoise(values: number[], options: NoiseFilterOptions): NoiseFilterResult {
    const filtered = applyFilter(values, options);
    const filterResponse = computeFilterResponse(options);
    const filterGain = computeFilterGain(filtered, values);
    const noiseReduction = computeNoiseReduction(filtered, values);

    return {
      originalValues: values,
      filteredValues: filtered,
      filterResponse,
      stats: {
        executionTime: 0,
        filterGain,
        noiseReduction,
      },
    };
  }

  /**
   * Gets the current configuration.
   * @returns Current configuration.
   */
  getConfig(): SimplexNoiseConfig {
    return { ...this.config };
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration values.
   */
  updateConfig(newConfig: Partial<SimplexNoiseConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeGradients();
    this.initializePermutation();
  }

  /**
   * Initialize gradient tables
   */
  private initializeGradients(): void {
    const { grad3, grad4 } = initializeGradients(this.config);
    this.grad3 = grad3;
    this.grad4 = grad4;
  }

  /**
   * Initialize permutation tables
   */
  private initializePermutation(): void {
    const { p, perm, permMod12 } = initializePermutation(this.config);
    this.p = p;
    this.perm = perm;
    this.permMod12 = permMod12;
  }
}