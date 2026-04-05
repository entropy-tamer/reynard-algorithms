/**
 * @file Bubble Sort implementation
 * Classic O(n²) sorting algorithm with early termination optimization
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Bubble Sort algorithm
 * Repeatedly steps through the list, compares adjacent elements and swaps them
 * if they are in the wrong order. The pass through the list is repeated until
 * the list is sorted.
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function bubbleSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Bubble Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=bubble-sort.d.ts.map