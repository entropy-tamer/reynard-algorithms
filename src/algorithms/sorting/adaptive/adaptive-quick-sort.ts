/**
 * @file Adaptive Quick Sort implementation
 * Detects presorted and partially sorted data for optimization
 */

import { calculateInversionCount, trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Check if array is already sorted
 * @param arr
 * @param comparator
 * @example
 */
function isSorted<T>(arr: T[], comparator: Comparator<T>): boolean {
  for (let i = 1; i < arr.length; i++) {
    const prev = arr[i - 1];
    const curr = arr[i];
    if (prev !== undefined && curr !== undefined) {
      if (comparator(prev, curr) > 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check if array is reverse sorted
 * @param arr
 * @param comparator
 * @example
 */
function isReverseSorted<T>(arr: T[], comparator: Comparator<T>): boolean {
  for (let i = 1; i < arr.length; i++) {
    const prev = arr[i - 1];
    const curr = arr[i];
    if (prev !== undefined && curr !== undefined) {
      if (comparator(prev, curr) < 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Detect if array is nearly sorted (low inversion count)
 * @param arr
 * @param comparator
 * @param threshold
 * @example
 */
function isNearlySorted<T>(arr: T[], comparator: Comparator<T>, threshold: number): boolean {
  const invCount = calculateInversionCount([...arr], comparator);
  const maxInv = (arr.length * (arr.length - 1)) / 2;
  return invCount / maxInv < threshold;
}

/**
 * Adaptive partition that chooses pivot based on data characteristics
 * @param arr
 * @param low
 * @param high
 * @param comparator
 * @param tracker
 * @example
 */
function adaptivePartition<T>(
  arr: T[],
  low: number,
  high: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): number {
  // Use median-of-three for better pivot selection
  const mid = Math.floor((low + high) / 2);
  const lowVal = arr[low];
  const midVal = arr[mid];
  const highVal = arr[high];

  if (lowVal === undefined || midVal === undefined || highVal === undefined) {
    return low;
  }

  // Find median
  let pivotIdx = low;
  if (comparator(lowVal, midVal) <= 0 && comparator(midVal, highVal) <= 0) {
    pivotIdx = mid;
  } else if (comparator(lowVal, highVal) <= 0 && comparator(highVal, midVal) <= 0) {
    pivotIdx = high;
  } else if (comparator(midVal, lowVal) <= 0 && comparator(lowVal, highVal) <= 0) {
    pivotIdx = low;
  } else if (comparator(midVal, highVal) <= 0 && comparator(highVal, lowVal) <= 0) {
    pivotIdx = high;
  } else {
    pivotIdx = mid;
  }

  const pivot = arr[pivotIdx];
  if (pivot === undefined) return low;

  // Move pivot to end
  if (pivotIdx !== high) {
    const highVal = arr[high];
    if (highVal !== undefined) {
      tracker.recordSwap([pivotIdx, high], `Moving median-of-three pivot to end`);
      [arr[pivotIdx], arr[high]] = [highVal, pivot];
    }
  }

  let i = low;
  for (let j = low; j < high; j++) {
    const valJ = arr[j];
    if (valJ === undefined) continue;

    tracker.recordCompare([j, high], `Adaptive partition: comparing ${j} with pivot`);
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
  const pivotHighVal = arr[high];
  const iVal = arr[i];
  if (pivotHighVal !== undefined && iVal !== undefined) {
    tracker.recordSwap([i, high], `Placing pivot at ${i}`);
    [arr[i], arr[high]] = [pivotHighVal, iVal];
  }

  tracker.recordPartition([low, high], i, pivot, `Adaptive partition: pivot at ${i} using median-of-three`);
  tracker.updateArray(arr);

  return i;
}

/**
 * Adaptive Quick Sort algorithm
 * Optimizes for presorted and nearly sorted data
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function adaptiveQuickSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  // Early exit for sorted arrays
  if (isSorted(arr, comparator)) {
    tracker.recordOperation("compare", [], `Array is already sorted`);
    const finalState = tracker.getCurrentState();
    return {
      sorted: arr,
      steps: tracker.getSteps(),
      metrics: trackMetrics([finalState]),
      timeComplexity: getComplexity(),
      algorithm: "adaptive-quick-sort",
    };
  }

  // Optimize for reverse sorted
  if (isReverseSorted(arr, comparator)) {
    tracker.recordOperation("swap", [], `Array is reverse sorted, reversing`);
    arr.reverse();
    tracker.updateArray(arr);
    const finalState = tracker.getCurrentState();
    return {
      sorted: arr,
      steps: tracker.getSteps(),
      metrics: trackMetrics([finalState]),
      timeComplexity: getComplexity(),
      algorithm: "adaptive-quick-sort",
    };
  }

  // Use insertion sort for small arrays
  if (n < 10) {
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      if (key === undefined) continue;
      let j = i - 1;

      while (j >= 0) {
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

    const finalState = tracker.getCurrentState();
    const steps = tracker.getSteps();
    const metrics = trackMetrics([...steps.map(s => s.state), finalState]);
    return {
      sorted: arr,
      steps,
      metrics,
      timeComplexity: getComplexity(),
      algorithm: "adaptive-quick-sort",
    };
  }

  // Check if nearly sorted
  const nearlySorted = isNearlySorted(arr, comparator, 0.1);
  if (nearlySorted) {
    tracker.recordOperation("partition", [], `Array is nearly sorted (low inversion count), using optimized partition`);
  }

  adaptiveQuickSortRecursive(arr, 0, n - 1, comparator, tracker, nearlySorted);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "adaptive-quick-sort",
  };
}

/**
 * Recursive adaptive quick sort
 * @param arr
 * @param low
 * @param high
 * @param comparator
 * @param tracker
 * @param nearlySorted
 * @example
 */
function adaptiveQuickSortRecursive<T>(
  arr: T[],
  low: number,
  high: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>,
  nearlySorted: boolean
): void {
  if (low < high) {
    const pivotIdx = adaptivePartition(arr, low, high, comparator, tracker);

    tracker.recordOperation(
      "partition",
      [low, pivotIdx, high],
      `Adaptive partition: from ${low} to ${high}, pivot at ${pivotIdx}`
    );

    adaptiveQuickSortRecursive(arr, low, pivotIdx - 1, comparator, tracker, nearlySorted);
    adaptiveQuickSortRecursive(arr, pivotIdx + 1, high, comparator, tracker, nearlySorted);
  }
}

/**
 * Get complexity analysis for Adaptive Quick Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: false,
    inPlace: true,
    adaptive: true,
  };
}
