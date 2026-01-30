/**
 * @file Smooth Sort implementation
 * Adaptive variant of heap sort using Leonardo heap structure
 * O(n log n) worst case, O(n) best case for sorted data
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Leonardo numbers: L(0) = 1, L(1) = 1, L(n) = L(n-1) + L(n-2) + 1
 * @param k
 * @example
 */
function leonardoNumber(k: number): number {
  if (k < 2) return 1;
  let a = 1;
  let b = 1;
  for (let i = 2; i <= k; i++) {
    const temp = a + b + 1;
    a = b;
    b = temp;
  }
  return b;
}

/**
 * Get Leonardo heap size for given index
 * @param index
 * @example
 */
function getHeapSize(index: number): number {
  let k = 0;
  while (leonardoNumber(k) <= index) {
    k++;
  }
  return k - 1;
}

/**
 * Restore heap property in Leonardo heap
 * @param arr
 * @param root
 * @param size
 * @param comparator
 * @param tracker
 * @example
 */
function restoreHeap<T>(
  arr: T[],
  root: number,
  size: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): void {
  let current = root;
  let heapSize = size;

  while (heapSize > 1) {
    const leftSize = heapSize - 2;
    const leftChild = current - leonardoNumber(leftSize) - 1;
    const rightChild = current - 1;

    const currentVal = arr[current];
    const leftVal = arr[leftChild];
    const rightVal = arr[rightChild];

    if (currentVal === undefined) break;

    let largest = current;

    if (leftVal !== undefined && comparator(leftVal, currentVal) > 0) {
      largest = leftChild;
    }

    if (rightVal !== undefined) {
      const largestVal = arr[largest];
      if (largestVal !== undefined && comparator(rightVal, largestVal) > 0) {
        largest = rightChild;
      }
    }

    if (largest !== current) {
      const largestVal = arr[largest];
      if (largestVal !== undefined) {
        tracker.recordSwap([current, largest], `Smooth sort: swapping ${current} and ${largest}`);
        [arr[current], arr[largest]] = [largestVal, currentVal];
        current = largest;
        heapSize = getHeapSize(current);
      } else {
        break;
      }
    } else {
      break;
    }
  }
}

/**
 * Smooth Sort algorithm
 * Adaptive heap sort using Leonardo heaps
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function smoothSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  if (n <= 1) {
    return {
      sorted: arr,
      steps: [],
      metrics: trackMetrics([tracker.getCurrentState()]),
      timeComplexity: getComplexity(),
      algorithm: "smooth-sort",
    };
  }

  // Build Leonardo heaps
  const heapSizes: number[] = [];
  for (let i = 0; i < n; i++) {
    let heapSize = 1;
    if (heapSizes.length >= 2) {
      const prev1 = heapSizes[heapSizes.length - 1];
      const prev2 = heapSizes[heapSizes.length - 2];
      if (prev1 !== undefined && prev2 !== undefined && prev1 === prev2 + 1) {
        heapSizes.pop();
        heapSizes.pop();
        heapSize = prev1 + 1;
      }
    }

    heapSizes.push(heapSize);
    tracker.recordOperation("heapify", [i], `Building Leonardo heap of size ${heapSize} at ${i}`);

    // Restore heap property
    if (heapSize > 1) {
      restoreHeap(arr, i, heapSize, comparator, tracker);
    }
  }

  // Extract elements
  for (let i = n - 1; i >= 0; i--) {
    // Find largest heap root
    let maxRoot = 0;
    let maxRootIdx = 0;
    let offset = 0;

    for (let j = 0; j < heapSizes.length; j++) {
      const size = heapSizes[j];
      if (size === undefined) continue;
      const rootIdx = offset + leonardoNumber(size) - 1;
      const rootVal = arr[rootIdx];
      const maxVal = arr[maxRootIdx];

      if (rootVal !== undefined && maxVal !== undefined) {
        if (comparator(rootVal, maxVal) > 0) {
          maxRoot = j;
          maxRootIdx = rootIdx;
        }
      }

      offset += leonardoNumber(size);
    }

    // Swap root with last element
    if (maxRootIdx !== i) {
      const rootVal = arr[maxRootIdx];
      const lastVal = arr[i];
      if (rootVal !== undefined && lastVal !== undefined) {
        tracker.recordSwap([maxRootIdx, i], `Smooth sort: extracting root from ${maxRootIdx} to ${i}`);
        [arr[maxRootIdx], arr[i]] = [lastVal, rootVal];
      }
    }

    // Remove heap and restore
    const heapSize = heapSizes[maxRoot];
    heapSizes.splice(maxRoot, 1);

    if (heapSize !== undefined && heapSize > 1) {
      const leftSize = heapSize - 2;
      const rightSize = heapSize - 1;
      heapSizes.push(leftSize, rightSize);
      restoreHeap(arr, maxRootIdx - leonardoNumber(rightSize), leftSize, comparator, tracker);
      restoreHeap(arr, maxRootIdx - 1, rightSize, comparator, tracker);
    }

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
    algorithm: "smooth-sort",
  };
}

/**
 * Get complexity analysis for Smooth Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: true,
  };
}
