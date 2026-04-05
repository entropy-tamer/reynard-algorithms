/**
 * Octree Utility Functions
 *
 * Common utility functions for the Octree data structure including
 * node creation, statistics calculation, and helper operations.
 *
 * @module algorithms/spatial-structures/octree
 */
import type { Point3D, Bounds3D, OctreeNode, OctreeStats, OctreePerformanceMetrics } from "./octree-types";
/**
 * Create a new octree node
 *
 * @param bounds Bounds for the node
 * @param depth Depth of the node
 * @param parent Parent node
 * @returns New octree node
 * @example
 */
export declare function createNode(bounds: Bounds3D, depth: number, parent: OctreeNode | null): OctreeNode;
/**
 * Calculate octree statistics
 *
 * @param root Root node of the octree
 * @param stats Statistics object to update
 * @example
 */
export declare function calculateStats(root: OctreeNode | null, stats: OctreeStats): void;
/**
 * Calculate performance metrics
 *
 * @param stats Statistics object
 * @returns Performance metrics
 * @example
 */
export declare function calculatePerformanceMetrics(stats: OctreeStats): OctreePerformanceMetrics;
/**
 * Check if octree is empty
 *
 * @param root Root node of the octree
 * @returns True if octree is empty
 * @example
 */
export declare function isEmpty(root: OctreeNode | null): boolean;
/**
 * Get total number of points in octree
 *
 * @param root Root node of the octree
 * @returns Total number of points
 * @example
 */
export declare function getTotalPoints(root: OctreeNode | null): number;
/**
 * Clear all points from octree
 *
 * @param root Root node of the octree
 * @example
 */
export declare function clearOctree(root: OctreeNode | null): void;
/**
 * Get octant index for a point
 *
 * @param point Point
 * @param bounds Bounds
 * @returns Octant index (0-7)
 * @example
 */
export declare function getOctant(point: Point3D, bounds: Bounds3D): number;
/**
 * Check if a point is valid
 *
 * @param point Point to validate
 * @returns True if point is valid
 * @example
 */
export declare function isValidPoint(point: Point3D): boolean;
/**
 * Check if a point is within bounds
 *
 * @param point Point to check
 * @param bounds Bounds to check against
 * @returns True if point is within bounds
 * @example
 */
export declare function pointInBounds(point: Point3D, bounds: Bounds3D): boolean;
/**
 * Calculate bounds volume
 *
 * @param bounds Bounds
 * @returns Volume of the bounds
 * @example
 */
export declare function calculateBoundsVolume(bounds: Bounds3D): number;
/**
 * Check if bounds are valid
 *
 * @param bounds Bounds to check
 * @returns True if bounds are valid
 * @example
 */
export declare function isValidBounds(bounds: Bounds3D): boolean;
//# sourceMappingURL=octree-utils.d.ts.map