/**
 * BVH (Bounding Volume Hierarchy) Data Structure
 *
 * A tree structure for organizing geometric objects with efficient
 * ray tracing and spatial queries using SAH (Surface Area Heuristic) splitting.
 *
 * @module algorithms/spatial-structures/bvh
 */

export { BVH } from "./bvh-core";
export type {
  AABB,
  Ray3D,
  Primitive,
  Triangle,
  BVHNode,
  BVHBuildConfig,
  BVHStats,
  BVHResult,
  RayIntersectionResult,
  AABBIntersectionResult,
  RayIntersectionOptions,
  AABBIntersectionOptions,
  BVHOptions,
  BVHEvent,
  BVHEventHandler,
  BVHPerformanceMetrics,
  BatchOperationResult,
  TraversalStack,
  SAHSplitCandidate,
  BVHSerialization,
} from "./bvh-types";
export { BVHEventType } from "./bvh-types";
export { DEFAULT_BVH_CONFIG, DEFAULT_BVH_OPTIONS } from "./bvh-types";
