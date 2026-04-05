/**
 * @file Public Performance Monitor API
 * @description Performance monitoring and optimization for the algorithms package
 */
/**
 * Performance monitoring and optimization
 */
export declare class PerformanceMonitor {
    private adapter;
    /**
     * Creates a new performance monitor instance
     * @example
     * ```typescript
     * const monitor = new PerformanceMonitor();
     * ```
     */
    constructor();
    /**
     * Get current performance statistics
     * @returns Current performance statistics
     * @example
     * ```typescript
     * const stats = monitor.getPerformanceStats();
     * ```
     */
    getPerformanceStats(): import("../..").MarchingSquaresPerformanceStats;
    /**
     * Get memory pool statistics
     * @returns Memory pool statistics
     * @example
     * ```typescript
     * const poolStats = monitor.getMemoryPoolStats();
     * ```
     */
    getMemoryPoolStats(): import("../core/memory-pool").MemoryPoolStats;
    /**
     * Get optimization recommendations
     * @returns Optimization recommendations
     * @example
     * ```typescript
     * const recommendations = monitor.getOptimizationRecommendations();
     * ```
     */
    getOptimizationRecommendations(): import("../core/memory-pool").OptimizationRecommendation[];
    /**
     * Check if performance is degraded
     * @returns True if performance is degraded
     * @example
     * ```typescript
     * if (monitor.isPerformanceDegraded()) { /* handle *\/ }
     * ```
     */
    isPerformanceDegraded(): boolean;
    /**
     * Get comprehensive performance report
     * @returns Comprehensive performance report
     * @example
     * ```typescript
     * const report = monitor.getPerformanceReport();
     * ```
     */
    getPerformanceReport(): import("../adapters/performance-monitor").PerformanceReport;
    /**
     * Reset performance statistics
     * @example
     * ```typescript
     * monitor.resetStatistics();
     * ```
     */
    resetStatistics(): void;
}
//# sourceMappingURL=performance-monitor-public.d.ts.map