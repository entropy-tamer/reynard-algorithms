/**
 * @file Smooth Sort implementation
 * Adaptive variant of heap sort using Leonardo heap structure
 * O(n log n) worst case, O(n) best case for sorted data
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Smooth Sort algorithm
 * Adaptive heap sort using Leonardo heaps
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function smoothSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Smooth Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=smooth-sort.d.ts.map