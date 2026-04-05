/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/stats
 * @module algorithms/geometry/algorithms/simplex-noise/utils/stats
 * @description Statistics computation utilities for Simplex Noise.
 */
import type { NoiseStats } from "../simplex-noise-types.js";
/**
 * Compute basic statistics for noise values
 *
 * @param values Array of noise values
 * @param executionTime Execution time in milliseconds
 * @returns Noise statistics
 * @example
 * const stats = computeStats([0.1, 0.5, 0.9, 0.3], 10);
 * console.log(stats.min, stats.max, stats.mean); // Output: 0.1, 0.9, 0.45
 */
export declare function computeStats(values: number[], executionTime: number): NoiseStats;
/**
 * Compute detailed statistics for noise values
 *
 * @param values Array of noise values
 * @returns Detailed statistics
 * @example
 * const stats = computeDetailedStatistics([0.1, 0.5, 0.9, 0.3, 0.7]);
 * console.log(stats.median, stats.skewness); // Output: median and skewness values
 */
export declare function computeDetailedStatistics(values: number[]): any;
//# sourceMappingURL=stats.d.ts.map