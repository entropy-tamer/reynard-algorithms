/**
 * @file Counting Sort implementation
 * Integer sorting algorithm with O(n + k) complexity
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Counting Sort algorithm
 * Sorts integers by counting occurrences of each value
 * Only works for non-negative integers
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function countingSort(array: number[], comparator: Comparator<number>, config: SortingConfig): SortingResult<number>;
/**
 * Get complexity analysis for Counting Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=counting-sort.d.ts.map