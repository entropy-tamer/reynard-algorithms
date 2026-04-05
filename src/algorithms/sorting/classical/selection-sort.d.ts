/**
 * @file Selection Sort implementation
 * Simple O(n²) algorithm that finds minimum and places it at the beginning
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Selection Sort algorithm
 * Repeatedly finds the minimum element from unsorted portion and places
 * it at the beginning.
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function selectionSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Selection Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=selection-sort.d.ts.map