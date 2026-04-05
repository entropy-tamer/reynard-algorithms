/**
 * @file Adaptive Quick Sort implementation
 * Detects presorted and partially sorted data for optimization
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Adaptive Quick Sort algorithm
 * Optimizes for presorted and nearly sorted data
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function adaptiveQuickSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Adaptive Quick Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=adaptive-quick-sort.d.ts.map