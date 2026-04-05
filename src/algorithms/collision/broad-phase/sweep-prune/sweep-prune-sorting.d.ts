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
export declare function sortEndpoints(endpoints: Endpoint[], config: SweepPruneConfig): void;
/**
 * Insertion sort for small arrays
 * @param endpoints
 * @param config
 * @example
 */
export declare function insertionSort(endpoints: Endpoint[], config: SweepPruneConfig): void;
/**
 * Quick sort for larger arrays
 * @param endpoints
 * @param config
 * @example
 */
export declare function quickSort(endpoints: Endpoint[], config: SweepPruneConfig): void;
/**
 * Compare two endpoints for sorting
 * @param a
 * @param b
 * @param config
 * @example
 */
export declare function compareEndpoints(a: Endpoint, b: Endpoint, config: SweepPruneConfig): number;
//# sourceMappingURL=sweep-prune-sorting.d.ts.map