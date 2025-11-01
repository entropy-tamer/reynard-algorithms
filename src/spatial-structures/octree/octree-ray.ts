/**
 * Octree Ray Intersection Operations
 *
 * Handles ray casting and intersection testing for the Octree data structure.
 * Provides efficient ray-octree intersection queries.
 *
 * @module algorithms/spatial-structures/octree
 */

import type {
  Point3D,
  Ray3D,
  OctreeNode,
  RayIntersectionOptions,
  RayIntersectionResult,
  OctreeStats,
  Bounds3D,
} from "./octree-types";
import { OctreeEventType } from "./octree-types";

/**
 * Perform ray intersection query
 *
 * @param root Root node of the octree
 * @param ray Ray to test
 * @param options Intersection options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Ray intersection result
 */
export function rayIntersection(
  root: OctreeNode | null,
  ray: Ray3D,
  options: RayIntersectionOptions = {},
  stats: OctreeStats,
  emitEvent: (type: OctreeEventType, data?: any) => void
): RayIntersectionResult {
  const startTime = performance.now();
  const points: Point3D[] = [];
  const distances: number[] = [];
  let nodesVisited = 0;

  if (root) {
    nodesVisited = rayIntersectionRecursive(root, ray, points, distances, options, 0);
  }

  const executionTime = performance.now() - startTime;
  stats.rayIntersections++;
  stats.averageQueryTime = (stats.averageQueryTime * (stats.rayIntersections - 1) + executionTime) / stats.rayIntersections;

  emitEvent(OctreeEventType.RAY_INTERSECTION, {
    ray,
    resultCount: points.length,
    nodesVisited,
    executionTime,
  });

  return {
    points,
    distances,
    count: points.length,
    executionTime,
    nodesVisited,
    success: true,
  };
}

/**
 * Recursively perform ray intersection
 *
 * @param node Current node
 * @param ray Ray to test
 * @param points Array to collect intersection points
 * @param distances Array to collect distances
 * @param options Intersection options
 * @param depth Current depth
 * @returns Number of nodes visited
 */
function rayIntersectionRecursive(
  node: OctreeNode,
  ray: Ray3D,
  points: Point3D[],
  distances: number[],
  options: RayIntersectionOptions,
  depth: number
): number {
  let nodesVisited = 1;

  // Check if ray intersects with node bounds
  if (!rayIntersectsBounds(ray, node.bounds)) {
    return nodesVisited;
  }

  if (node.isLeaf) {
    // Check each point in the leaf
    for (const point of node.points) {
      const distance = pointToRayDistance(point, ray);
      const tolerance = 0.001;
      if (distance <= tolerance) {
        points.push(point);
        distances.push(distance);
      }
    }
  } else {
    // Recursively check children
    for (const child of node.children) {
      if (child) {
        nodesVisited += rayIntersectionRecursive(child, ray, points, distances, options, depth + 1);
      }
    }
  }

  return nodesVisited;
}

/**
 * Check if ray intersects with bounds
 *
 * @param ray Ray to test
 * @param bounds Bounds to test against
 * @returns True if ray intersects bounds
 */
function rayIntersectsBounds(ray: Ray3D, bounds: Bounds3D): boolean {
  const tMin = (bounds.min.x - ray.origin.x) / ray.direction.x;
  const tMax = (bounds.max.x - ray.origin.x) / ray.direction.x;
  const tMinY = (bounds.min.y - ray.origin.y) / ray.direction.y;
  const tMaxY = (bounds.max.y - ray.origin.y) / ray.direction.y;
  const tMinZ = (bounds.min.z - ray.origin.z) / ray.direction.z;
  const tMaxZ = (bounds.max.z - ray.origin.z) / ray.direction.z;

  const tMinFinal = Math.max(
    Math.min(tMin, tMax),
    Math.min(tMinY, tMaxY),
    Math.min(tMinZ, tMaxZ)
  );
  const tMaxFinal = Math.min(
    Math.max(tMin, tMax),
    Math.max(tMinY, tMaxY),
    Math.max(tMinZ, tMaxZ)
  );

  return tMaxFinal >= tMinFinal && tMaxFinal >= 0;
}

/**
 * Calculate distance from point to ray
 *
 * @param point Point
 * @param ray Ray
 * @returns Distance from point to ray
 */
function pointToRayDistance(point: Point3D, ray: Ray3D): number {
  const toPoint = {
    x: point.x - ray.origin.x,
    y: point.y - ray.origin.y,
    z: point.z - ray.origin.z,
  };

  const projectionLength = dotProduct(toPoint, ray.direction);
  const projection = {
    x: ray.direction.x * projectionLength,
    y: ray.direction.y * projectionLength,
    z: ray.direction.z * projectionLength,
  };

  const perpendicular = {
    x: toPoint.x - projection.x,
    y: toPoint.y - projection.y,
    z: toPoint.z - projection.z,
  };

  return Math.sqrt(
    perpendicular.x * perpendicular.x +
    perpendicular.y * perpendicular.y +
    perpendicular.z * perpendicular.z
  );
}

/**
 * Calculate dot product of two 3D vectors
 *
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Dot product
 */
function dotProduct(v1: { x: number; y: number; z: number }, v2: { x: number; y: number; z: number }): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

