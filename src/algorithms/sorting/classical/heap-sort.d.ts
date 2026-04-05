/**
 * @file Heap Sort implementation
 * Uses binary heap data structure for O(n log n) sorting
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Heap Sort algorithm
 * Builds a max heap, then repeatedly extracts the maximum element
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function heapSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Heap Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=heap-sort.d.ts.map