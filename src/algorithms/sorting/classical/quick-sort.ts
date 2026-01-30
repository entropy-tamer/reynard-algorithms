/**
 * @file Quick Sort implementation
 * Efficient divide-and-conquer algorithm with average O(n log n) complexity
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Quick Sort algorithm
 * Picks a pivot, partitions array around pivot, then recursively sorts partitions
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function quickSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];

  quickSortRecursive(arr, 0, arr.length - 1, comparator, tracker);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "quick-sort",
  };
}

/**
 * Recursive quick sort implementation
 * @param arr
 * @param low
 * @param high
 * @param comparator
 * @param tracker
 * @example
 */
function quickSortRecursive<T>(
  arr: T[],
  low: number,
  high: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): void {
  if (low < high) {
    const pivotIdx = partition(arr, low, high, comparator, tracker);

    tracker.recordOperation(
      "partition",
      [low, pivotIdx, high],
      `Partitioned from ${low} to ${high}, pivot at ${pivotIdx}`
    );

    // Recursively sort elements before and after partition
    quickSortRecursive(arr, low, pivotIdx - 1, comparator, tracker);
    quickSortRecursive(arr, pivotIdx + 1, high, comparator, tracker);
  }
}

/**
 * Partition function using Lomuto partition scheme
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
  // Choose random pivot for better average performance
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

  let i = low; // Index of smaller element

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

  // Place pivot in correct position
  const highVal = arr[high];
  const iVal = arr[i];
  if (highVal !== undefined && iVal !== undefined) {
    tracker.recordSwap([i, high], `Placing pivot at ${i}`);
    [arr[i], arr[high]] = [highVal, iVal];
  }

  tracker.recordPartition([low, high], i, pivot, `Partitioned around pivot at ${i}`);
  tracker.updateArray(arr);

  return i;
}

/**
 * Three-way partition (Bentley-McIlroy) for handling duplicates
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function quickSort3Way<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];

  quickSort3WayRecursive(arr, 0, arr.length - 1, comparator, tracker);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "quick-sort-3way",
  };
}

/**
 * Three-way partition recursive implementation
 * @param arr
 * @param low
 * @param high
 * @param comparator
 * @param tracker
 * @example
 */
function quickSort3WayRecursive<T>(
  arr: T[],
  low: number,
  high: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): void {
  if (high <= low) return;

  const pivotIdx = low + Math.floor(Math.random() * (high - low + 1));
  const pivot = arr[pivotIdx];
  if (pivot === undefined) return;

  let lt = low; // arr[low..lt-1] < pivot
  let i = low + 1; // arr[lt..i-1] == pivot
  let gt = high; // arr[gt+1..high] > pivot

  while (i <= gt) {
    const valI = arr[i];
    if (valI === undefined) break;

    const cmp = comparator(valI, pivot);
    tracker.recordCompare([i, pivotIdx], `Comparing ${i} with pivot`);

    if (cmp < 0) {
      const valLt = arr[lt];
      if (valLt !== undefined) {
        tracker.recordSwap([lt, i], `Swapping ${lt} and ${i}`);
        [arr[lt], arr[i]] = [valI, valLt];
      }
      lt++;
      i++;
    } else if (cmp > 0) {
      const valGt = arr[gt];
      if (valGt !== undefined) {
        tracker.recordSwap([i, gt], `Swapping ${i} and ${gt}`);
        [arr[i], arr[gt]] = [valGt, valI];
      }
      gt--;
    } else {
      i++;
    }
  }

  tracker.recordPartition(
    [low, high],
    pivotIdx,
    pivot,
    `Three-way partitioned: <${pivot} at [${low}..${lt - 1}], ==${pivot} at [${lt}..${gt}], >${pivot} at [${gt + 1}..${high}]`
  );
  tracker.updateArray(arr);

  quickSort3WayRecursive(arr, low, lt - 1, comparator, tracker);
  quickSort3WayRecursive(arr, gt + 1, high, comparator, tracker);
}

/**
 * Get complexity analysis for Quick Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: false,
    inPlace: true,
    adaptive: false,
  };
}
