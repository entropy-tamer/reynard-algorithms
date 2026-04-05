/**
 * @file Bucket Sort implementation
 * Distribution sort that works by distributing elements into buckets
 */
import type { Comparator, ComplexityAnalysis, SortingConfig, SortingResult } from "../core/types";
/**
 * Bucket Sort algorithm
 * Distributes elements into buckets, sorts each bucket, then concatenates
 * @param array
 * @param comparator
 * @param config
 * @example
 */
export declare function bucketSort(array: number[], comparator: Comparator<number>, config: SortingConfig): SortingResult<number>;
/**
 * Get complexity analysis for Bucket Sort
 * @example
 */
export declare function getComplexity(): ComplexityAnalysis;
//# sourceMappingURL=bucket-sort.d.ts.map