/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/analysis
 * @module algorithms/geometry/algorithms/simplex-noise/utils/analysis
 * @description Main noise analysis utilities for Simplex Noise.
 */
import type { NoiseAnalysis, NoiseAnalysisOptions } from "../simplex-noise-types.js";
/**
 * Analyze noise properties
 *
 * @param values Array of noise values
 * @param options Analysis options
 * @returns Noise analysis
 * @example
 * const analysis = analyzeNoise([0.1, 0.5, 0.9], { includeDetailedStats: true });
 * console.log(analysis.basicStats); // Output: basic statistics object
 */
export declare function analyzeNoise(values: number[], options?: Partial<NoiseAnalysisOptions>): NoiseAnalysis;
//# sourceMappingURL=analysis.d.ts.map