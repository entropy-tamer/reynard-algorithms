/**
 * Public API utilities for Sweep and Prune algorithm
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-api
 */
import type { AABB, CollisionPair, SweepPruneStats, SweepPrunePerformanceMetrics, SweepPruneConfig, SweepPruneEventHandler, SweepPruneCacheEntry } from "./sweep-prune-types";
export interface SweepPruneAPI {
    stats: SweepPruneStats;
    cache: Map<string, SweepPruneCacheEntry>;
    aabbs: Map<string | number, AABB>;
    activeCollisionPairs: Map<string, CollisionPair>;
    eventHandlers: SweepPruneEventHandler[];
    config: SweepPruneConfig;
}
/**
 *
 * @param api
 * @example
 */
export declare function getStats(api: SweepPruneAPI): SweepPruneStats;
/**
 *
 * @param api
 * @example
 */
export declare function getPerformanceMetricsFromAPI(api: SweepPruneAPI): SweepPrunePerformanceMetrics;
/**
 *
 * @param api
 * @example
 */
export declare function clearCache(api: SweepPruneAPI): void;
/**
 *
 * @param api
 * @example
 */
export declare function resetStatsAPI(api: SweepPruneAPI): void;
/**
 *
 * @param newConfig
 * @param api
 * @example
 */
export declare function updateConfigAPI(newConfig: Partial<SweepPruneConfig>, api: SweepPruneAPI): void;
/**
 *
 * @param api
 * @example
 */
export declare function getAllAABBs(api: SweepPruneAPI): AABB[];
/**
 *
 * @param api
 * @example
 */
export declare function getActiveCollisionPairs(api: SweepPruneAPI): CollisionPair[];
/**
 *
 * @param api
 * @example
 */
export declare function clearAll(api: SweepPruneAPI & {
    spatialCells: Map<string, any>;
}): void;
/**
 *
 * @param handler
 * @param api
 * @example
 */
export declare function addEventHandler(handler: SweepPruneEventHandler, api: SweepPruneAPI): void;
/**
 *
 * @param handler
 * @param api
 * @example
 */
export declare function removeEventHandler(handler: SweepPruneEventHandler, api: SweepPruneAPI): void;
//# sourceMappingURL=sweep-prune-api.d.ts.map