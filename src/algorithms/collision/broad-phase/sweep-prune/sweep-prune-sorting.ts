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
 * @param endpoints
 * @param config
 * @example
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
 * @param endpoints
 * @param config
 * @example
 */
export function insertionSort(endpoints: Endpoint[], config: SweepPruneConfig): void {
  for (let i = 1; i < endpoints.length; i++) {
    const key = endpoints[i];
    if (!key) continue;
    let j = i - 1;

    while (j >= 0) {
      const current = endpoints[j];
      if (!current) break;
      if (compareEndpoints(current, key, config) > 0) {
        endpoints[j + 1] = current;
        j--;
      } else {
        break;
      }
    }

    const insertPos = j + 1;
    endpoints[insertPos] = key;
  }
}

/**
 * Quick sort for larger arrays
 * @param endpoints
 * @param config
 * @example
 */
export function quickSort(endpoints: Endpoint[], config: SweepPruneConfig): void {
  quickSortRecursive(endpoints, 0, endpoints.length - 1, config);
}

/**
 * Recursive quick sort implementation
 * @param endpoints
 * @param low
 * @param high
 * @param config
 * @example
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
 * @param endpoints
 * @param low
 * @param high
 * @param config
 * @example
 */
function partition(endpoints: Endpoint[], low: number, high: number, config: SweepPruneConfig): number {
  const pivot = endpoints[high];
  if (!pivot) return low;
  let i = low - 1;

  for (let j = low; j < high; j++) {
    const current = endpoints[j];
    if (!current) continue;
    if (compareEndpoints(current, pivot, config) <= 0) {
      i++;
      const swapTarget = endpoints[i];
      if (swapTarget) {
        [endpoints[i], endpoints[j]] = [current, swapTarget];
      }
    }
  }

  const finalPos = i + 1;
  const finalTarget = endpoints[finalPos];
  const highTarget = endpoints[high];
  if (finalTarget && highTarget) {
    [endpoints[finalPos], endpoints[high]] = [highTarget, finalTarget];
  }
  return finalPos;
}

/**
 * Compare two endpoints for sorting
 * @param a
 * @param b
 * @param config
 * @example
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
