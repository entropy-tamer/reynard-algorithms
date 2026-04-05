/**
 * AABB (Axis-Aligned Bounding Box) Module Index
 *
 * Central export point for all AABB collision detection functionality.
 * Provides a clean API for importing AABB operations.
 *
 * @module algorithms/aabb
 */
export type { AABB, CollisionResult, CollisionStats, AABBSpatialHashConfig } from "./aabb-types";
export { checkCollision } from "./aabb-collision";
export { pointInAABB, unionAABB, intersectionAABB, expandAABB, containsAABB, areAABBsTouching, } from "./aabb-operations";
export { getAABBArea, getAABBPerimeter } from "./aabb-utils";
export { batchCollisionDetection, batchCollisionWithSpatialHash } from "./aabb-batch-collision";
export { SpatialHash } from "../../../../data-structures/spatial/spatial-hash/spatial-hash-core";
//# sourceMappingURL=aabb-index.d.ts.map