/**
 * @file Adaptive Merge Sort implementation
 * Input-sensitive complexity: O(n(1 + log(1 + Inv/n)))
 * Based on Petersson & Moffat, Adaptive Sorting, BRICS RS-04-27
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Adaptive Merge Sort algorithm
 * O(n(1 + log(1 + Inv/n))) complexity where Inv is inversion count
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function adaptiveMergeSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Adaptive Merge Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=adaptive-merge-sort.d.ts.map