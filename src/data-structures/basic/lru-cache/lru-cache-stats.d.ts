/**
 * LRU Cache Statistics Management
 *
 * Handles statistics tracking, metrics calculation, and performance monitoring.
 *
 * @module algorithms/dataStructures/lruCacheStats
 */
import { LRUCacheStats, LRUCachePerformanceMetrics } from "./lru-cache-types";
/**
 * Statistics manager for LRU cache
 */
export declare class LRUCacheStatsManager<K> {
    private stats;
    private performanceMetrics;
    /**
     *
     * @param maxSize
     * @example
     */
    constructor(maxSize: number);
    /**
     * Gets current statistics
     * @example
     */
    getStats(): LRUCacheStats;
    /**
     * Gets performance metrics
     * @example
     */
    getPerformanceMetrics(): LRUCachePerformanceMetrics;
    /**
     * Increments hit count
     * @example
     */
    recordHit(): void;
    /**
     * Increments miss count
     * @example
     */
    recordMiss(): void;
    /**
     * Increments set count and size
     * @example
     */
    recordSet(): void;
    /**
     * Increments delete count and decrements size
     * @example
     */
    recordDelete(): void;
    /**
     * Increments eviction count and decrements size
     * @example
     */
    recordEviction(): void;
    /**
     * Sets the current size
     * @param size
     * @example
     */
    setSize(size: number): void;
    /**
     * Updates the hit rate statistic
     * @example
     */
    updateHitRate(): void;
    /**
     * Updates the most accessed key statistic
     *
     * @param key - The key that was accessed
     * @param accessCount - The access count for the key
     * @param getNodeAccessCount - Function to get access count for comparison
     * @example
     */
    updateMostAccessedKey(key: K, accessCount: number, getNodeAccessCount: (key: K) => number | undefined): void;
    /**
     * Updates the average get time
     *
     * @param time - Time taken for the get operation
     * @example
     */
    updateAverageGetTime(time: number): void;
    /**
     * Updates the average set time
     *
     * @param time - Time taken for the set operation
     * @example
     */
    updateAverageSetTime(time: number): void;
    /**
     * Updates the average delete time
     *
     * @param time - Time taken for the delete operation
     * @example
     */
    updateAverageDeleteTime(time: number): void;
    /**
     * Updates the estimated memory usage
     *
     * @param cacheSize - Function to calculate cache size
     * @example
     */
    updateMemoryUsage(cacheSize: () => number): void;
    /**
     * Records cleanup operation
     *
     * @param time - Time taken for cleanup
     * @example
     */
    recordCleanup(time: number): void;
    /**
     * Gets current size
     * @example
     */
    getSize(): number;
}
//# sourceMappingURL=lru-cache-stats.d.ts.map