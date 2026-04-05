/**
 * @file Intro Sort implementation
 * Hybrid sorting algorithm combining quick sort and heap sort
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Intro Sort algorithm
 * Uses quick sort, switches to heap sort if depth limit exceeded
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function introSort<T>(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
/**
 * Get complexity analysis for Intro Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=intro-sort.d.ts.map