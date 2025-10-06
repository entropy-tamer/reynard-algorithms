/**
 * AABB (Axis-Aligned Bounding Box) Types and Interfaces
 *
 * Core type definitions for AABB collision detection system.
 * Provides type-safe interfaces for all AABB operations.
 *
 * @module algorithms/aabbTypes
 */

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionResult {
  colliding: boolean;
  overlap: AABB | null;
  overlapArea: number;
  distance: number;
}

export interface CollisionPair {
  a: number;
  b: number;
  result: CollisionResult;
}

export interface CollisionStats {
  totalChecks: number;
  collisionsFound: number;
  averageCheckTime: number;
  spatialHashHits: number;
  spatialHashMisses: number;
}

export interface AABBSpatialHashConfig {
  cellSize: number;
  maxObjectsPerCell: number;
  enableOptimization: boolean;
}
