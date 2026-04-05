/**
 * Detection logic for Sweep and Prune algorithm
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-detection
 */
import type { AABB, CollisionPair, SweepPruneResult } from "./sweep-prune-types";
import { SweepPruneEventType } from "./sweep-prune-types";
import { type SweepPruneContext } from "./sweep-prune-algorithms";
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
 *
 * @param aabbs
 * @param manager
 * @example
 */
export declare function detectCollisions(aabbs: AABB[] | undefined, manager: DetectionManager): SweepPruneResult;
//# sourceMappingURL=sweep-prune-detection.d.ts.map