/**
 * @module algorithms/geometry/algorithms/simplex-noise/simplex-noise-core
 * @description Implements the Simplex Noise algorithm for procedural noise generation.
 */

import {
  SimplexNoiseConfig,
  NoiseStats,
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
    const scaledX = (x + this.config.offset!.x) * this.config.frequency! * this.config.scale!;
    const scaledY = (y + this.config.offset!.y) * this.config.frequency! * this.config.scale!;

    let value = this.simplex2D(scaledX, scaledY);
    value *= this.config.amplitude!;

    if (this.config.normalize) {
      value = (value + 1) / 2;
    }

    return value;
  }

  /**
   * Generates 3D simplex noise at the given coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @returns The noise value in the range [-1, 1].
   */
  noise3D(x: number, y: number, z: number): number {
    const scaledX = (x + this.config.offset!.x) * this.config.frequency! * this.config.scale!;
    const scaledY = (y + this.config.offset!.y) * this.config.frequency! * this.config.scale!;
    const scaledZ = (z + this.config.offset!.z) * this.config.frequency! * this.config.scale!;

    let value = this.simplex3D(scaledX, scaledY, scaledZ);
    value *= this.config.amplitude!;

    if (this.config.normalize) {
      value = (value + 1) / 2;
    }

    return value;
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
    const scaledX = (x + this.config.offset!.x) * this.config.frequency! * this.config.scale!;
    const scaledY = (y + this.config.offset!.y) * this.config.frequency! * this.config.scale!;
    const scaledZ = (z + this.config.offset!.z) * this.config.frequency! * this.config.scale!;
    const scaledW = (w + this.config.offset!.w) * this.config.frequency! * this.config.scale!;

    let value = this.simplex4D(scaledX, scaledY, scaledZ, scaledW);
    value *= this.config.amplitude!;

    if (this.config.normalize) {
      value = (value + 1) / 2;
    }

    return value;
  }

  /**
   * Generates 2D fractal noise using multiple octaves.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param options - Optional fractal noise options.
   * @returns The fractal noise value.
   */
  fractalNoise2D(x: number, y: number, options: Partial<FractalNoiseOptions> = {}): number {
    const fractalOptions: FractalNoiseOptions = {
      octaves: this.config.octaves!,
      persistence: this.config.persistence!,
      lacunarity: this.config.lacunarity!,
      baseFrequency: this.config.frequency!,
      baseAmplitude: this.config.amplitude!,
      ...options,
    };

    let value = 0;
    let amplitude = fractalOptions.baseAmplitude!;
    let frequency = fractalOptions.baseFrequency!;
    let maxValue = 0;

    for (let i = 0; i < fractalOptions.octaves!; i++) {
      value += this.simplex2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= fractalOptions.persistence!;
      frequency *= fractalOptions.lacunarity!;
    }

    value /= maxValue;

    if (this.config.normalize) {
      value = (value + 1) / 2;
    }

    return value;
  }

  /**
   * Generates 3D fractal noise using multiple octaves.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @param options - Optional fractal noise options.
   * @returns The fractal noise value.
   */
  fractalNoise3D(x: number, y: number, z: number, options: Partial<FractalNoiseOptions> = {}): number {
    const fractalOptions: FractalNoiseOptions = {
      octaves: this.config.octaves!,
      persistence: this.config.persistence!,
      lacunarity: this.config.lacunarity!,
      baseFrequency: this.config.frequency!,
      baseAmplitude: this.config.amplitude!,
      ...options,
    };

    let value = 0;
    let amplitude = fractalOptions.baseAmplitude!;
    let frequency = fractalOptions.baseFrequency!;
    let maxValue = 0;

    for (let i = 0; i < fractalOptions.octaves!; i++) {
      value += this.simplex3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= fractalOptions.persistence!;
      frequency *= fractalOptions.lacunarity!;
    }

    value /= maxValue;

    if (this.config.normalize) {
      value = (value + 1) / 2;
    }

    return value;
  }

  /**
   * Generates a 2D noise field.
   * @param options - Options for 2D noise generation.
   * @returns A NoiseResult object with the generated noise values and statistics.
   */
  generateNoise2D(options: Noise2DOptions): NoiseResult {
    const startTime = performance.now();
    const values: number[] = [];
    const { width, height, offsetX = 0, offsetY = 0, stepSize = 1.0 } = options;

    try {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const noiseX = x * stepSize + offsetX;
          const noiseY = y * stepSize + offsetY;
          values.push(this.noise2D(noiseX, noiseY));
        }
      }

      const stats = this.computeStats(values, performance.now() - startTime);
      return { values, stats };
    } catch (error) {
      return {
        values: [],
        stats: {
          sampleCount: 0,
          executionTime: performance.now() - startTime,
          minValue: 0,
          maxValue: 0,
          averageValue: 0,
          standardDeviation: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Generates a 3D noise field.
   * @param options - Options for 3D noise generation.
   * @returns A NoiseResult object with the generated noise values and statistics.
   */
  generateNoise3D(options: Noise3DOptions): NoiseResult {
    const startTime = performance.now();
    const values: number[] = [];
    const { width, height, depth, offsetX = 0, offsetY = 0, offsetZ = 0, stepSize = 1.0 } = options;

    try {
      for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const noiseX = x * stepSize + offsetX;
            const noiseY = y * stepSize + offsetY;
            const noiseZ = z * stepSize + offsetZ;
            values.push(this.noise3D(noiseX, noiseY, noiseZ));
          }
        }
      }

      const stats = this.computeStats(values, performance.now() - startTime);
      return { values, stats };
    } catch (error) {
      return {
        values: [],
        stats: {
          sampleCount: 0,
          executionTime: performance.now() - startTime,
          minValue: 0,
          maxValue: 0,
          averageValue: 0,
          standardDeviation: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Generates a 4D noise field.
   * @param options - Options for 4D noise generation.
   * @returns A NoiseResult object with the generated noise values and statistics.
   */
  generateNoise4D(options: Noise4DOptions): NoiseResult {
    const startTime = performance.now();
    const values: number[] = [];
    const { width, height, depth, time, offsetX = 0, offsetY = 0, offsetZ = 0, offsetW = 0, stepSize = 1.0 } = options;

    try {
      for (let w = 0; w < time; w++) {
        for (let z = 0; z < depth; z++) {
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const noiseX = x * stepSize + offsetX;
              const noiseY = y * stepSize + offsetY;
              const noiseZ = z * stepSize + offsetZ;
              const noiseW = w * stepSize + offsetW;
              values.push(this.noise4D(noiseX, noiseY, noiseZ, noiseW));
            }
          }
        }
      }

      const stats = this.computeStats(values, performance.now() - startTime);
      return { values, stats };
    } catch (error) {
      return {
        values: [],
        stats: {
          sampleCount: 0,
          executionTime: performance.now() - startTime,
          minValue: 0,
          maxValue: 0,
          averageValue: 0,
          standardDeviation: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Analyzes noise properties.
   * @param values - Array of noise values to analyze.
   * @param options - Analysis options.
   * @returns A NoiseAnalysis object with computed properties.
   */
  analyzeNoise(values: number[], options: Partial<NoiseAnalysisOptions> = {}): NoiseAnalysis {
    const analysisOptions: NoiseAnalysisOptions = {
      computeStatistics: true,
      computeFrequencyDomain: false,
      computeSpatialProperties: false,
      ...options,
    };

    const analysis: NoiseAnalysis = {
      statistics: {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        variance: 0,
        skewness: 0,
        kurtosis: 0,
      },
    };

    if (analysisOptions.computeStatistics) {
      analysis.statistics = this.computeDetailedStatistics(values);
    }

    if (analysisOptions.computeFrequencyDomain) {
      analysis.frequencyDomain = this.computeFrequencyDomainProperties(values);
    }

    if (analysisOptions.computeSpatialProperties) {
      analysis.spatialProperties = this.computeSpatialProperties(values);
    }

    return analysis;
  }

  /**
   * Applies filtering to noise values.
   * @param values - Array of noise values to filter.
   * @param options - Filter options.
   * @returns A NoiseFilterResult object with filtered values and statistics.
   */
  filterNoise(values: number[], options: NoiseFilterOptions): NoiseFilterResult {
    const startTime = performance.now();

    try {
      const filteredValues = this.applyFilter(values, options);
      const filterResponse = this.computeFilterResponse(options);
      const filterGain = this.computeFilterGain(filteredValues, values);
      const noiseReduction = this.computeNoiseReduction(filteredValues, values);

      return {
        filteredValues,
        originalValues: [...values],
        filterResponse,
        stats: {
          executionTime: performance.now() - startTime,
          filterGain,
          noiseReduction,
        },
      };
    } catch (error) {
      return {
        filteredValues: [],
        originalValues: [...values],
        filterResponse: [],
        stats: {
          executionTime: performance.now() - startTime,
          filterGain: 0,
          noiseReduction: 0,
        },
      };
    }
  }

  // Private helper methods

  private initializeGradients(): void {
    if (this.config.useImprovedGradients) {
      // Improved gradient tables for better quality
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1],
      ];

      this.grad4 = [
        [0, 1, 1, 1],
        [0, 1, 1, -1],
        [0, 1, -1, 1],
        [0, 1, -1, -1],
        [0, -1, 1, 1],
        [0, -1, 1, -1],
        [0, -1, -1, 1],
        [0, -1, -1, -1],
        [1, 0, 1, 1],
        [1, 0, 1, -1],
        [1, 0, -1, 1],
        [1, 0, -1, -1],
        [-1, 0, 1, 1],
        [-1, 0, 1, -1],
        [-1, 0, -1, 1],
        [-1, 0, -1, -1],
        [1, 1, 0, 1],
        [1, 1, 0, -1],
        [1, -1, 0, 1],
        [1, -1, 0, -1],
        [-1, 1, 0, 1],
        [-1, 1, 0, -1],
        [-1, -1, 0, 1],
        [-1, -1, 0, -1],
        [1, 1, 1, 0],
        [1, 1, -1, 0],
        [1, -1, 1, 0],
        [1, -1, -1, 0],
        [-1, 1, 1, 0],
        [-1, 1, -1, 0],
        [-1, -1, 1, 0],
        [-1, -1, -1, 0],
      ];
    } else {
      // Standard gradient tables
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1],
      ];

      this.grad4 = [
        [0, 1, 1, 1],
        [0, 1, 1, -1],
        [0, 1, -1, 1],
        [0, 1, -1, -1],
        [0, -1, 1, 1],
        [0, -1, 1, -1],
        [0, -1, -1, 1],
        [0, -1, -1, -1],
        [1, 0, 1, 1],
        [1, 0, 1, -1],
        [1, 0, -1, 1],
        [1, 0, -1, -1],
        [-1, 0, 1, 1],
        [-1, 0, 1, -1],
        [-1, 0, -1, 1],
        [-1, 0, -1, -1],
        [1, 1, 0, 1],
        [1, 1, 0, -1],
        [1, -1, 0, 1],
        [1, -1, 0, -1],
        [-1, 1, 0, 1],
        [-1, 1, 0, -1],
        [-1, -1, 0, 1],
        [-1, -1, 0, -1],
        [1, 1, 1, 0],
        [1, 1, -1, 0],
        [1, -1, 1, 0],
        [1, -1, -1, 0],
        [-1, 1, 1, 0],
        [-1, 1, -1, 0],
        [-1, -1, 1, 0],
        [-1, -1, -1, 0],
      ];
    }
  }

  private initializePermutation(): void {
    // Initialize permutation table
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    // Shuffle using seed
    let seed = this.config.seed!;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }

    // Create extended permutation table
    this.perm = new Array(512);
    this.permMod12 = new Array(512);

    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  private simplex2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    const t = (i + j) * G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);

    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  private simplex3D(x: number, y: number, z: number): number {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);

    const t = (i + j + k) * G3;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);

    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    let n3 = 0;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  private simplex4D(x: number, y: number, z: number, w: number): number {
    const F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
    const G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

    const s = (x + y + z + w) * F4;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const l = Math.floor(w + s);

    const t = (i + j + k + l) * G4;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);
    const w0 = w - (l - t);

    // Determine which simplex we're in
    let c1 = x0 > y0 ? 32 : 0;
    let c2 = x0 > z0 ? 16 : 0;
    let c3 = y0 > z0 ? 8 : 0;
    let c4 = x0 > w0 ? 4 : 0;
    let c5 = y0 > w0 ? 2 : 0;
    let c6 = z0 > w0 ? 1 : 0;
    const c = c1 + c2 + c3 + c4 + c5 + c6;

    const i1 = this.simplex4DLookup[c][0] >= 3 ? 1 : 0;
    const j1 = this.simplex4DLookup[c][1] >= 3 ? 1 : 0;
    const k1 = this.simplex4DLookup[c][2] >= 3 ? 1 : 0;
    const l1 = this.simplex4DLookup[c][3] >= 3 ? 1 : 0;

    const i2 = this.simplex4DLookup[c][0] >= 2 ? 1 : 0;
    const j2 = this.simplex4DLookup[c][1] >= 2 ? 1 : 0;
    const k2 = this.simplex4DLookup[c][2] >= 2 ? 1 : 0;
    const l2 = this.simplex4DLookup[c][3] >= 2 ? 1 : 0;

    const i3 = this.simplex4DLookup[c][0] >= 1 ? 1 : 0;
    const j3 = this.simplex4DLookup[c][1] >= 1 ? 1 : 0;
    const k3 = this.simplex4DLookup[c][2] >= 1 ? 1 : 0;
    const l3 = this.simplex4DLookup[c][3] >= 1 ? 1 : 0;

    const x1 = x0 - i1 + G4;
    const y1 = y0 - j1 + G4;
    const z1 = z0 - k1 + G4;
    const w1 = w0 - l1 + G4;
    const x2 = x0 - i2 + 2.0 * G4;
    const y2 = y0 - j2 + 2.0 * G4;
    const z2 = z0 - k2 + 2.0 * G4;
    const w2 = w0 - l2 + 2.0 * G4;
    const x3 = x0 - i3 + 3.0 * G4;
    const y3 = y0 - j3 + 3.0 * G4;
    const z3 = z0 - k3 + 3.0 * G4;
    const w3 = w0 - l3 + 3.0 * G4;
    const x4 = x0 - 1.0 + 4.0 * G4;
    const y4 = y0 - 1.0 + 4.0 * G4;
    const z4 = z0 - 1.0 + 4.0 * G4;
    const w4 = w0 - 1.0 + 4.0 * G4;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const ll = l & 255;
    const gi0 = this.perm[ii + this.perm[jj + this.perm[kk + this.perm[ll]]]] % 32;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1 + this.perm[ll + l1]]]] % 32;
    const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2 + this.perm[ll + l2]]]] % 32;
    const gi3 = this.perm[ii + i3 + this.perm[jj + j3 + this.perm[kk + k3 + this.perm[ll + l3]]]] % 32;
    const gi4 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1 + this.perm[ll + 1]]]] % 32;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad4[gi0], x0, y0, z0, w0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad4[gi1], x1, y1, z1, w1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad4[gi2], x2, y2, z2, w2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    let n3 = 0;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(this.grad4[gi3], x3, y3, z3, w3);
    }

    let t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    let n4 = 0;
    if (t4 >= 0) {
      t4 *= t4;
      n4 = t4 * t4 * this.dot(this.grad4[gi4], x4, y4, z4, w4);
    }

    return 27.0 * (n0 + n1 + n2 + n3 + n4);
  }

  private simplex4DLookup = [
    [0, 1, 2, 3],
    [0, 1, 3, 2],
    [0, 0, 0, 0],
    [0, 2, 3, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 2, 3, 0],
    [0, 2, 1, 3],
    [0, 0, 0, 0],
    [0, 3, 1, 2],
    [0, 3, 2, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 3, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 2, 0, 3],
    [0, 0, 0, 0],
    [1, 3, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 3, 0, 1],
    [2, 3, 1, 0],
    [1, 0, 2, 3],
    [1, 0, 3, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 3, 1],
    [0, 0, 0, 0],
    [2, 1, 3, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 1, 3],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [3, 0, 1, 2],
    [3, 0, 2, 1],
    [0, 0, 0, 0],
    [3, 1, 2, 0],
    [2, 1, 0, 3],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [3, 1, 0, 2],
    [0, 0, 0, 0],
    [3, 2, 0, 1],
    [3, 2, 1, 0],
  ];

  private dot(grad: number[], ...coords: number[]): number {
    let sum = 0;
    for (let i = 0; i < coords.length; i++) {
      sum += grad[i] * coords[i];
    }
    return sum;
  }

  private computeStats(values: number[], executionTime: number): NoiseStats {
    if (values.length === 0) {
      return {
        sampleCount: 0,
        executionTime,
        minValue: 0,
        maxValue: 0,
        averageValue: 0,
        standardDeviation: 0,
        success: true,
      };
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - averageValue, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      sampleCount: values.length,
      executionTime,
      minValue,
      maxValue,
      averageValue,
      standardDeviation,
      success: true,
    };
  }

  private computeDetailedStatistics(values: number[]): any {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        variance: 0,
        skewness: 0,
        kurtosis: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Compute skewness and kurtosis
    let skewness = 0;
    let kurtosis = 0;
    for (const val of values) {
      const normalized = (val - mean) / stdDev;
      skewness += Math.pow(normalized, 3);
      kurtosis += Math.pow(normalized, 4);
    }
    skewness /= n;
    kurtosis = kurtosis / n - 3;

    return {
      min: sorted[0],
      max: sorted[n - 1],
      mean,
      median: n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)],
      standardDeviation: stdDev,
      variance,
      skewness,
      kurtosis,
    };
  }

  private computeFrequencyDomainProperties(_values: number[]): any {
    // Simplified frequency domain analysis
    const dominantFrequencies: number[] = [];
    const _spectralCentroid = 0;
    const _spectralRolloff = 0;

    return {
      dominantFrequencies,
      spectralCentroid: _spectralCentroid,
      spectralRolloff: _spectralRolloff,
    };
  }

  private computeSpatialProperties(_values: number[]): any {
    // Simplified spatial properties analysis
    return {
      correlationLength: 0,
      anisotropy: 0,
      roughness: 0,
    };
  }

  private applyFilter(values: number[], options: NoiseFilterOptions): number[] {
    // Simplified filter implementation
    const { filterType, cutoffFrequency } = options;

    switch (filterType) {
      case "lowpass":
        return values.map(val => val * (1 - cutoffFrequency));
      case "highpass":
        return values.map(val => val * cutoffFrequency);
      case "bandpass":
        return values.map(val => val * cutoffFrequency * (1 - cutoffFrequency));
      case "bandstop":
        return values.map(val => val * (1 - cutoffFrequency * (1 - cutoffFrequency)));
      default:
        return [...values];
    }
  }

  private computeFilterResponse(_options: NoiseFilterOptions): number[] {
    // Simplified filter response computation
    return [1.0];
  }

  private computeFilterGain(filtered: number[], original: number[]): number {
    if (original.length === 0) return 0;
    const originalPower = original.reduce((sum, val) => sum + val * val, 0) / original.length;
    const filteredPower = filtered.reduce((sum, val) => sum + val * val, 0) / filtered.length;
    return originalPower > 0 ? filteredPower / originalPower : 0;
  }

  private computeNoiseReduction(filtered: number[], original: number[]): number {
    if (original.length === 0) return 0;
    const originalVariance = this.computeVariance(original);
    const filteredVariance = this.computeVariance(filtered);
    return originalVariance > 0 ? (originalVariance - filteredVariance) / originalVariance : 0;
  }

  private computeVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}
