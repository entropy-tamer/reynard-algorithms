/**
 * Performance Benchmarking Utilities
 *
 * Benchmarking and measurement utilities for performance analysis.
 *
 * @module algorithms/performance/benchmark
 */
import type { PerformanceMetrics, PerformanceBudget } from "./types";
/**
 * Performance benchmark runner
 */
export declare class PerformanceBenchmark {
    private timer;
    private memoryMonitor;
    /**
     *
     * @param fn
     * @param iterations
     * @param budget
     * @example
     */
    run<T>(fn: () => T | Promise<T>, iterations?: number, budget?: PerformanceBudget): Promise<PerformanceMetrics>;
}
/**
 * Utility function to measure async operation performance
 * @param operation
 * @param name
 * @example
 */
export declare function measureAsync<T>(operation: () => Promise<T>, name?: string): Promise<{
    result: T;
    metrics: PerformanceMetrics;
}>;
/**
 * Utility function to measure sync operation performance
 * @param operation
 * @param name
 * @param iterations
 * @example
 */
export declare function measureSync<T>(operation: () => T, name?: string, iterations?: number): Promise<{
    result: T;
    metrics: PerformanceMetrics;
}>;
//# sourceMappingURL=benchmark.d.ts.map