/**
 * @file Sweep and Prune Collision Detection Constants
 *
 * Default configurations, options, and common AABB shapes for testing.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */
import type { AABB } from "./sweep-prune-types-core";
import type { SweepPruneConfig, SweepPruneOptions } from "./sweep-prune-types-config";
/**
 * Default configuration for Sweep and Prune algorithm
 */
export declare const DEFAULT_SWEEP_PRUNE_CONFIG: SweepPruneConfig;
/**
 * Default options for Sweep and Prune algorithm
 */
export declare const DEFAULT_SWEEP_PRUNE_OPTIONS: SweepPruneOptions;
/**
 * Common AABB shapes for testing
 */
export declare const COMMON_AABBS: {
    /** Unit square at origin */
    UNIT_SQUARE: AABB;
    /** Unit square offset by (1, 1) */
    OFFSET_SQUARE: AABB;
    /** Large square covering multiple units */
    LARGE_SQUARE: AABB;
    /** Thin rectangle */
    THIN_RECTANGLE: AABB;
    /** Tall rectangle */
    TALL_RECTANGLE: AABB;
};
//# sourceMappingURL=sweep-prune-constants.d.ts.map