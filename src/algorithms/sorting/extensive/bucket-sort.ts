/**
 * @file Bucket Sort implementation
 * Distribution sort that works by distributing elements into buckets
 */

import { insertionSort } from "../classical/insertion-sort";
import { numericComparator } from "../core/comparators";
import { trackMetrics } from "../core/metrics";
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
import { StateTracker } from "../utils/state-tracker";

/**
 * Bucket Sort algorithm
 * Distributes elements into buckets, sorts each bucket, then concatenates
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export function bucketSort(
  array: number[],
  comparator: Comparator<number>,
  config: SortingConfig
): SortingResult<number> {
  const tracker = new StateTracker(array, comparator, config);
  const arr = [...array];
  const n = arr.length;

  if (n === 0) {
    return {
      sorted: arr,
      steps: [],
      metrics: trackMetrics([tracker.getCurrentState()]),
      timeComplexity: getComplexity(),
      algorithm: "bucket-sort",
    };
  }

  // Find min and max
  let min = arr[0] ?? 0;
  let max = arr[0] ?? 0;
  for (let i = 1; i < n; i++) {
    const val = arr[i];
    if (val !== undefined) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  // Create buckets
  const bucketCount = Math.floor(Math.sqrt(n));
  const bucketSize = (max - min + 1) / bucketCount;
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  // Distribute elements into buckets
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    if (val !== undefined) {
      const bucketIdx = Math.min(Math.floor((val - min) / bucketSize), bucketCount - 1);
      const bucket = buckets[bucketIdx];
      if (bucket) {
        bucket.push(val);
        tracker.recordOperation("distribute", [i, bucketIdx], `Distributing ${val} to bucket ${bucketIdx}`);
      }
    }
  }

  // Sort each bucket and concatenate
  const result: number[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bucket = buckets[i];
    if (bucket && bucket.length > 0) {
      tracker.recordOperation("gather", [i], `Sorting bucket ${i}`);
      const sortedBucket = insertionSort(bucket, numericComparator, {
        ...config,
        recordSteps: false, // Don't record steps for sub-sorts
      }).sorted;
      result.push(...sortedBucket);
    }
  }

  tracker.updateArray(result);

  const finalState = tracker.getCurrentState();
  const steps = tracker.getSteps();
  const metrics = trackMetrics([...steps.map(s => s.state), finalState]);

  return {
    sorted: result,
    steps,
    metrics,
    timeComplexity: getComplexity(),
    algorithm: "bucket-sort",
  };
}

/**
 * Get complexity analysis for Bucket Sort
 * @example
 */
export function getComplexity(): ComplexityAnalysis {
  return {
    best: "O(n + k)",
    average: "O(n + k)",
    worst: "O(n²)",
    space: "O(n)",
    stable: true,
    inPlace: false,
    adaptive: false,
  };
}
