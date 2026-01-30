/**
 * @file Shell Sort implementation
 * Generalization of insertion sort with gap sequences
 */

import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Generate Knuth gap sequence: (3^k - 1) / 2
 * @param n
 * @example
 */
function knuthGaps(n: number): number[] {
  const gaps: number[] = [];
  let gap = 1;
  while (gap < n) {
    gaps.push(gap);
    gap = gap * 3 + 1;
  }
  return gaps.reverse();
}

/**
 * Generate Sedgewick gap sequence
 * @param n
 * @example
 */
function sedgewickGaps(n: number): number[] {
  const gaps: number[] = [];
  let i = 0;
  let gap = 1;
  while (gap < n) {
    gaps.push(gap);
    if (i % 2 === 0) {
      gap = 9 * Math.pow(4, i) - 9 * Math.pow(2, i) + 1;
    } else {
      gap = Math.pow(4, i + 1) - 3 * Math.pow(2, i + 1) + 1;
    }
    i++;
  }
  return gaps.reverse();
}

/**
 * Ciura gap sequence (known good sequence)
 */
export const CIURA_GAPS = [1, 4, 10, 23, 57, 132, 301, 701];

/**
 * Shell Sort algorithm
 * Uses gap sequences to perform insertion sort on subarrays
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function shellSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  // Use Knuth sequence by default
  const gaps = knuthGaps(n);

  for (const gap of gaps) {
    tracker.recordOperation("partition", [], `Shell sort with gap ${gap}`);

    // Perform insertion sort with gap
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      if (temp === undefined) continue;

      let j = i;
      while (j >= gap) {
        const val = arr[j - gap];
        if (val === undefined) break;

        tracker.recordCompare([j, j - gap], `Comparing ${j} and ${j - gap} with gap ${gap}`);

        if (comparator(val, temp) > 0) {
          tracker.recordSwap([j, j - gap], `Swapping ${j} and ${j - gap}`);
          arr[j] = val;
          j -= gap;
        } else {
          break;
        }
      }

      arr[j] = temp;
      tracker.updateArray(arr);
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
    algorithm: "shell-sort",
  };
}

/**
 * Shell Sort with Sedgewick gaps
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function shellSortSedgewick<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;
  const gaps = sedgewickGaps(n);

  for (const gap of gaps) {
    tracker.recordOperation("partition", [], `Shell sort with Sedgewick gap ${gap}`);

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      if (temp === undefined) continue;

      let j = i;
      while (j >= gap) {
        const val = arr[j - gap];
        if (val === undefined) break;

        tracker.recordCompare([j, j - gap], `Comparing ${j} and ${j - gap}`);
        if (comparator(val, temp) > 0) {
          tracker.recordSwap([j, j - gap], `Swapping ${j} and ${j - gap}`);
          arr[j] = val;
          j -= gap;
        } else {
          break;
        }
      }

      arr[j] = temp;
      tracker.updateArray(arr);
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
    algorithm: "shell-sort-sedgewick",
  };
}

/**
 * Get complexity analysis for Shell Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n log n)",
    average: "O(n^1.5)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: true,
  };
}
