/**
 * @file Bubble Sort implementation
 * Classic O(n²) sorting algorithm with early termination optimization
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Bubble Sort algorithm
 * Repeatedly steps through the list, compares adjacent elements and swaps them
 * if they are in the wrong order. The pass through the list is repeated until
 * the list is sorted.
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function bubbleSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;
  let swapped = false;

  for (let i = 0; i < n - 1; i++) {
    swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      const val1 = arr[j];
      const val2 = arr[j + 1];
      if (val1 === undefined || val2 === undefined) continue;

      tracker.recordCompare([j, j + 1], `Comparing ${j} and ${j + 1}`);

      if (comparator(val1, val2) > 0) {
        tracker.recordSwap([j, j + 1], `Swapping ${j} and ${j + 1}`);
        [arr[j], arr[j + 1]] = [val2, val1];
        swapped = true;
      }
    }

    // Early termination if no swaps occurred
    if (!swapped) {
      break;
    }
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
    algorithm: "bubble-sort",
  };
}

/**
 * Get complexity analysis for Bubble Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    adaptive: true,
  };
}
