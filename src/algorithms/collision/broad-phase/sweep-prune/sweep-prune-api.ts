/**
 * Public API utilities for Sweep and Prune algorithm
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-api
 */

import type {
  AABB,
  CollisionPair,
  SweepPruneStats,
  SweepPrunePerformanceMetrics,
  SweepPruneConfig,
  SweepPruneEventHandler,
  SweepPruneCacheEntry,
} from "./sweep-prune-types";
import { getPerformanceMetrics, resetStats } from "./sweep-prune-stats";

export interface SweepPruneAPI {
  stats: SweepPruneStats;
  cache: Map<string, SweepPruneCacheEntry>;
  aabbs: Map<string | number, AABB>;
  activeCollisionPairs: Map<string, CollisionPair>;
  eventHandlers: SweepPruneEventHandler[];
  config: SweepPruneConfig;
}

/**
 * Returns a shallow copy of the API's current sweep-prune statistics.
 *
 * @param api Sweep-prune API state to read from.
 * @returns A detached copy of the stats object.
 */
export function getStats(api: SweepPruneAPI): SweepPruneStats {
  return { ...api.stats };
}

/**
 * Derives performance metrics from the API's statistics and cached entries.
 *
 * @param api Sweep-prune API state whose stats and cache are sampled.
 * @returns Aggregated performance metrics for the current state.
 */
export function getPerformanceMetricsFromAPI(api: SweepPruneAPI): SweepPrunePerformanceMetrics {
  return getPerformanceMetrics(api.stats, api.cache);
}

/**
 * Empties the API's broad-phase cache, dropping all cached query entries.
 *
 * @param api Sweep-prune API state whose cache is cleared.
 */
export function clearCache(api: SweepPruneAPI): void {
  api.cache.clear();
}

/**
 * Replaces the API's statistics with a freshly initialized, zeroed stats object.
 *
 * @param api Sweep-prune API state whose stats are reset.
 */
export function resetStatsAPI(api: SweepPruneAPI): void {
  api.stats = resetStats();
}

/**
 * Merges a partial configuration into the API's current configuration.
 * Existing values are kept unless overridden by a key in the supplied patch.
 *
 * @param newConfig Configuration fields to update.
 * @param api Sweep-prune API state whose config is replaced.
 */
export function updateConfigAPI(newConfig: Partial<SweepPruneConfig>, api: SweepPruneAPI): void {
  api.config = { ...api.config, ...newConfig };
}

/**
 * Collects all axis-aligned boxes currently registered with the API.
 *
 * @param api Sweep-prune API state whose box map is read.
 * @returns Array of every stored AABB, in map iteration order.
 */
export function getAllAABBs(api: SweepPruneAPI): AABB[] {
  return Array.from(api.aabbs.values());
}

/**
 * Collects the broad-phase pairs that are still flagged active.
 *
 * @param api Sweep-prune API state whose pair map is read.
 * @returns Only the collision pairs whose active flag is true.
 */
export function getActiveCollisionPairs(api: SweepPruneAPI): CollisionPair[] {
  return Array.from(api.activeCollisionPairs.values()).filter(pair => pair.active);
}

/**
 * Clears every container held by the API: boxes, active collision pairs, and spatial cells.
 *
 * @param api Sweep-prune API state plus the spatial-cell map to empty.
 */
export function clearAll(api: SweepPruneAPI & { spatialCells: Map<string, any> }): void {
  api.aabbs.clear();
  api.activeCollisionPairs.clear();
  api.spatialCells.clear();
}

/**
 * Appends an event handler to the API's handler list.
 *
 * @param handler Handler to register for sweep-prune events.
 * @param api Sweep-prune API state whose handler list is extended.
 */
export function addEventHandler(handler: SweepPruneEventHandler, api: SweepPruneAPI): void {
  api.eventHandlers.push(handler);
}

/**
 * Removes the first occurrence of an event handler from the API's handler list.
 * Does nothing when the handler is not registered.
 *
 * @param handler Handler to unregister.
 * @param api Sweep-prune API state whose handler list is modified.
 */
export function removeEventHandler(handler: SweepPruneEventHandler, api: SweepPruneAPI): void {
  const index = api.eventHandlers.indexOf(handler);
  if (index > -1) {
    api.eventHandlers.splice(index, 1);
  }
}
