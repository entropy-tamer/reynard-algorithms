/**
 * @file Radix Sort implementation
 * Non-comparative integer sorting algorithm
 */

import type { Comparator, SortingConfig, SortingResult, ComplexityAnalysis } from "../core/types";
import { StateTracker } from "../utils/state-tracker";
import { trackMetrics } from "../core/metrics";

/**
 * Radix Sort algorithm (LSD - Least Significant Digit)
 * Sorts by processing digits from least to most significant
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function radixSort(
  array: number[],
  comparator: Comparator<number>,
  config: SortingConfig
): SortingResult<number> {
  const tracker = new StateTracker(array, comparator, config);
  let arr = [...array];
  const n = arr.length;

  if (n === 0) {
    return {
      sorted: arr,
      steps: [],
      metrics: trackMetrics([tracker.getCurrentState()]),
      timeComplexity: getComplexity(),
      algorithm: 'radix-sort',
    };
  }

  // Find maximum to determine number of digits
  let max = Math.abs(arr[0] ?? 0);
  for (let i = 1; i < n; i++) {
    const val = arr[i];
    if (val !== undefined) {
      const absVal = Math.abs(val);
      if (absVal > max) max = absVal;
    }
  }

  // Process each digit
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    tracker.recordOperation('distribute', [], `Processing digit at position ${exp}`);
    arr = countingSortByDigit(arr, exp, tracker);
    exp *= 10;
  }

  tracker.updateArray(arr);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: 'radix-sort',
  };
}

/**
 * Counting sort by digit
 * @param arr
 * @param exp
 * @param tracker
 * @example
 */
function countingSortByDigit(
  arr: number[],
  exp: number,
  tracker: StateTracker<number>
): number[] {
  const n = arr.length;
  const output = new Array<number>(n);
  const count = new Array<number>(10).fill(0);

  // Count occurrences of each digit
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    if (val !== undefined) {
      const digit = Math.floor((val / exp) % 10);
      const currentCount = count[digit];
      if (currentCount !== undefined) {
        count[digit] = currentCount + 1;
      }
    }
  }

  // Modify count to store positions
  for (let i = 1; i < 10; i++) {
    const prevCount = count[i - 1];
    const currentCount = count[i];
    if (prevCount !== undefined && currentCount !== undefined) {
      count[i] = currentCount + prevCount;
    }
  }

  // Build output array
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    if (val !== undefined) {
      const digit = Math.floor((val / exp) % 10);
      const digitCount = count[digit];
      if (digitCount !== undefined) {
        const idx = digitCount - 1;
        output[idx] = val;
        count[digit] = digitCount - 1;
        tracker.recordOperation('gather', [i, idx], `Placing ${val} at position ${idx} by digit ${digit}`);
      }
    }
  }

  return output;
}

/**
 * Get complexity analysis for Radix Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: 'O(d(n + k))',
    average: 'O(d(n + k))',
    worst: 'O(d(n + k))',
    space: 'O(n + k)',
    stable: true,
    inPlace: false,
    adaptive: false,
  };
}
