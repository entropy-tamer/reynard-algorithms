/**
 * @file Merge Sort implementation
 * Divide-and-conquer algorithm with O(n log n) complexity
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Merge Sort algorithm
 * Divides array into halves, sorts each half, then merges them
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function mergeSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];

  mergeSortRecursive(arr, 0, arr.length - 1, comparator, tracker);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "merge-sort",
  };
}

/**
 * Recursive merge sort implementation
 * @param arr
 * @param left
 * @param right
 * @param comparator
 * @param tracker
 * @example
 */
function mergeSortRecursive<T>(
  arr: T[],
  left: number,
  right: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): void {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);

    tracker.recordOperation("partition", [left, mid, right], `Dividing array from ${left} to ${right} at ${mid}`);

    // Sort first and second halves
    mergeSortRecursive(arr, left, mid, comparator, tracker);
    mergeSortRecursive(arr, mid + 1, right, comparator, tracker);

    // Merge the sorted halves
    merge(arr, left, mid, right, comparator, tracker);
  }
}

/**
 * Merge two sorted subarrays
 * @param arr
 * @param left
 * @param mid
 * @param right
 * @param comparator
 * @param tracker
 * @example
 */
function merge<T>(
  arr: T[],
  left: number,
  mid: number,
  right: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): void {
  const n1 = mid - left + 1;
  const n2 = right - mid;

  // Create temporary arrays
  const leftArr: T[] = new Array(n1);
  const rightArr: T[] = new Array(n2);

  // Copy data to temporary arrays
  for (let i = 0; i < n1; i++) {
    const val = arr[left + i];
    if (val !== undefined) {
      leftArr[i] = val;
    }
  }
  for (let j = 0; j < n2; j++) {
    const val = arr[mid + 1 + j];
    if (val !== undefined) {
      rightArr[j] = val;
    }
  }

  // Merge the temporary arrays back
  let i = 0;
  let j = 0;
  let k = left;

  while (i < n1 && j < n2) {
    const leftVal = leftArr[i];
    const rightVal = rightArr[j];
    if (leftVal === undefined || rightVal === undefined) break;

    tracker.recordCompare([left + i, mid + 1 + j], `Comparing ${left + i} and ${mid + 1 + j} in merge`);

    if (comparator(leftVal, rightVal) <= 0) {
      arr[k] = leftVal;
      i++;
    } else {
      arr[k] = rightVal;
      j++;
    }
    k++;
  }

  // Copy remaining elements
  while (i < n1) {
    const val = leftArr[i];
    if (val !== undefined) {
      arr[k] = val;
      i++;
      k++;
    } else {
      break;
    }
  }

  while (j < n2) {
    const val = rightArr[j];
    if (val !== undefined) {
      arr[k] = val;
      j++;
      k++;
    } else {
      break;
    }
  }

  tracker.recordMerge([left, right], left, mid, mid + 1, right, `Merged subarrays from ${left} to ${right}`);
  tracker.updateArray(arr);
}

/**
 * Get complexity analysis for Merge Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
    adaptive: false,
  };
}
