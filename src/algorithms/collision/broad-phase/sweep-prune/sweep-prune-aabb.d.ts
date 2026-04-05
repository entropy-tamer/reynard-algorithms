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
 * @param aabb
 * @param manager
 * @example
 */
export declare function addAABB(aabb: AABB, manager: AABBManager): void;
/**
 * Remove an AABB from the collision detection system
 * @param aabbId
 * @param manager
 * @example
 */
export declare function removeAABB(aabbId: string | number, manager: AABBManager): void;
/**
 * Update an existing AABB
 * @param aabb
 * @param manager
 * @example
 */
export declare function updateAABB(aabb: AABB, manager: AABBManager): void;
//# sourceMappingURL=sweep-prune-aabb.d.ts.map