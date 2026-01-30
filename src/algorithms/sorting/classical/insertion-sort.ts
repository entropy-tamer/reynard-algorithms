/**
 * @file Insertion Sort implementation
 * Efficient for small arrays and nearly sorted data
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Insertion Sort algorithm
 * Builds the sorted array one item at a time by inserting each element
 * into its correct position in the sorted portion.
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function insertionSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    if (key === undefined) continue;
    let j = i - 1;

    tracker.recordOperation("insert", [i], `Inserting element at index ${i}`);

    // Move elements greater than key one position ahead
    while (j >= 0) {
      const current = arr[j];
      if (current === undefined) break;

      tracker.recordCompare([j, i], `Comparing ${j} with key at ${i}`);

      if (comparator(current, key) > 0) {
        tracker.recordOperation("swap", [j + 1, j], `Moving ${j} to ${j + 1}`);
        arr[j + 1] = current;
        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    tracker.updateArray(arr);
  }

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "insertion-sort",
  };
}

/**
 * Binary Insertion Sort variant
 * Uses binary search to find insertion position
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function binaryInsertionSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    if (key === undefined) continue;
    const pos = binarySearch(arr, 0, i - 1, key, comparator, tracker);

    // Shift elements
    for (let j = i; j > pos; j--) {
      const prev = arr[j - 1];
      if (prev === undefined) break;
      tracker.recordOperation("swap", [j, j - 1], `Shifting ${j - 1} to ${j}`);
      arr[j] = prev;
    }

    arr[pos] = key;
    tracker.updateArray(arr);
  }

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "binary-insertion-sort",
  };
}

/**
 * Binary search for insertion position
 * @param arr
 * @param left
 * @param right
 * @param key
 * @param comparator
 * @param tracker
 * @example
 */
function binarySearch<T>(
  arr: T[],
  left: number,
  right: number,
  key: T,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): number {
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midVal = arr[mid];
    if (midVal === undefined) break;

    tracker.recordCompare([mid, -1], `Binary search comparing ${mid} with key`);

    const cmp = comparator(midVal, key);
    if (cmp <= 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return left;
}

/**
 * Get complexity analysis for Insertion Sort
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
