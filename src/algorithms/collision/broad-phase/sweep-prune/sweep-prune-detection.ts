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
  } catch (error) {
    return handleDetectionError(startTime, manager);
  }
}

function checkCache(testAABBs: AABB[], startTime: number, manager: DetectionManager): SweepPruneResult | null {
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

