/**
 * Statistics management for Sweep and Prune algorithm
 *
 * Provides utilities for tracking and calculating performance statistics.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-stats
 */

import type {
  CollisionPair,
  SweepPruneStats,
  SweepPrunePerformanceMetrics,
  SweepPruneCacheEntry,
} from "./sweep-prune-types";

/**
 * Update statistics
 */
export function updateStats(
  collisionPairs: CollisionPair[],
  executionTime: number,
  aabbCount: number,
  stats: SweepPruneStats,
  enableStats: boolean,
  cache: Map<string, SweepPruneCacheEntry>,
  aabbs: Map<string | number, any>,
  activeCollisionPairs: Map<string, CollisionPair>
): void {
  if (!enableStats) return;

  stats.totalOperations++;
  stats.totalExecutionTime += executionTime;
  stats.averageExecutionTime = stats.totalExecutionTime / stats.totalOperations;
  stats.totalAABBsProcessed += aabbCount;
  stats.averageAABBsPerOperation = stats.totalAABBsProcessed / stats.totalOperations;
  stats.totalCollisionPairs += collisionPairs.length;
  stats.averageCollisionPairsPerOperation = stats.totalCollisionPairs / stats.totalOperations;

  // Calculate cache hit rate
  const cacheHits = stats.totalOperations * stats.cacheHitRate + (executionTime === 0 ? 1 : 0);
  stats.cacheHitRate = cacheHits / stats.totalOperations;

  // Estimate memory usage
  stats.memoryUsage = (cache.size + aabbs.size + activeCollisionPairs.size) * 100;
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(stats: SweepPruneStats, cache: Map<string, SweepPruneCacheEntry>): SweepPrunePerformanceMetrics {
  const efficiencyRatio =
    stats.totalAABBsProcessed > 0 ? stats.totalCollisionPairs / stats.totalAABBsProcessed : 0;

  const performanceScore = Math.min(
    100,
    Math.max(
      0,
      stats.cacheHitRate * 30 +
        Math.max(0, 1 - stats.averageExecutionTime / 100) * 40 +
        Math.min(1, efficiencyRatio) * 30
    )
  );

  return {
    memoryUsage: stats.memoryUsage,
    cacheSize: cache.size,
    cacheHitRate: stats.cacheHitRate,
    averageDetectionTime: stats.averageExecutionTime,
    performanceScore,
    efficiencyRatio,
  };
}

/**
 * Reset statistics
 */
export function resetStats(): SweepPruneStats {
  return {
    totalOperations: 0,
    totalExecutionTime: 0,
    averageExecutionTime: 0,
    totalAABBsProcessed: 0,
    averageAABBsPerOperation: 0,
    totalCollisionPairs: 0,
    averageCollisionPairsPerOperation: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
  };
}



