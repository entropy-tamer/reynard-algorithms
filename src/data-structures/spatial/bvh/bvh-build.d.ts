/**
 * BVH Build Operations
 *
 * Handles BVH construction, SAH (Surface Area Heuristic) splitting,
 * and tree building logic for the BVH data structure.
 *
 * @module algorithms/spatial-structures/bvh
 */
import type { BVHBuildConfig, BVHNode, BVHStats, Primitive } from "./bvh-types";
/**
 * Build BVH tree from primitives
 *
 * @param primitives Array of primitives
 * @param config Build configuration
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Build result
 * @example
 */
export declare function buildTree(primitives: Primitive[], config: Required<BVHBuildConfig>, stats: BVHStats, emitEvent: (type: any, data?: any) => void): BVHNode | null;
//# sourceMappingURL=bvh-build.d.ts.map