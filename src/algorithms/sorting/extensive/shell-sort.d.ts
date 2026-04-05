/**
 * @file Shell Sort implementation
 * Generalization of insertion sort with gap sequences
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Ciura gap sequence (known good sequence)
 */
export declare const CIURA_GAPS: number[];
/**
 * Shell Sort algorithm
 * Uses gap sequences to perform insertion sort on subarrays
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function shellSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Shell Sort with Sedgewick gaps
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function shellSortSedgewick<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Shell Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=shell-sort.d.ts.map