/**
 * @file Quick Sort implementation
 * Efficient divide-and-conquer algorithm with average O(n log n) complexity
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Quick Sort algorithm
 * Picks a pivot, partitions array around pivot, then recursively sorts partitions
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function quickSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Three-way partition (Bentley-McIlroy) for handling duplicates
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function quickSort3Way<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Quick Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=quick-sort.d.ts.map