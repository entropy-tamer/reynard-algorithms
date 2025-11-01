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
export function applyLowPassFilter(values: number[], cutoff: number): number[] {
  const filtered: number[] = [];
  const alpha = cutoff;
  
  filtered[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    filtered[i] = alpha * values[i] + (1 - alpha) * filtered[i - 1];
  }
  
  return filtered;
}

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
export function applyHighPassFilter(values: number[], cutoff: number): number[] {
  const filtered: number[] = [];
  const alpha = cutoff;
  
  filtered[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    filtered[i] = alpha * (filtered[i - 1] + values[i] - values[i - 1]);
  }
  
  return filtered;
}

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
export function applyBandPassFilter(values: number[], lowCutoff: number, highCutoff: number): number[] {
  const lowPassed = applyLowPassFilter(values, highCutoff);
  return applyHighPassFilter(lowPassed, lowCutoff);
}

