/**
 * Sorting utilities for Sweep and Prune algorithm
 *
 * Provides efficient sorting algorithms for endpoint sorting, including
 * insertion sort for small arrays and quick sort for larger arrays.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-sorting
 */

import type { Endpoint, SweepPruneConfig } from "./sweep-prune-types";

/**
 * Sort endpoints using appropriate algorithm
 */
export function sortEndpoints(endpoints: Endpoint[], config: SweepPruneConfig): void {
  if (endpoints.length <= config.insertionSortThreshold && config.useInsertionSort) {
    insertionSort(endpoints, config);
  } else {
    quickSort(endpoints, config);
  }
}

/**
 * Insertion sort for small arrays
 */
export function insertionSort(endpoints: Endpoint[], config: SweepPruneConfig): void {
  for (let i = 1; i < endpoints.length; i++) {
    const key = endpoints[i];
    let j = i - 1;

    while (j >= 0 && compareEndpoints(endpoints[j], key, config) > 0) {
      endpoints[j + 1] = endpoints[j];
      j--;
    }

    endpoints[j + 1] = key;
  }
}

/**
 * Quick sort for larger arrays
 */
export function quickSort(endpoints: Endpoint[], config: SweepPruneConfig): void {
  quickSortRecursive(endpoints, 0, endpoints.length - 1, config);
}

/**
 * Recursive quick sort implementation
 */
function quickSortRecursive(endpoints: Endpoint[], low: number, high: number, config: SweepPruneConfig): void {
  if (low < high) {
    const pivotIndex = partition(endpoints, low, high, config);
    quickSortRecursive(endpoints, low, pivotIndex - 1, config);
    quickSortRecursive(endpoints, pivotIndex + 1, high, config);
  }
}

/**
 * Partition function for quick sort
 */
function partition(endpoints: Endpoint[], low: number, high: number, config: SweepPruneConfig): number {
  const pivot = endpoints[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (compareEndpoints(endpoints[j], pivot, config) <= 0) {
      i++;
      [endpoints[i], endpoints[j]] = [endpoints[j], endpoints[i]];
    }
  }

  [endpoints[i + 1], endpoints[high]] = [endpoints[high], endpoints[i + 1]];
  return i + 1;
}

/**
 * Compare two endpoints for sorting
 */
export function compareEndpoints(a: Endpoint, b: Endpoint, config: SweepPruneConfig): number {
  // Primary sort by value
  if (Math.abs(a.value - b.value) > config.epsilon) {
    return a.value - b.value;
  }

  // Secondary sort by start/end (start comes first)
  if (a.isStart !== b.isStart) {
    return a.isStart ? -1 : 1;
  }

  // Tertiary sort by AABB ID for stability
  return String(a.aabb.id).localeCompare(String(b.aabb.id));
}
