/**
 * @file Radix Sort implementation
 * Non-comparative integer sorting algorithm
 */
import type { Comparator, SortingConfig, SortingResult, ComplexityAnalysis } from "../core/types";
/**
 * Radix Sort algorithm (LSD - Least Significant Digit)
 * Sorts by processing digits from least to most significant
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function radixSort(array: number[], comparator: Comparator<number>, config: SortingConfig): SortingResult<number>;
/**
 * Get complexity analysis for Radix Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=radix-sort.d.ts.map