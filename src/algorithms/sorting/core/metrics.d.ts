/**
 * @file Metrics calculation for sorting algorithms
 * Implements inversion count, Lyapunov values, and other mathematical metrics
 */
import type { Comparator, SortingMetrics, SortingState } from "./types";
/**
 * Calculate the inversion count of an array
 * An inversion is a pair (i, j) where i < j and array[i] > array[j]
 *
 * Uses a modified merge sort approach for O(n log n) complexity
 *
 * @param array - Array to count inversions in
 * @param comparator - Comparison function
 * @returns Number of inversions
 * @example
 */
export declare function calculateInversionCount<T>(array: T[], comparator: Comparator<T>): number;
/**
 * Calculate Lyapunov value for stochastic Lyapunov condition
 *
 * The stochastic Lyapunov condition for sorting is:
 * E[Inv(σ_{t+1}) | σ_t] < Inv(σ_t)
 *
 * This function calculates the expected reduction in inversion count
 *
 * @param prevInvCount - Previous inversion count
 * @param currentInvCount - Current inversion count
 * @param arrayLength - Length of the array
 * @returns Lyapunov value (negative means convergence)
 * @example
 */
export declare function calculateLyapunovValue(prevInvCount: number, currentInvCount: number, arrayLength: number): number;
/**
 * Calculate the expected inversion count reduction
 *
 * @param currentInvCount - Current inversion count
 * @param arrayLength - Length of the array
 * @returns Expected reduction
 * @example
 */
export declare function calculateExpectedReduction(currentInvCount: number, arrayLength: number): number;
/**
 * Track metrics across multiple sorting states
 *
 * @param states - Array of sorting states
 * @returns Aggregated metrics
 * @example
 */
export declare function trackMetrics<T>(states: SortingState<T>[]): SortingMetrics;
/**
 * Calculate convergence rate
 *
 * @param inversionCounts - Array of inversion counts over time
 * @returns Convergence rate (inversions per step)
 * @example
 */
export declare function calculateConvergenceRate(inversionCounts: number[]): number;
/**
 * Check if stochastic Lyapunov condition is satisfied
 *
 * @param lyapunovValues - Array of Lyapunov values
 * @returns Whether condition is satisfied (all negative or zero)
 * @example
 */
export declare function satisfiesLyapunovCondition(lyapunovValues: number[]): boolean;
//# sourceMappingURL=metrics.d.ts.map