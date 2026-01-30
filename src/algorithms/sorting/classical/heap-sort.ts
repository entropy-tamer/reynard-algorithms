/**
 * @file Heap Sort implementation
 * Uses binary heap data structure for O(n log n) sorting
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Heap Sort algorithm
 * Builds a max heap, then repeatedly extracts the maximum element
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function heapSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, comparator, tracker);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    const rootVal = arr[0]!;
    const endVal = arr[i]!;
    tracker.recordSwap([0, i], `Moving root to end at index ${i}`);
    [arr[0], arr[i]] = [endVal, rootVal];
    tracker.updateArray(arr);

    // Call heapify on reduced heap
    heapify(arr, i, 0, comparator, tracker);
  }

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "heap-sort",
  };
}

/**
 * Heapify a subtree rooted at index i
 * Assumes subtrees are already heapified
 * @param arr
 * @param heapSize
 * @param i
 * @param comparator
 * @param tracker
 * @example
 */
function heapify<T>(arr: T[], heapSize: number, i: number, comparator: Comparator<T>, tracker: StateTracker<T>): void {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // Compare with left child
  if (left < heapSize) {
    tracker.recordCompare([largest, left], `Comparing parent ${largest} with left child ${left}`);
    if (comparator(arr[left]!, arr[largest]!) > 0) {
      largest = left;
    }
  }

  // Compare with right child
  if (right < heapSize) {
    tracker.recordCompare([largest, right], `Comparing ${largest} with right child ${right}`);
    if (comparator(arr[right]!, arr[largest]!) > 0) {
      largest = right;
    }
  }

  // If largest is not root
  if (largest !== i) {
    const iVal = arr[i]!;
    const largestVal = arr[largest]!;
    tracker.recordSwap([i, largest], `Swapping ${i} with ${largest} in heap`);
    [arr[i], arr[largest]] = [largestVal, iVal];
    tracker.updateArray(arr);

    // Recursively heapify the affected sub-tree
    heapify(arr, heapSize, largest, comparator, tracker);
  } else {
    tracker.recordOperation("heapify", [i], `Heap property satisfied at ${i}`);
  }
}

/**
 * Get complexity analysis for Heap Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: false,
  };
}
