/**
 * Octree Data Structure
 *
 * A 3D space-partitioning data structure for organizing points in 3D space.
 * Provides efficient 3D spatial queries, voxel operations, ray casting, and frustum culling.
 *
 * @module algorithms/spatial-structures/octree
 */

export { Octree } from "./octree-core";
export type {
  Point3D,
  Bounds3D,
  Sphere3D,
  Ray3D,
  Frustum3D,
  OctreeNode,
  OctreeConfig,
  OctreeStats,
  OctreeResult,
  SpatialQueryResult,
  RayIntersectionResult,
  FrustumCullingResult,
  SpatialQueryOptions,
  RayIntersectionOptions,
  FrustumCullingOptions,
  OctreeOptions,
  OctreeEvent,
  OctreeEventHandler,
  OctreePerformanceMetrics,
  BatchOperationResult,
  Voxel,
  VoxelGrid,
  OctreeSerialization,
} from "./octree-types";
export { Octant, OctreeEventType } from "./octree-types";
export { DEFAULT_OCTREE_CONFIG, DEFAULT_OCTREE_OPTIONS } from "./octree-types";



