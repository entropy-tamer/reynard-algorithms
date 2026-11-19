/**
 * Detection logic for Sweep and Prune algorithm
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-detection
 */

import type { AABB, CollisionPair, SweepPruneResult } from "./sweep-prune-types";
import { SweepPruneEventType } from "./sweep-prune-types";
import { performSweepPrune, type SweepPruneContext } from "./sweep-prune-algorithms";
import { getCacheKey, cacheResult } from "./sweep-prune-cache";
import { updateStats } from "./sweep-prune-stats";
import type { SweepPruneCacheEntry, SweepPruneStats } from "./sweep-prune-types";

export interface DetectionManager {
  enableCaching: boolean;
  enableStats: boolean;
  cacheSize: number;
  cache: Map<string, SweepPruneCacheEntry>;
  stats: SweepPruneStats;
  aabbs: Map<string | number, AABB>;
  activeCollisionPairs: Map<string, CollisionPair>;
  createContext: () => SweepPruneContext;
  emitEvent: (type: SweepPruneEventType, data?: unknown) => void;
}

/**
 * Runs broad-phase collision detection over a set of AABBs and reports the candidate pairs.
 * A cache hit short-circuits the sweep; otherwise the sweep runs, its result is cached when
 * enabled, statistics are updated, and start/completion events are emitted.
 *
 * @param aabbs Boxes to test, or undefined to use every box registered with the manager.
 * @param manager Detection state holding cache, stats, box map, and event emitter.
 * @returns Sweep-prune result with collision pairs and run statistics.
 * Complexity: see `sweep-prune` in ~/src/foxtools/registry/algorithms/ (verified: O(n log n + k) time for n objects and k collision pairs, O(n) space).
 */
export function detectCollisions(aabbs: AABB[] | undefined, manager: DetectionManager): SweepPruneResult {
  const startTime = performance.now();
  const testAABBs = aabbs || Array.from(manager.aabbs.values());
  manager.emitEvent(SweepPruneEventType.COLLISION_DETECTION_STARTED, { aabbCount: testAABBs.length });

  try {
    const cached = checkCache(testAABBs, startTime, manager);
    if (cached) return cached;

    const context = manager.createContext();
    const result = performSweepPrune(testAABBs, context);
    result.executionTime = performance.now() - startTime;

    if (manager.enableCaching) {
      cacheResult(getCacheKey(testAABBs), result.collisionPairs, manager.cache, manager.cacheSize);
    }

    updateStats(
      result.collisionPairs,
      result.executionTime,
      testAABBs.length,
      manager.stats,
      manager.enableStats,
      manager.cache,
      manager.aabbs,
      manager.activeCollisionPairs
    );
    manager.emitEvent(SweepPruneEventType.COLLISION_DETECTION_COMPLETED, result);
    return result;
  } catch {
    return handleDetectionError(startTime, manager);
  }
}

/**
 * Looks up a previously cached result for the given box set.
 * On a hit the entry's access count is incremented, stats are refreshed, a completion
 * event is emitted, and a result with zeroed timing is returned; a miss returns null.
 *
 * @param testAABBs Boxes whose cache key is looked up.
 * @param _startTime Reserved for timing symmetry with the caller.
 * @param manager Detection state holding the cache and event emitter.
 * @returns A cached result on a hit, or null when caching is disabled or the key is absent.
 */
function checkCache(testAABBs: AABB[], _startTime: number, manager: DetectionManager): SweepPruneResult | null {
  const cacheKey = getCacheKey(testAABBs);
  if (!manager.enableCaching || !manager.cache.has(cacheKey)) return null;

  const cached = manager.cache.get(cacheKey)!;
  cached.accessCount++;
  const collisionPairs = [...cached.collisionPairs];
  const result: SweepPruneResult = {
    collisionPairs,
    totalAABBs: testAABBs.length,
    activeCollisions: collisionPairs.filter(pair => pair.active).length,
    executionTime: 0,
    endpointsProcessed: 0,
    axisSweeps: 0,
  };

  updateStats(
    collisionPairs,
    0,
    testAABBs.length,
    manager.stats,
    manager.enableStats,
    manager.cache,
    manager.aabbs,
    manager.activeCollisionPairs
  );
  manager.emitEvent(SweepPruneEventType.COLLISION_DETECTION_COMPLETED, result);
  return result;
}

/**
 * Produces an empty result for a failed detection run and records the failure.
 * Statistics are updated with zero boxes, a completion event is emitted, and elapsed
 * time is reported from the supplied start timestamp.
 *
 * @param startTime Timestamp at which detection began.
 * @param manager Detection state whose stats and events are updated.
 * @returns An empty SweepPruneResult marked by zero counts.
 */
function handleDetectionError(startTime: number, manager: DetectionManager): SweepPruneResult {
  const result: SweepPruneResult = {
    collisionPairs: [],
    totalAABBs: 0,
    activeCollisions: 0,
    executionTime: performance.now() - startTime,
    endpointsProcessed: 0,
    axisSweeps: 0,
  };
  updateStats(
    [],
    result.executionTime,
    0,
    manager.stats,
    manager.enableStats,
    manager.cache,
    manager.aabbs,
    manager.activeCollisionPairs
  );
  manager.emitEvent(SweepPruneEventType.COLLISION_DETECTION_COMPLETED, result);
  return result;
}
