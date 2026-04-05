/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/filters
 * @module algorithms/geometry/algorithms/simplex-noise/utils/filters
 * @description Main filter utilities for Simplex Noise.
 */
import type { NoiseFilterOptions } from "../simplex-noise-types.js";
/**
 * Apply noise filter
 *
 * @param values Array of noise values
 * @param options Filter options
 * @returns Filtered values
 * @example
 * const filtered = applyFilter([0.1, 0.5, 0.9], { filterType: 'lowpass', cutoffFrequency: 0.5 });
 * console.log(filtered); // Output: filtered noise values
 */
export declare function applyFilter(values: number[], options: NoiseFilterOptions): number[];
/**
 * Compute filter response
 *
 * @param _options Filter options (currently unused, reserved for future frequency domain analysis)
 * @returns Filter response
 * @example
 * const response = computeFilterResponse({ filterType: 'lowpass', cutoffFrequency: 0.5 });
 * console.log(response); // Output: filter frequency response array
 */
export declare function computeFilterResponse(_options: NoiseFilterOptions): number[];
/**
 * Compute filter gain
 *
 * @param filtered Filtered values
 * @param original Original values
 * @returns Filter gain
 * @example
 * const gain = computeFilterGain([0.2, 0.4], [0.3, 0.5]);
 * console.log(gain); // Output: power ratio of filtered to original
 */
export declare function computeFilterGain(filtered: number[], original: number[]): number;
/**
 * Compute noise reduction
 *
 * @param filtered Filtered values
 * @param original Original values
 * @returns Noise reduction ratio
 * @example
 * const reduction = computeNoiseReduction([0.2, 0.4], [0.3, 0.5]);
 * console.log(reduction); // Output: noise reduction ratio
 */
export declare function computeNoiseReduction(filtered: number[], original: number[]): number;
//# sourceMappingURL=filters.d.ts.map