/**
 * @file Tim Sort implementation
 * Hybrid stable sorting algorithm derived from merge sort and insertion sort
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Tim Sort algorithm
 * Hybrid of merge sort and insertion sort, optimized for real-world data
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function timSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Tim Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=tim-sort.d.ts.map