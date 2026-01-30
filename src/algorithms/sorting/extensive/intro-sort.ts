/**
 * @file Intro Sort implementation
 * Hybrid sorting algorithm combining quick sort and heap sort
 */

import { heapSort } from "../classical/heap-sort";
import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

const MAX_DEPTH = 2 * Math.floor(Math.log2(1000)); // Default depth limit

/**
 * Intro Sort algorithm
 * Uses quick sort, switches to heap sort if depth limit exceeded
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function introSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  introSortRecursive(arr, 0, n - 1, MAX_DEPTH, comparator, tracker, config);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "intro-sort",
  };
}

/**
 * Recursive intro sort implementation
 * @param arr
 * @param low
 * @param high
 * @param depthLimit
 * @param comparator
 * @param tracker
 * @param config
 * @example
 */
function introSortRecursive<T>(
  arr: T[],
  low: number,
  high: number,
  depthLimit: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>,
  config: SortingConfig
): void {
  const size = high - low + 1;

  // Use insertion sort for small arrays
  if (size < 16) {
    for (let i = low + 1; i <= high; i++) {
      const key = arr[i];
      if (key === undefined) continue;
      let j = i - 1;

      while (j >= low) {
        const current = arr[j];
        if (current === undefined) break;

        tracker.recordCompare([j, i], `Insertion sort: comparing ${j} and ${i}`);
        if (comparator(current, key) > 0) {
          tracker.recordSwap([j + 1, j], `Swapping ${j + 1} and ${j}`);
          arr[j + 1] = current;
          j--;
        } else {
          break;
        }
      }

      arr[j + 1] = key;
      tracker.updateArray(arr);
    }
    return;
  }

  // Switch to heap sort if depth limit exceeded
  if (depthLimit === 0) {
    tracker.recordOperation("heapify", [low, high], `Depth limit reached, switching to heap sort`);
    const subArray = arr.slice(low, high + 1);
    const heapResult = heapSort(subArray, comparator, {
      ...config,
      recordSteps: false,
    });
    for (let i = 0; i < heapResult.sorted.length; i++) {
      const value = heapResult.sorted[i];
      if (value !== undefined) {
        arr[low + i] = value;
      }
    }
    tracker.updateArray(arr);
    return;
  }

  // Use quick sort partition
  const pivotIdx = partition(arr, low, high, comparator, tracker);
  tracker.recordOperation(
    "partition",
    [low, pivotIdx, high],
    `Partitioned from ${low} to ${high}, pivot at ${pivotIdx}, depth: ${depthLimit}`
  );

  introSortRecursive(arr, low, pivotIdx - 1, depthLimit - 1, comparator, tracker, config);
  introSortRecursive(arr, pivotIdx + 1, high, depthLimit - 1, comparator, tracker, config);
}

/**
 * Partition function for intro sort
 * @param arr
 * @param low
 * @param high
 * @param comparator
 * @param tracker
 * @example
 */
function partition<T>(
  arr: T[],
  low: number,
  high: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): number {
  const pivotIdx = low + Math.floor(Math.random() * (high - low + 1));
  const pivot = arr[pivotIdx];
  if (pivot === undefined) return low;

  // Move pivot to end
  if (pivotIdx !== high) {
    const highVal = arr[high];
    if (highVal !== undefined) {
      tracker.recordSwap([pivotIdx, high], `Moving pivot from ${pivotIdx} to end`);
      [arr[pivotIdx], arr[high]] = [highVal, pivot];
    }
  }

  let i = low;
  for (let j = low; j < high; j++) {
    const valJ = arr[j];
    if (valJ === undefined) continue;

    tracker.recordCompare([j, high], `Comparing ${j} with pivot`);
    if (comparator(valJ, pivot) <= 0) {
      if (i !== j) {
        const valI = arr[i];
        if (valI !== undefined) {
          tracker.recordSwap([i, j], `Swapping ${i} and ${j}`);
          [arr[i], arr[j]] = [valJ, valI];
        }
      }
      i++;
    }
  }

  // Place pivot
  const highVal = arr[high];
  const iVal = arr[i];
  if (highVal !== undefined && iVal !== undefined) {
    tracker.recordSwap([i, high], `Placing pivot at ${i}`);
    [arr[i], arr[high]] = [highVal, iVal];
  }

  tracker.updateArray(arr);
  return i;
}

/**
 * Get complexity analysis for Intro Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(log n)",
    stable: false,
    inPlace: true,
    adaptive: false,
  };
}
