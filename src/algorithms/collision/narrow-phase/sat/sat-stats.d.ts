/**
 * SAT Statistics and Events
 *
 * Statistics tracking and event handling for the Separating Axis Theorem.
 * Handles performance metrics, event emission, and statistics collection.
 *
 * @module algorithms/geometry/collision/sat
 */
import type { SATStats, SATCollisionResult, SATEventType, SATEventHandler, SATPerformanceMetrics } from "./sat-types";
/**
 * Statistics manager for SAT algorithm
 */
export declare class SATStatsManager {
    private stats;
    private eventHandlers;
    private enableStats;
    private enableDebug;
    /**
     *
     * @param enableStats
     * @param enableDebug
     * @example
     */
    constructor(enableStats?: boolean, enableDebug?: boolean);
    /**
     * Update statistics with a collision test result
     *
     * @param result Collision test result
     * @param executionTime Execution time in milliseconds
     * @example
     */
    updateStats(result: SATCollisionResult, executionTime: number): void;
    /**
     * Update cache hit rate
     *
     * @param isHit Whether the cache hit
     * @example
     */
    updateCacheHitRate(isHit: boolean): void;
    /**
     * Update memory usage estimate
     *
     * @param memoryUsage Memory usage in bytes
     * @example
     */
    updateMemoryUsage(memoryUsage: number): void;
    /**
     * Get current statistics
     *
     * @returns Current statistics
     * @example
     */
    getStats(): SATStats;
    /**
     * Get performance metrics
     *
     * @returns Performance metrics
     * @example
     */
    getPerformanceMetrics(): SATPerformanceMetrics;
    /**
     * Reset statistics
     * @example
     */
    resetStats(): void;
    /**
     * Add event handler
     *
     * @param handler Event handler function
     * @example
     */
    addEventHandler(handler: SATEventHandler): void;
    /**
     * Remove event handler
     *
     * @param handler Event handler function
     * @example
     */
    removeEventHandler(handler: SATEventHandler): void;
    /**
     * Emit event to registered handlers
     *
     * @param type Event type
     * @param data Event data
     * @example
     */
    emitEvent(type: SATEventType, data?: any): void;
    /**
     * Enable or disable statistics collection
     *
     * @param enabled Whether to enable statistics
     * @example
     */
    setStatsEnabled(enabled: boolean): void;
    /**
     * Enable or disable debug mode
     *
     * @param enabled Whether to enable debug mode
     * @example
     */
    setDebugEnabled(enabled: boolean): void;
    /**
     * Get cache hit rate
     *
     * @returns Cache hit rate (0-1)
     * @example
     */
    getCacheHitRate(): number;
    /**
     * Get collision rate
     *
     * @returns Collision rate (0-1)
     * @example
     */
    getCollisionRate(): number;
    /**
     * Get average execution time
     *
     * @returns Average execution time in milliseconds
     * @example
     */
    getAverageExecutionTime(): number;
    /**
     * Get total number of tests performed
     *
     * @returns Total number of tests
     * @example
     */
    getTotalTests(): number;
    /**
     * Get number of collisions detected
     *
     * @returns Number of collisions detected
     * @example
     */
    getCollisionsDetected(): number;
}
//# sourceMappingURL=sat-stats.d.ts.map