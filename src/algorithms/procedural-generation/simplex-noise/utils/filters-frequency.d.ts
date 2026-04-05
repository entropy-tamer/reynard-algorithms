/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/filters-frequency
 * @module algorithms/geometry/algorithms/simplex-noise/utils/filters-frequency
 * @description Frequency-based filter implementations for Simplex Noise.
 */
/**
 * Apply low-pass filter
 *
 * @param values Input values
 * @param cutoff Cutoff frequency
 * @returns Filtered values
 * @example
 * const filtered = applyLowPassFilter([0.1, 0.5, 0.9, 0.3], 0.5);
 * console.log(filtered); // Output: low-pass filtered values
 */
export declare function applyLowPassFilter(values: number[], cutoff: number): number[];
/**
 * Apply high-pass filter
 *
 * @param values Input values
 * @param cutoff Cutoff frequency
 * @returns Filtered values
 * @example
 * const filtered = applyHighPassFilter([0.1, 0.5, 0.9, 0.3], 0.5);
 * console.log(filtered); // Output: high-pass filtered values
 */
export declare function applyHighPassFilter(values: number[], cutoff: number): number[];
/**
 * Apply band-pass filter
 *
 * @param values Input values
 * @param lowCutoff Low cutoff frequency
 * @param highCutoff High cutoff frequency
 * @returns Filtered values
 * @example
 * const filtered = applyBandPassFilter([0.1, 0.5, 0.9, 0.3], 0.2, 0.8);
 * console.log(filtered); // Output: band-pass filtered values
 */
export declare function applyBandPassFilter(values: number[], lowCutoff: number, highCutoff: number): number[];
//# sourceMappingURL=filters-frequency.d.ts.map