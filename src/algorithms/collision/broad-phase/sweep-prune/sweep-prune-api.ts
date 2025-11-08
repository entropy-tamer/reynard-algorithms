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

export function getStats(api: SweepPruneAPI): SweepPruneStats {
  return { ...api.stats };
}

export function getPerformanceMetricsFromAPI(api: SweepPruneAPI): SweepPrunePerformanceMetrics {
  return getPerformanceMetrics(api.stats, api.cache);
}

export function clearCache(api: SweepPruneAPI): void {
  api.cache.clear();
}

export function resetStatsAPI(api: SweepPruneAPI): void {
  api.stats = resetStats();
}

export function updateConfigAPI(newConfig: Partial<SweepPruneConfig>, api: SweepPruneAPI): void {
  api.config = { ...api.config, ...newConfig };
}

export function getAllAABBs(api: SweepPruneAPI): AABB[] {
  return Array.from(api.aabbs.values());
}

export function getActiveCollisionPairs(api: SweepPruneAPI): CollisionPair[] {
  return Array.from(api.activeCollisionPairs.values()).filter(pair => pair.active);
}

export function clearAll(api: SweepPruneAPI & { spatialCells: Map<string, any> }): void {
  api.aabbs.clear();
  api.activeCollisionPairs.clear();
  api.spatialCells.clear();
}

export function addEventHandler(handler: SweepPruneEventHandler, api: SweepPruneAPI): void {
  api.eventHandlers.push(handler);
}

export function removeEventHandler(handler: SweepPruneEventHandler, api: SweepPruneAPI): void {
  const index = api.eventHandlers.indexOf(handler);
  if (index > -1) {
    api.eventHandlers.splice(index, 1);
  }
}






