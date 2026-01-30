/**
 * @file Counting Sort implementation
 * Integer sorting algorithm with O(n + k) complexity
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Counting Sort algorithm
 * Sorts integers by counting occurrences of each value
 * Only works for non-negative integers
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function countingSort(
  array: number[],
  comparator: Comparator<number>,
  config: SortingConfig
): SortingResult<number> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  if (n === 0) {
    return {
      sorted: arr,
      steps: [],
      metrics: trackMetrics([tracker.getCurrentState()]),
      timeComplexity: getComplexity(),
      algorithm: "counting-sort",
    };
  }

  // Find range
  let min = arr[0] ?? 0;
  let max = arr[0] ?? 0;
  for (let i = 1; i < n; i++) {
    const val = arr[i];
    if (val !== undefined) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  const range = max - min + 1;
  const count = new Array<number>(range).fill(0);

  // Count occurrences
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    if (val !== undefined) {
      count[val - min]!++;
      tracker.recordOperation("distribute", [i], `Counting value ${val}`);
    }
  }

  // Modify count to store positions
  for (let i = 1; i < range; i++) {
    count[i]! += count[i - 1]!;
  }

  // Build output array
  const output = new Array<number>(n);
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    if (val !== undefined) {
      const idx = count[val - min]! - 1;
      output[idx] = val;
      count[val - min]!--;
      tracker.recordOperation("gather", [i, idx], `Placing ${val} at position ${idx}`);
    }
  }

  tracker.updateArray(output);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: output,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "counting-sort",
  };
}

/**
 * Get complexity analysis for Counting Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n + k)",
    average: "O(n + k)",
    worst: "O(n + k)",
    space: "O(k)",
    stable: true,
    inPlace: false,
    adaptive: false,
  };
}
