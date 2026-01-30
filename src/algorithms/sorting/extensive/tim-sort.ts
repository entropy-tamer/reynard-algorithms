/**
 * @file Tim Sort implementation
 * Hybrid stable sorting algorithm derived from merge sort and insertion sort
 */

import { insertionSort } from "../classical/insertion-sort";
import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

const MIN_MERGE = 32;

/**
 * Calculate minimum run length
 * @param n
 * @example
 */
function minRunLength(n: number): number {
  let r = 0;
  while (n >= MIN_MERGE) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}

/**
 * Find run length starting at index
 * @param arr
 * @param start
 * @param end
 * @param comparator
 * @example
 */
function findRunLength<T>(arr: T[], start: number, end: number, comparator: Comparator<T>): number {
  if (start >= end) return 1;

  let length = 2;
  const first = arr[start];
  const second = arr[start + 1];
  if (first === undefined || second === undefined) return 1;

  const ascending = comparator(first, second) <= 0;

  for (let i = start + 2; i < end; i++) {
    const current = arr[i];
    const prev = arr[i - 1];
    if (current === undefined || prev === undefined) break;

    const cmp = comparator(prev, current);
    if ((ascending && cmp > 0) || (!ascending && cmp < 0)) {
      break;
    }
    length++;
  }

  // Reverse if descending
  if (!ascending) {
    let left = start;
    let right = start + length - 1;
    while (left < right) {
      const temp = arr[left]!;
      arr[left] = arr[right]!;
      arr[right] = temp;
      left++;
      right--;
    }
  }

  return length;
}

/**
 * Merge two runs
 * @param arr
 * @param left
 * @param mid
 * @param right
 * @param comparator
 * @param tracker
 * @example
 */
function mergeRuns<T>(
  arr: T[],
  left: number,
  mid: number,
  right: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): void {
  const len1 = mid - left + 1;
  const len2 = right - mid;
  const leftArr: T[] = [];
  const rightArr: T[] = [];

  for (let i = 0; i < len1; i++) {
    const val = arr[left + i];
    if (val !== undefined) leftArr.push(val);
  }
  for (let j = 0; j < len2; j++) {
    const val = arr[mid + 1 + j];
    if (val !== undefined) rightArr.push(val);
  }

  let i = 0;
  let j = 0;
  let k = left;

  while (i < len1 && j < len2) {
    const leftVal = leftArr[i];
    const rightVal = rightArr[j];
    if (leftVal === undefined || rightVal === undefined) break;

    tracker.recordCompare([left + i, mid + 1 + j], `Merging runs: comparing ${left + i} and ${mid + 1 + j}`);

    if (comparator(leftVal, rightVal) <= 0) {
      arr[k] = leftVal;
      i++;
    } else {
      arr[k] = rightVal;
      j++;
    }
    k++;
  }

  while (i < len1) {
    const val = leftArr[i];
    if (val !== undefined) {
      arr[k] = val;
      i++;
      k++;
    } else {
      break;
    }
  }

  while (j < len2) {
    const val = rightArr[j];
    if (val !== undefined) {
      arr[k] = val;
      j++;
      k++;
    } else {
      break;
    }
  }

  tracker.recordMerge([left, right], left, mid, mid + 1, right, `Merged runs from ${left} to ${right}`);
  tracker.updateArray(arr);
}

/**
 * Tim Sort algorithm
 * Hybrid of merge sort and insertion sort, optimized for real-world data
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function timSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  if (n < MIN_MERGE) {
    // Use insertion sort for small arrays
    const result = insertionSort(arr, comparator, {
      ...config,
      recordSteps: false,
    });
    tracker.updateArray(result.sorted);
    const finalState = tracker.getCurrentState();
    return {
      sorted: result.sorted,
      steps: tracker.getSteps(),
      metrics: trackMetrics([finalState]),
      timeComplexity: getComplexity(),
      algorithm: "tim-sort",
    };
  }

  const minRun = minRunLength(n);
  const runs: Array<{ start: number; length: number }> = [];

  // Identify runs
  let i = 0;
  while (i < n) {
    const runLen = findRunLength(arr, i, n, comparator);
    runs.push({ start: i, length: runLen });
    tracker.recordOperation("partition", [i, i + runLen - 1], `Found run from ${i} to ${i + runLen - 1}`);

    // Use insertion sort for runs smaller than minRun
    if (runLen < minRun) {
      const end = Math.min(i + minRun, n);
      const subArray = arr.slice(i, end);
      const sorted = insertionSort(subArray, comparator, {
        ...config,
        recordSteps: false,
      }).sorted;
      for (let j = 0; j < sorted.length; j++) {
        const val = sorted[j];
        if (val !== undefined) {
          arr[i + j] = val;
        }
      }
      tracker.updateArray(arr);
    }

    i += runLen;
  }

  // Merge runs
  while (runs.length > 1) {
    const run1 = runs.pop();
    const run2 = runs.pop();
    if (run1 && run2) {
      mergeRuns(arr, run2.start, run2.start + run2.length - 1, run1.start + run1.length - 1, comparator, tracker);
      runs.push({
        start: run2.start,
        length: run2.length + run1.length,
      });
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
    algorithm: "tim-sort",
  };
}

/**
 * Get complexity analysis for Tim Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
    adaptive: true,
  };
}
