/**
 * Statistics management for Sweep and Prune algorithm
 *
 * Provides utilities for tracking and calculating performance statistics.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-stats
 */
import type { CollisionPair, SweepPruneStats, SweepPrunePerformanceMetrics, SweepPruneCacheEntry } from "./sweep-prune-types";
/**
 * Update statistics
 * @param collisionPairs
 * @param executionTime
 * @param aabbCount
 * @param stats
 * @param enableStats
 * @param cache
 * @param aabbs
 * @param activeCollisionPairs
 * @example
 */
export declare function updateStats(collisionPairs: CollisionPair[], executionTime: number, aabbCount: number, stats: SweepPruneStats, enableStats: boolean, cache: Map<string, SweepPruneCacheEntry>, aabbs: Map<string | number, any>, activeCollisionPairs: Map<string, CollisionPair>): void;
/**
 * Get performance metrics
 * @param stats
 * @param cache
 * @example
 */
export declare function getPerformanceMetrics(stats: SweepPruneStats, cache: Map<string, SweepPruneCacheEntry>): SweepPrunePerformanceMetrics;
/**
 * Reset statistics
 * @example
 */
export declare function resetStats(): SweepPruneStats;
//# sourceMappingURL=sweep-prune-stats.d.ts.map