/**
 * SAT Statistics and Events
 *
 * Statistics tracking and event handling for the Separating Axis Theorem.
 * Handles performance metrics, event emission, and statistics collection.
 *
 * @module algorithms/geometry/collision/sat
 */

import type {
  SATStats,
  SATCollisionResult,
  SATEvent,
  SATEventType,
  SATEventHandler,
  SATPerformanceMetrics,
} from "./sat-types";

/**
 * Statistics manager for SAT algorithm
 */
export class SATStatsManager {
  private stats: SATStats;
  private eventHandlers: SATEventHandler[];
  private enableStats: boolean;
  private enableDebug: boolean;

  /**
   *
   * @param enableStats
   * @param enableDebug
   * @example
   */
  constructor(enableStats: boolean = true, enableDebug: boolean = false) {
    this.enableStats = enableStats;
    this.enableDebug = enableDebug;
    this.eventHandlers = [];
    this.stats = {
      totalTests: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      collisionsDetected: 0,
      collisionRate: 0,
      averageAxesTested: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Update statistics with a collision test result
   *
   * @param result Collision test result
   * @param executionTime Execution time in milliseconds
   * @example
   */
  updateStats(result: SATCollisionResult, executionTime: number): void {
    if (!this.enableStats) return;

    result.executionTime = executionTime;
    result.success = true;

    this.stats.totalTests++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.totalTests;

    if (result.colliding) {
      this.stats.collisionsDetected++;
    }

    this.stats.collisionRate = this.stats.collisionsDetected / this.stats.totalTests;
    this.stats.averageAxesTested =
      (this.stats.averageAxesTested * (this.stats.totalTests - 1) + result.axesTested) / this.stats.totalTests;

    // Calculate cache hit rate
    const cacheHits = this.stats.totalTests * this.stats.cacheHitRate + (result.executionTime === 0 ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / this.stats.totalTests;
  }

  /**
   * Update cache hit rate
   *
   * @param isHit Whether the cache hit
   * @example
   */
  updateCacheHitRate(isHit: boolean): void {
    if (!this.enableStats) return;

    const cacheHits = this.stats.totalTests * this.stats.cacheHitRate + (isHit ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / (this.stats.totalTests + 1);
  }

  /**
   * Update memory usage estimate
   *
   * @param memoryUsage Memory usage in bytes
   * @example
   */
  updateMemoryUsage(memoryUsage: number): void {
    if (!this.enableStats) return;
    this.stats.memoryUsage = memoryUsage;
  }

  /**
   * Get current statistics
   *
   * @returns Current statistics
   * @example
   */
  getStats(): SATStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   *
   * @returns Performance metrics
   * @example
   */
  getPerformanceMetrics(): SATPerformanceMetrics {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        this.stats.collisionRate * 30 +
          this.stats.cacheHitRate * 40 +
          Math.max(0, 1 - this.stats.averageExecutionTime / 10) * 30
      )
    );

    return {
      memoryUsage: this.stats.memoryUsage,
      cacheSize: 0, // Will be set by cache manager
      cacheHitRate: this.stats.cacheHitRate,
      averageTestTime: this.stats.averageExecutionTime,
      performanceScore,
    };
  }

  /**
   * Reset statistics
   * @example
   */
  resetStats(): void {
    this.stats = {
      totalTests: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      collisionsDetected: 0,
      collisionRate: 0,
      averageAxesTested: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Add event handler
   *
   * @param handler Event handler function
   * @example
   */
  addEventHandler(handler: SATEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   *
   * @param handler Event handler function
   * @example
   */
  removeEventHandler(handler: SATEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Emit event to registered handlers
   *
   * @param type Event type
   * @param data Event data
   * @example
   */
  emitEvent(type: SATEventType, data?: any): void {
    if (!this.enableDebug) return;

    const event: SATEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in SAT event handler:", error);
      }
    }
  }

  /**
   * Enable or disable statistics collection
   *
   * @param enabled Whether to enable statistics
   * @example
   */
  setStatsEnabled(enabled: boolean): void {
    this.enableStats = enabled;
  }

  /**
   * Enable or disable debug mode
   *
   * @param enabled Whether to enable debug mode
   * @example
   */
  setDebugEnabled(enabled: boolean): void {
    this.enableDebug = enabled;
  }

  /**
   * Get cache hit rate
   *
   * @returns Cache hit rate (0-1)
   * @example
   */
  getCacheHitRate(): number {
    return this.stats.cacheHitRate;
  }

  /**
   * Get collision rate
   *
   * @returns Collision rate (0-1)
   * @example
   */
  getCollisionRate(): number {
    return this.stats.collisionRate;
  }

  /**
   * Get average execution time
   *
   * @returns Average execution time in milliseconds
   * @example
   */
  getAverageExecutionTime(): number {
    return this.stats.averageExecutionTime;
  }

  /**
   * Get total number of tests performed
   *
   * @returns Total number of tests
   * @example
   */
  getTotalTests(): number {
    return this.stats.totalTests;
  }

  /**
   * Get number of collisions detected
   *
   * @returns Number of collisions detected
   * @example
   */
  getCollisionsDetected(): number {
    return this.stats.collisionsDetected;
  }
}
