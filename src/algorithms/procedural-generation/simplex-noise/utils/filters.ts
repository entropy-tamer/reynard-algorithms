/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/filters
 * @module algorithms/geometry/algorithms/simplex-noise/utils/filters
 * @description Main filter utilities for Simplex Noise.
 */

import type { NoiseFilterOptions } from "../simplex-noise-types.js";
import { applyLowPassFilter, applyHighPassFilter, applyBandPassFilter } from "./filters-frequency.js";
import { applyGaussianFilter, applyMedianFilter } from "./filters-kernel.js";

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
export function applyFilter(values: number[], options: NoiseFilterOptions): number[] {
  const { filterType } = options;
  const filterParams = options.filterParams ?? ({} as Record<string, number>);

  switch (filterType) {
    case "lowpass":
      return applyLowPassFilter(values, Number(filterParams.cutoff ?? 0.5));
    case "highpass":
      return applyHighPassFilter(values, Number(filterParams.cutoff ?? 0.5));
    case "bandpass":
      return applyBandPassFilter(values, Number(filterParams.lowCutoff ?? 0.2), Number(filterParams.highCutoff ?? 0.8));
    case "gaussian":
      return applyGaussianFilter(values, Number(filterParams.sigma ?? 1.0));
    case "median":
      return applyMedianFilter(values, Math.max(1, Math.floor(Number(filterParams.windowSize ?? 3))));
    default:
      return [...values];
  }
}

/**
 * Compute filter response
 *
 * @param options Filter options
 * @returns Filter response
 * @example
 * const response = computeFilterResponse({ filterType: 'lowpass', cutoffFrequency: 0.5 });
 * console.log(response); // Output: filter frequency response array
 */
export function computeFilterResponse(options: NoiseFilterOptions): number[] {
  // This would typically involve frequency domain analysis
  // For now, return a simple response
  return Array.from({ length: 100 }, (_, i) => Math.sin((2 * Math.PI * i) / 100));
}

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
export function computeFilterGain(filtered: number[], original: number[]): number {
  const filteredPower = filtered.reduce((sum, val) => sum + val * val, 0);
  const originalPower = original.reduce((sum, val) => sum + val * val, 0);
  return originalPower > 0 ? filteredPower / originalPower : 0;
}

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
export function computeNoiseReduction(filtered: number[], original: number[]): number {
  const noisePower = original.reduce((sum, val, i) => sum + (val - filtered[i]) ** 2, 0);
  const signalPower = filtered.reduce((sum, val) => sum + val * val, 0);
  return signalPower > 0 ? noisePower / signalPower : 0;
}
