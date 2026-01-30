/**
 * @file Selection Sort implementation
 * Simple O(n²) algorithm that finds minimum and places it at the beginning
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Selection Sort algorithm
 * Repeatedly finds the minimum element from unsorted portion and places
 * it at the beginning.
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function selectionSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    tracker.recordOperation("select", [i], `Finding minimum from index ${i}`);

    // Find minimum element in unsorted portion
    for (let j = i + 1; j < n; j++) {
      const valJ = arr[j];
      const valMin = arr[minIdx];
      if (valJ === undefined || valMin === undefined) continue;

      tracker.recordCompare([minIdx, j], `Comparing ${minIdx} with ${j}`);

      if (comparator(valJ, valMin) < 0) {
        minIdx = j;
      }
    }

    // Swap minimum with first element of unsorted portion
    if (minIdx !== i) {
      const valI = arr[i];
      const valMin = arr[minIdx];
      if (valI !== undefined && valMin !== undefined) {
        tracker.recordSwap([i, minIdx], `Swapping ${i} with minimum at ${minIdx}`);
        [arr[i], arr[minIdx]] = [valMin, valI];
        tracker.updateArray(arr);
      }
    }
  }

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "selection-sort",
  };
}

/**
 * Get complexity analysis for Selection Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: false,
  };
}
