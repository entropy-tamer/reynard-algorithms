/**
 * @file Insertion Sort implementation
 * Efficient for small arrays and nearly sorted data
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Insertion Sort algorithm
 * Builds the sorted array one item at a time by inserting each element
 * into its correct position in the sorted portion.
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function insertionSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Binary Insertion Sort variant
 * Uses binary search to find insertion position
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function binaryInsertionSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Insertion Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=insertion-sort.d.ts.map