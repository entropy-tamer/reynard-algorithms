/**
 * Octree Utility Functions
 *
 * Common utility functions for the Octree data structure including
 * node creation, statistics calculation, and helper operations.
 *
 * @module algorithms/spatial-structures/octree
 */

import type {
  Point3D,
  Bounds3D,
  OctreeNode,
  OctreeConfig,
  OctreeStats,
  OctreePerformanceMetrics,
} from "./octree-types";

/**
 * Create a new octree node
 *
 * @param bounds Bounds for the node
 * @param depth Depth of the node
 * @param parent Parent node
 * @returns New octree node
 */
export function createNode(bounds: Bounds3D, depth: number, parent: OctreeNode | null): OctreeNode {
  return {
    bounds,
    depth,
    parent,
    isLeaf: true,
    points: [],
    children: new Array(8).fill(null),
    lod: 0,
  };
}

/**
 * Calculate octree statistics
 *
 * @param root Root node of the octree
 * @param stats Statistics object to update
 */
export function calculateStats(root: OctreeNode | null, stats: OctreeStats): void {
  if (!root) {
    stats.nodeCount = 0;
    stats.leafCount = 0;
    stats.height = 0;
    stats.averageDepth = 0;
    stats.maxDepth = 0;
    return;
  }

  let nodeCount = 0;
  let leafCount = 0;
  let totalDepth = 0;
  let maxDepth = 0;

  function traverse(node: OctreeNode, depth: number): void {
    nodeCount++;
    totalDepth += depth;
    maxDepth = Math.max(maxDepth, depth);

    if (node.isLeaf) {
      leafCount++;
    } else {
      for (const child of node.children) {
        if (child) {
          traverse(child, depth + 1);
        }
      }
    }
  }

  traverse(root, 0);

  stats.nodeCount = nodeCount;
  stats.leafCount = leafCount;
  stats.height = maxDepth;
  stats.averageDepth = nodeCount > 0 ? totalDepth / nodeCount : 0;
  stats.maxDepth = maxDepth;
}

/**
 * Calculate performance metrics
 *
 * @param stats Statistics object
 * @returns Performance metrics
 */
export function calculatePerformanceMetrics(stats: OctreeStats): OctreePerformanceMetrics {
  const averageQueryTime = stats.averageQueryTime;
  const averageInsertionTime = stats.averageInsertionTime;
  const averageRemovalTime = stats.averageRemovalTime;
  const performanceScore = Math.min(100, Math.max(0, 100 - averageQueryTime * 10));
  const balanceRatio = stats.nodeCount > 0 ? Math.min(1, stats.leafCount / stats.nodeCount) : 0;
  const queryEfficiency = averageQueryTime > 0 ? 1 / (1 + averageQueryTime) : 1;
  const lodEfficiency = 1;

  return {
    memoryUsage: stats.memoryUsage,
    averageQueryTime,
    averageInsertionTime,
    averageRemovalTime,
    performanceScore,
    balanceRatio,
    queryEfficiency,
    lodEfficiency,
  };
}

/**
 * Check if octree is empty
 *
 * @param root Root node of the octree
 * @returns True if octree is empty
 */
export function isEmpty(root: OctreeNode | null): boolean {
  return !root || (root.isLeaf && root.points.length === 0);
}

/**
 * Get total number of points in octree
 *
 * @param root Root node of the octree
 * @returns Total number of points
 */
export function getTotalPoints(root: OctreeNode | null): number {
  if (!root) return 0;

  let total = 0;
  function countPoints(node: OctreeNode): void {
    if (node.isLeaf) {
      total += node.points.length;
    } else {
      for (const child of node.children) {
        if (child) {
          countPoints(child);
        }
      }
    }
  }

  countPoints(root);
  return total;
}

/**
 * Clear all points from octree
 *
 * @param root Root node of the octree
 */
export function clearOctree(root: OctreeNode | null): void {
  if (!root) return;

  function clearNode(node: OctreeNode): void {
    node.points = [];
    if (!node.isLeaf) {
      for (let i = 0; i < 8; i++) {
        if (node.children[i]) {
          clearNode(node.children[i]!);
          node.children[i] = null;
        }
      }
      node.isLeaf = true;
    }
  }

  clearNode(root);
}

/**
 * Get octant index for a point
 *
 * @param point Point
 * @param bounds Bounds
 * @returns Octant index (0-7)
 */
export function getOctant(point: Point3D, bounds: Bounds3D): number {
  const centerX = (bounds.min.x + bounds.max.x) / 2;
  const centerY = (bounds.min.y + bounds.max.y) / 2;
  const centerZ = (bounds.min.z + bounds.max.z) / 2;

  let octant = 0;
  if (point.x >= centerX) octant |= 1;
  if (point.y >= centerY) octant |= 2;
  if (point.z >= centerZ) octant |= 4;

  return octant;
}

/**
 * Check if a point is valid
 *
 * @param point Point to validate
 * @returns True if point is valid
 */
export function isValidPoint(point: Point3D): boolean {
  return (
    typeof point.x === "number" &&
    typeof point.y === "number" &&
    typeof point.z === "number" &&
    !isNaN(point.x) &&
    !isNaN(point.y) &&
    !isNaN(point.z) &&
    isFinite(point.x) &&
    isFinite(point.y) &&
    isFinite(point.z)
  );
}

/**
 * Check if a point is within bounds
 *
 * @param point Point to check
 * @param bounds Bounds to check against
 * @returns True if point is within bounds
 */
export function pointInBounds(point: Point3D, bounds: Bounds3D): boolean {
  return (
    point.x >= bounds.min.x &&
    point.x <= bounds.max.x &&
    point.y >= bounds.min.y &&
    point.y <= bounds.max.y &&
    point.z >= bounds.min.z &&
    point.z <= bounds.max.z
  );
}

/**
 * Calculate bounds volume
 *
 * @param bounds Bounds
 * @returns Volume of the bounds
 */
export function calculateBoundsVolume(bounds: Bounds3D): number {
  const width = bounds.max.x - bounds.min.x;
  const height = bounds.max.y - bounds.min.y;
  const depth = bounds.max.z - bounds.min.z;
  return width * height * depth;
}

/**
 * Check if bounds are valid
 *
 * @param bounds Bounds to check
 * @returns True if bounds are valid
 */
export function isValidBounds(bounds: Bounds3D): boolean {
  return (
    bounds.min.x < bounds.max.x &&
    bounds.min.y < bounds.max.y &&
    bounds.min.z < bounds.max.z &&
    isValidPoint(bounds.min) &&
    isValidPoint(bounds.max)
  );
}

