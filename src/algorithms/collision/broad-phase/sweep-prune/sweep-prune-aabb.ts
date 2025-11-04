/**
 * AABB management utilities for Sweep and Prune algorithm
 *
 * Provides utilities for managing AABB lifecycle operations.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-aabb
 */

import type { AABB, SweepPruneConfig } from "./sweep-prune-types";
import { SweepPruneEventType } from "./sweep-prune-types";

export interface AABBManager {
  aabbs: Map<string | number, AABB>;
  config: SweepPruneConfig;
  emitEvent: (type: SweepPruneEventType, data?: unknown) => void;
  performIncrementalUpdate: (aabb: AABB, updateType: "add" | "remove" | "update", previousAABB?: AABB) => void;
}

/**
 * Add an AABB to the collision detection system
 */
export function addAABB(aabb: AABB, manager: AABBManager): void {
  manager.aabbs.set(aabb.id, aabb);
  manager.emitEvent(SweepPruneEventType.AABB_ADDED, { aabb });
  if (manager.config.enableIncrementalUpdates) {
    manager.performIncrementalUpdate(aabb, "add");
  }
}

/**
 * Remove an AABB from the collision detection system
 */
export function removeAABB(aabbId: string | number, manager: AABBManager): void {
  const aabb = manager.aabbs.get(aabbId);
  if (aabb) {
    manager.aabbs.delete(aabbId);
    manager.emitEvent(SweepPruneEventType.AABB_REMOVED, { aabb });
    if (manager.config.enableIncrementalUpdates) {
      manager.performIncrementalUpdate(aabb, "remove");
    }
  }
}

/**
 * Update an existing AABB
 */
export function updateAABB(aabb: AABB, manager: AABBManager): void {
  const existingAABB = manager.aabbs.get(aabb.id);
  if (existingAABB) {
    manager.aabbs.set(aabb.id, aabb);
    manager.emitEvent(SweepPruneEventType.AABB_UPDATED, { aabb, previousAABB: existingAABB });
    if (manager.config.enableIncrementalUpdates) {
      manager.performIncrementalUpdate(aabb, "update", existingAABB);
    }
  }
}

