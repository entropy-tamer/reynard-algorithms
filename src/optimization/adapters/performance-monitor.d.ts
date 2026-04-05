/**
 * Performance Monitoring and Statistics
 *
 * Tracks collision detection performance metrics, maintains statistics,
 * and provides performance analysis and recommendations.
 *
 * @module algorithms/optimization/performanceMonitor
 */
import type { MemoryPoolStats, OptimizationRecommendation } from "../core/memory-pool";
export interface PerformanceRecord {
    timestamp: number;
    algorithm: string;
    objectCount: number;
    executionTime: number;
    memoryUsage: number;
    hitRate: number;
}
export interface CollisionPerformanceStats {
    totalQueries: number;
    averageExecutionTime: number;
    averageMemoryUsage: number;
    algorithmUsage: {
        naive: number;
        spatial: number;
        optimized: number;
    };
    memoryPoolStats: MemoryPoolStats;
    performanceHistory: PerformanceRecord[];
}
export interface PerformanceThresholds {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    minHitRate: number;
}
export interface PerformanceReport {
    summary: {
        totalQueries: number;
        averageExecutionTime: number;
        averageMemoryUsage: number;
        hitRate: number;
        isDegraded: boolean;
    };
    algorithmUsage: {
        naive: number;
        spatial: number;
        optimized: number;
    };
    memoryPool: MemoryPoolStats;
    recommendations: OptimizationRecommendation[];
}
/**
 * Performance monitoring and statistics manager
 */
export declare class PerformanceMonitor {
    private stats;
    private performanceHistory;
    private thresholds;
    /**
     *
     * @param thresholds
     * @example
     */
    constructor(thresholds: PerformanceThresholds);
    /**
     * Record a performance measurement
     * @param algorithm
     * @param objectCount
     * @param executionTime
     * @param memoryUsage
     * @param hitRate
     * @example
     */
    recordPerformance(algorithm: string, objectCount: number, executionTime: number, memoryUsage: number, hitRate: number): void;
    /**
     * Update memory pool statistics
     * @param stats
     * @example
     */
    updateMemoryPoolStats(stats: MemoryPoolStats): void;
    /**
     * Get current memory usage
     * @example
     */
    getCurrentMemoryUsage(): number;
    /**
     * Get performance statistics
     * @example
     */
    getPerformanceStats(): CollisionPerformanceStats;
    /**
     * Check if performance is degraded
     * @example
     */
    isPerformanceDegraded(): boolean;
    /**
     * Get performance report
     * @param recommendations
     * @example
     */
    getPerformanceReport(recommendations: OptimizationRecommendation[]): PerformanceReport;
    /**
     * Estimate update frequency based on recent queries
     * @example
     */
    estimateUpdateFrequency(): number;
    /**
     * Reset all statistics
     * @example
     */
    resetStatistics(): void;
    /**
     * Update running averages
     * @param executionTime
     * @param memoryUsage
     * @example
     */
    private updateRunningAverages;
    /**
     * Update algorithm usage statistics
     * @param algorithm
     * @example
     */
    private updateAlgorithmUsage;
}
//# sourceMappingURL=performance-monitor.d.ts.map