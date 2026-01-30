/**
 * @file Metrics calculation for sorting algorithms
 * Implements inversion count, Lyapunov values, and other mathematical metrics
 */

import type { Comparator, SortingMetrics, SortingState } from "./types";

/**
 * Calculate the inversion count of an array
 * An inversion is a pair (i, j) where i < j and array[i] > array[j]
 *
 * Uses a modified merge sort approach for O(n log n) complexity
 *
 * @param array - Array to count inversions in
 * @param comparator - Comparison function
 * @returns Number of inversions
 * @example
 */
export function calculateInversionCount<T>(array: T[], comparator: Comparator<T>): number {
  if (array.length <= 1) return 0;

  const temp = new Array<T>(array.length);
  return mergeSortCount(array, temp, 0, array.length - 1, comparator);
}

/**
 * Modified merge sort that counts inversions
 * @param array
 * @param temp
 * @param left
 * @param right
 * @param comparator
 * @example
 */
function mergeSortCount<T>(array: T[], temp: T[], left: number, right: number, comparator: Comparator<T>): number {
  let inversions = 0;

  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    inversions += mergeSortCount(array, temp, left, mid, comparator);
    inversions += mergeSortCount(array, temp, mid + 1, right, comparator);
    inversions += mergeAndCount(array, temp, left, mid, right, comparator);
  }

  return inversions;
}

/**
 * Merge two sorted halves and count inversions
 * @param array
 * @param temp
 * @param left
 * @param mid
 * @param right
 * @param comparator
 * @example
 */
function mergeAndCount<T>(
  array: T[],
  temp: T[],
  left: number,
  mid: number,
  right: number,
  comparator: Comparator<T>
): number {
  let inversions = 0;
  let i = left;
  let j = mid + 1;
  let k = left;

  while (i <= mid && j <= right) {
    if (comparator(array[i]!, array[j]!) <= 0) {
      temp[k++] = array[i++]!;
    } else {
      temp[k++] = array[j++]!;
      // All remaining elements in left half are inversions
      inversions += mid - i + 1;
    }
  }

  while (i <= mid) {
    temp[k++] = array[i++]!;
  }

  while (j <= right) {
    temp[k++] = array[j++]!;
  }

  for (i = left; i <= right; i++) {
    array[i] = temp[i]!;
  }

  return inversions;
}

/**
 * Calculate Lyapunov value for stochastic Lyapunov condition
 *
 * The stochastic Lyapunov condition for sorting is:
 * E[Inv(σ_{t+1}) | σ_t] < Inv(σ_t)
 *
 * This function calculates the expected reduction in inversion count
 *
 * @param prevInvCount - Previous inversion count
 * @param currentInvCount - Current inversion count
 * @param arrayLength - Length of the array
 * @returns Lyapunov value (negative means convergence)
 * @example
 */
export function calculateLyapunovValue(prevInvCount: number, currentInvCount: number, arrayLength: number): number {
  if (prevInvCount === 0) return 0;

  const reduction = prevInvCount - currentInvCount;
  const expectedReduction = prevInvCount / (arrayLength * Math.log2(arrayLength + 1));

  // Lyapunov value: actual reduction - expected reduction
  // Negative values indicate convergence
  return reduction - expectedReduction;
}

/**
 * Calculate the expected inversion count reduction
 *
 * @param currentInvCount - Current inversion count
 * @param arrayLength - Length of the array
 * @returns Expected reduction
 * @example
 */
export function calculateExpectedReduction(currentInvCount: number, arrayLength: number): number {
  if (currentInvCount === 0) return 0;

  // For most sorting algorithms, expected reduction is roughly
  // proportional to current inversion count divided by array size
  return currentInvCount / (arrayLength * Math.log2(arrayLength + 1));
}

/**
 * Track metrics across multiple sorting states
 *
 * @param states - Array of sorting states
 * @returns Aggregated metrics
 * @example
 */
export function trackMetrics<T>(states: SortingState<T>[]): SortingMetrics {
  if (states.length === 0) {
    return {
      comparisons: 0,
      swaps: 0,
      inversionCounts: [],
      lyapunovValues: [],
      executionTime: 0,
      spaceComplexity: 0,
    };
  }

  const lastState = states[states.length - 1];
  const inversionCounts = states.map(s => s.inversionCount);
  const lyapunovValues: number[] = [];

  const arrayLength = states[0]!.array.length;

  // Calculate Lyapunov values
  for (let i = 1; i < states.length; i++) {
    const prevInv = states[i - 1]!.inversionCount;
    const currInv = states[i]!.inversionCount;
    lyapunovValues.push(calculateLyapunovValue(prevInv, currInv, arrayLength));
  }

  const executionTime = lastState!.timestamp - states[0]!.timestamp;

  return {
    comparisons: lastState!.comparisons,
    swaps: lastState!.swaps,
    inversionCounts,
    lyapunovValues,
    executionTime,
    spaceComplexity: 0, // Will be calculated by individual algorithms
  };
}

/**
 * Calculate convergence rate
 *
 * @param inversionCounts - Array of inversion counts over time
 * @returns Convergence rate (inversions per step)
 * @example
 */
export function calculateConvergenceRate(inversionCounts: number[]): number {
  if (inversionCounts.length < 2) return 0;

  const totalReduction = inversionCounts[0]! - inversionCounts[inversionCounts.length - 1]!;
  return totalReduction / (inversionCounts.length - 1);
}

/**
 * Check if stochastic Lyapunov condition is satisfied
 *
 * @param lyapunovValues - Array of Lyapunov values
 * @returns Whether condition is satisfied (all negative or zero)
 * @example
 */
export function satisfiesLyapunovCondition(lyapunovValues: number[]): boolean {
  return lyapunovValues.every(v => v <= 0);
}
