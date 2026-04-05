/**
 * @file Merge Sort implementation
 * Divide-and-conquer algorithm with O(n log n) complexity
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Merge Sort algorithm
 * Divides array into halves, sorts each half, then merges them
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function mergeSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Merge Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=merge-sort.d.ts.map