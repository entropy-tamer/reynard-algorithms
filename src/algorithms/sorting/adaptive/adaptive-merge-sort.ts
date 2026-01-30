/**
 * @file Adaptive Merge Sort implementation
 * Input-sensitive complexity: O(n(1 + log(1 + Inv/n)))
 * Based on Petersson & Moffat, Adaptive Sorting, BRICS RS-04-27
 */

import { calculateInversionCount, trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Find natural runs in the array
 * @param arr
 * @param start
 * @param end
 * @param comparator
 * @example
 */
function findRuns<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T>
): Array<{ start: number; end: number; ascending: boolean }> {
  const runs: Array<{ start: number; end: number; ascending: boolean }> = [];
  let i = start;

  while (i < end) {
    const runStart = i;
    let ascending = true;

    // Determine if run is ascending or descending
    if (i < end - 1) {
      const val1 = arr[i];
      const val2 = arr[i + 1];
      if (val1 !== undefined && val2 !== undefined) {
        ascending = comparator(val1, val2) <= 0;
      }
    }

    // Extend the run
    while (i < end - 1) {
      const val1 = arr[i];
      const val2 = arr[i + 1];
      if (val1 === undefined || val2 === undefined) break;

      const cmp = comparator(val1, val2);
      if ((ascending && cmp > 0) || (!ascending && cmp < 0)) {
        break;
      }
      i++;
    }

    runs.push({ start: runStart, end: i + 1, ascending });
    i++;
  }

  return runs;
}

/**
 * Reverse a run if it's descending
 * @param arr
 * @param start
 * @param end
 * @example
 */
function reverseRun<T>(arr: T[], start: number, end: number): void {
  let left = start;
  let right = end - 1;
  while (left < right) {
    const temp = arr[left]!;
    arr[left] = arr[right]!;
    arr[right] = temp;
    left++;
    right--;
  }
}

/**
 * Merge two sorted runs
 * @param arr
 * @param leftStart
 * @param leftEnd
 * @param rightStart
 * @param rightEnd
 * @param comparator
 * @param tracker
 * @example
 */
function mergeRuns<T>(
  arr: T[],
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
  comparator: Comparator<T>,
  tracker: StateTracker<T>
): void {
  const leftArr: T[] = [];
  const rightArr: T[] = [];

  for (let i = leftStart; i < leftEnd; i++) {
    const val = arr[i];
    if (val !== undefined) leftArr.push(val);
  }
  for (let i = rightStart; i < rightEnd; i++) {
    const val = arr[i];
    if (val !== undefined) rightArr.push(val);
  }

  let i = 0;
  let j = 0;
  let k = leftStart;

  while (i < leftArr.length && j < rightArr.length) {
    const leftVal = leftArr[i];
    const rightVal = rightArr[j];
    if (leftVal === undefined || rightVal === undefined) break;

    tracker.recordCompare(
      [leftStart + i, rightStart + j],
      `Adaptive merge: comparing ${leftStart + i} and ${rightStart + j}`
    );

    if (comparator(leftVal, rightVal) <= 0) {
      arr[k] = leftVal;
      i++;
    } else {
      arr[k] = rightVal;
      j++;
    }
    k++;
  }

  while (i < leftArr.length) {
    const val = leftArr[i];
    if (val !== undefined) {
      arr[k] = val;
      i++;
      k++;
    } else {
      break;
    }
  }

  while (j < rightArr.length) {
    const val = rightArr[j];
    if (val !== undefined) {
      arr[k] = val;
      j++;
      k++;
    } else {
      break;
    }
  }

  tracker.recordMerge(
    [leftStart, rightEnd - 1],
    leftStart,
    leftEnd - 1,
    rightStart,
    rightEnd - 1,
    `Adaptive merge: merged runs from ${leftStart} to ${rightEnd - 1}`
  );
  tracker.updateArray(arr);
}

/**
 * Adaptive Merge Sort algorithm
 * O(n(1 + log(1 + Inv/n))) complexity where Inv is inversion count
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function adaptiveMergeSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  if (n <= 1) {
    return {
      sorted: arr,
      steps: [],
      metrics: trackMetrics([tracker.getCurrentState()]),
      timeComplexity: getComplexity(),
      algorithm: "adaptive-merge-sort",
    };
  }

  // Find natural runs
  const runs = findRuns(arr, 0, n, comparator);
  tracker.recordOperation("partition", [], `Found ${runs.length} natural runs`);

  // Reverse descending runs
  for (const run of runs) {
    if (!run.ascending) {
      reverseRun(arr, run.start, run.end);
      tracker.recordOperation(
        "swap",
        [run.start, run.end - 1],
        `Reversed descending run from ${run.start} to ${run.end - 1}`
      );
    }
  }

  // Merge runs adaptively
  let currentRuns = runs.map(run => ({ start: run.start, end: run.end }));
  while (currentRuns.length > 1) {
    const newRuns: Array<{ start: number; end: number }> = [];

    for (let i = 0; i < currentRuns.length - 1; i += 2) {
      const run1 = currentRuns[i];
      const run2 = currentRuns[i + 1];
      if (run1 && run2) {
        mergeRuns(arr, run1.start, run1.end, run2.start, run2.end, comparator, tracker);
        newRuns.push({ start: run1.start, end: run2.end });
      } else if (run1) {
        newRuns.push(run1);
      }
    }

    // Add last run if odd number
    if (currentRuns.length % 2 === 1) {
      const lastRun = currentRuns[currentRuns.length - 1];
      if (lastRun) {
        newRuns.push(lastRun);
      }
    }

    currentRuns = newRuns;
  }

  // Calculate final inversion count for metrics
  const finalInvCount = config.calculateMetrics ? calculateInversionCount([...arr], comparator) : 0;
  tracker.getCurrentState().inversionCount = finalInvCount;

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  // Add adaptive complexity metric
  if (config.calculateMetrics && metrics.inversionCounts.length > 0) {
    const initialInv = metrics.inversionCounts[0]!;
    const n = arr.length;
    const adaptiveComplexity = n * (1 + Math.log2(1 + initialInv / n));
    metrics.custom = {
      ...metrics.custom,
      adaptiveComplexity,
      initialInversionCount: initialInv,
    };
  }

  return {
    sorted: arr,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "adaptive-merge-sort",
  };
}

/**
 * Get complexity analysis for Adaptive Merge Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n)",
    average: "O(n(1 + log(1 + Inv/n)))",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
    adaptive: true,
  };
}
