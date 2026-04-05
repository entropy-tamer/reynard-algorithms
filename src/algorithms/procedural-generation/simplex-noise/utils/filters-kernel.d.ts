/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/filters-kernel
 * @module algorithms/geometry/algorithms/simplex-noise/utils/filters-kernel
 * @description Kernel-based filter implementations for Simplex Noise.
 */
/**
 * Apply Gaussian filter
 *
 * @param values Input values
 * @param sigma Standard deviation
 * @returns Filtered values
 * @example
 * const filtered = applyGaussianFilter([0.1, 0.5, 0.9, 0.3], 1.0);
 * console.log(filtered); // Output: Gaussian filtered values
 */
export declare function applyGaussianFilter(values: number[], sigma: number): number[];
/**
 * Apply median filter
 *
 * @param values Input values
 * @param windowSize Window size
 * @returns Filtered values
 * @example
 * const filtered = applyMedianFilter([0.1, 0.5, 0.9, 0.3], 3);
 * console.log(filtered); // Output: median filtered values
 */
export declare function applyMedianFilter(values: number[], windowSize: number): number[];
//# sourceMappingURL=filters-kernel.d.ts.map