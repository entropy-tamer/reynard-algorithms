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
export class LRUCacheStatsManager<K> {
  private stats: LRUCacheStats;
  private performanceMetrics: LRUCachePerformanceMetrics;

  constructor(maxSize: number) {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      maxSize,
      hitRate: 0,
      averageAccessTime: 0,
    };

    this.performanceMetrics = {
      averageGetTime: 0,
      averageSetTime: 0,
      averageDeleteTime: 0,
      estimatedMemoryUsage: 0,
      cleanupCount: 0,
      totalCleanupTime: 0,
    };
  }

  /**
   * Gets current statistics
   */
  getStats(): LRUCacheStats {
    return { ...this.stats };
  }

  /**
   * Gets performance metrics
   */
  getPerformanceMetrics(): LRUCachePerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Increments hit count
   */
  recordHit(): void {
    this.stats.hits++;
    this.updateHitRate();
  }

  /**
   * Increments miss count
   */
  recordMiss(): void {
    this.stats.misses++;
    this.updateHitRate();
  }

  /**
   * Increments set count and size
   */
  recordSet(): void {
    this.stats.sets++;
    this.stats.size++;
  }

  /**
   * Increments delete count and decrements size
   */
  recordDelete(): void {
    this.stats.deletes++;
    this.stats.size--;
  }

  /**
   * Increments eviction count and decrements size
   */
  recordEviction(): void {
    this.stats.evictions++;
    this.stats.size--;
  }

  /**
   * Sets the current size
   */
  setSize(size: number): void {
    this.stats.size = size;
  }

  /**
   * Updates the hit rate statistic
   */
  updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Updates the most accessed key statistic
   *
   * @param key - The key that was accessed
   * @param accessCount - The access count for the key
   * @param getNodeAccessCount - Function to get access count for comparison
   */
  updateMostAccessedKey(key: K, accessCount: number, getNodeAccessCount: (key: K) => number | undefined): void {
    if (!this.stats.mostAccessedKey) {
      this.stats.mostAccessedKey = key;
      return;
    }

    const mostAccessedCount = getNodeAccessCount(this.stats.mostAccessedKey);
    if (!mostAccessedCount || accessCount > mostAccessedCount) {
      this.stats.mostAccessedKey = key;
    }
  }

  /**
   * Updates the average get time
   *
   * @param time - Time taken for the get operation
   */
  updateAverageGetTime(time: number): void {
    const totalGets = this.stats.hits + this.stats.misses;
    this.performanceMetrics.averageGetTime =
      (this.performanceMetrics.averageGetTime * (totalGets - 1) + time) / totalGets;
  }

  /**
   * Updates the average set time
   *
   * @param time - Time taken for the set operation
   */
  updateAverageSetTime(time: number): void {
    this.performanceMetrics.averageSetTime =
      (this.performanceMetrics.averageSetTime * (this.stats.sets - 1) + time) / this.stats.sets;
  }

  /**
   * Updates the average delete time
   *
   * @param time - Time taken for the delete operation
   */
  updateAverageDeleteTime(time: number): void {
    this.performanceMetrics.averageDeleteTime =
      (this.performanceMetrics.averageDeleteTime * (this.stats.deletes - 1) + time) / this.stats.deletes;
  }

  /**
   * Updates the estimated memory usage
   *
   * @param cacheSize - Function to calculate cache size
   */
  updateMemoryUsage(cacheSize: () => number): void {
    this.performanceMetrics.estimatedMemoryUsage = cacheSize();
  }

  /**
   * Records cleanup operation
   *
   * @param time - Time taken for cleanup
   */
  recordCleanup(time: number): void {
    this.performanceMetrics.cleanupCount++;
    this.performanceMetrics.totalCleanupTime += time;
  }

  /**
   * Gets current size
   */
  getSize(): number {
    return this.stats.size;
  }
}






