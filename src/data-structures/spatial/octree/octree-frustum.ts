/**
 * Octree Frustum Culling Operations
 *
 * Handles frustum culling and visibility testing for the Octree data structure.
 * Provides efficient frustum-octree intersection queries for rendering optimization.
 *
 * @module algorithms/spatial-structures/octree
 */

import type {
  Point3D,
  Frustum3D,
  OctreeNode,
  FrustumCullingOptions,
  FrustumCullingResult,
  OctreeStats,
} from "./octree-types";
import { OctreeEventType } from "./octree-types";

/**
 * Perform frustum culling query
 *
 * @param root Root node of the octree
 * @param frustum Frustum to test
 * @param options Culling options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Frustum culling result
 * @example
 */
export function frustumCulling(
  root: OctreeNode | null,
  frustum: Frustum3D,
  options: FrustumCullingOptions = {},
  stats: OctreeStats,
  emitEvent: (type: OctreeEventType, data?: any) => void
): FrustumCullingResult {
  const startTime = performance.now();
  const visiblePoints: Point3D[] = [];
  let nodesVisited = 0;

  if (root) {
    const result = frustumCullingRecursive(root, frustum, visiblePoints, options, 0);
    nodesVisited = result.nodesVisited;
  }

  const executionTime = performance.now() - startTime;
  stats.frustumCulling++;
  stats.averageQueryTime = (stats.averageQueryTime * (stats.frustumCulling - 1) + executionTime) / stats.frustumCulling;

  emitEvent(OctreeEventType.FRUSTUM_CULLING, {
    frustum,
    visibleCount: visiblePoints.length,
    nodesVisited,
    executionTime,
  });

  return {
    visiblePoints,
    visibleCount: visiblePoints.length,
    culledCount: 0,
    executionTime,
    nodesVisited,
    success: true,
  };
}

/**
 * Recursively perform frustum culling
 *
 * @param node Current node
 * @param frustum Frustum to test
 * @param visiblePoints Array to collect visible points
 * @param options Culling options
 * @param depth Current depth
 * @returns Culling result with nodes visited
 * @example
 */
function frustumCullingRecursive(
  node: OctreeNode,
  frustum: Frustum3D,
  visiblePoints: Point3D[],
  options: FrustumCullingOptions,
  depth: number
): { nodesVisited: number } {
  let nodesVisited = 1;

  // Check if node bounds intersect with frustum
  const intersection = boundsFrustumIntersection(node.bounds, frustum);

  if (intersection === "outside") {
    return { nodesVisited };
  }

  if (node.isLeaf) {
    // Check each point in the leaf
    for (const point of node.points) {
      if (pointInFrustum(point, frustum)) {
        visiblePoints.push(point);
      }
    }
  } else {
    // Recursively check children
    for (const child of node.children) {
      if (child) {
        const result = frustumCullingRecursive(child, frustum, visiblePoints, options, depth + 1);
        nodesVisited += result.nodesVisited;
      }
    }
  }

  return { nodesVisited };
}

/**
 * Check if bounds intersect with frustum
 *
 * @param bounds Bounds to test
 * @param bounds.min
 * @param frustum Frustum to test against
 * @param bounds.max
 * @returns Intersection result
 * @example
 */
function boundsFrustumIntersection(
  bounds: { min: Point3D; max: Point3D },
  frustum: Frustum3D
): "inside" | "intersect" | "outside" {
  let inside = true;
  const outside = false;

  for (const plane of frustum.planes) {
    const normal = plane.normal;
    const distance = plane.distance;

    // Check all 8 corners of the bounding box
    const corners = [
      { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
      { x: bounds.max.x, y: bounds.min.y, z: bounds.min.z },
      { x: bounds.min.x, y: bounds.max.y, z: bounds.min.z },
      { x: bounds.max.x, y: bounds.max.y, z: bounds.min.z },
      { x: bounds.min.x, y: bounds.min.y, z: bounds.max.z },
      { x: bounds.max.x, y: bounds.min.y, z: bounds.max.z },
      { x: bounds.min.x, y: bounds.max.y, z: bounds.max.z },
      { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const corner of corners) {
      const dot = normal.x * corner.x + normal.y * corner.y + normal.z * corner.z;
      if (dot > distance) {
        positiveCount++;
      } else {
        negativeCount++;
      }
    }

    if (negativeCount === 8) {
      // All corners are on the negative side
      return "outside";
    } else if (positiveCount < 8) {
      // Some corners are on the negative side
      inside = false;
    }
  }

  if (inside) {
    return "inside";
  } else {
    return "intersect";
  }
}

/**
 * Check if a point is inside frustum
 *
 * @param point Point to test
 * @param frustum Frustum to test against
 * @returns True if point is inside frustum
 * @example
 */
function pointInFrustum(point: Point3D, frustum: Frustum3D): boolean {
  for (const plane of frustum.planes) {
    const normal = plane.normal;
    const distance = plane.distance;
    const dot = normal.x * point.x + normal.y * point.y + normal.z * point.z;

    if (dot <= distance) {
      return false;
    }
  }

  return true;
}
