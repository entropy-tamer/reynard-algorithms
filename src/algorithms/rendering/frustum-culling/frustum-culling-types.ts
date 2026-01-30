/**
 * @module algorithms/rendering/frustum-culling-types
 * @description Type definitions for Frustum Culling algorithm.
 */

import type { AABB3D, Sphere3D, Point3D } from "../../../core/types";

/**
 * Configuration options for Frustum Culling.
 */
export interface FrustumCullingConfig {
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-6
   */
  tolerance?: number;
  /**
   * Whether to use hierarchical culling optimization.
   * @default true
   */
  hierarchical?: boolean;
  /**
   * Whether to validate input.
   * @default true
   */
  validateInput?: boolean;
}

/**
 * Culling result for a single object.
 */
export interface CullingResult {
  /**
   * Whether the object is inside the frustum.
   */
  inside: boolean;
  /**
   * Whether the object intersects the frustum.
   */
  intersects: boolean;
  /**
   * Whether the object is completely outside the frustum.
   */
  outside: boolean;
}

/**
 * Statistics about the culling operation.
 */
export interface FrustumCullingStats {
  /**
   * Number of objects tested.
   */
  objectsTested: number;
  /**
   * Number of objects inside frustum.
   */
  objectsInside: number;
  /**
   * Number of objects intersecting frustum.
   */
  objectsIntersecting: number;
  /**
   * Number of objects outside frustum.
   */
  objectsOutside: number;
  /**
   * Execution time in milliseconds.
   */
  executionTime: number;
}

/**
 * Result of frustum culling operation.
 */
export interface FrustumCullingResult {
  /**
   * Array of culling results (one per object).
   */
  results: CullingResult[];
  /**
   * Indices of objects inside the frustum.
   */
  insideIndices: number[];
  /**
   * Indices of objects intersecting the frustum.
   */
  intersectingIndices: number[];
  /**
   * Indices of objects outside the frustum.
   */
  outsideIndices: number[];
  /**
   * Statistics about the operation.
   */
  stats: FrustumCullingStats;
}

/**
 * Options for frustum culling.
 */
export interface FrustumCullingOptions extends Partial<FrustumCullingConfig> {}

/**
 * Object to test against frustum (can be AABB, Sphere, or Point).
 */
export type CullableObject = AABB3D | Sphere3D | Point3D;

/**
 * Default configuration.
 */
export const DEFAULT_FRUSTUM_CULLING_CONFIG: Required<FrustumCullingConfig> = {
  tolerance: 1e-6,
  hierarchical: true,
  validateInput: true,
};
