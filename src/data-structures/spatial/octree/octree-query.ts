/**
 * Octree Query Operations
 *
 * Handles spatial queries including bounds queries, sphere queries,
 * and nearest neighbor searches for the Octree data structure.
 *
 * @module algorithms/spatial-structures/octree
 */

import type {
  Point3D,
  Bounds3D,
  Sphere3D,
  OctreeNode,
  SpatialQueryOptions,
  SpatialQueryResult,
  OctreeStats,
} from "./octree-types";
import { OctreeEventType } from "./octree-types";

/**
 * Query points within bounds
 *
 * @param root Root node of the octree
 * @param bounds Query bounds
 * @param options Query options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Query result
 * @example
 */
export function queryBounds(
  root: OctreeNode | null,
  bounds: Bounds3D,
  options: SpatialQueryOptions = {},
  stats: OctreeStats,
  emitEvent: (type: OctreeEventType, data?: any) => void
): SpatialQueryResult {
  const startTime = performance.now();
  const points: Point3D[] = [];
  let nodesVisited = 0;

  if (root) {
    nodesVisited = queryBoundsRecursive(root, bounds, points, options, 0);
  }

  const executionTime = performance.now() - startTime;
  stats.spatialQueries++;
  stats.averageQueryTime = (stats.averageQueryTime * (stats.spatialQueries - 1) + executionTime) / stats.spatialQueries;

  emitEvent(OctreeEventType.SPATIAL_QUERY, {
    bounds,
    resultCount: points.length,
    nodesVisited,
    executionTime,
  });

  return {
    points,
    count: points.length,
    executionTime,
    nodesVisited,
    success: true,
  };
}

/**
 * Query points within sphere
 *
 * @param root Root node of the octree
 * @param sphere Query sphere
 * @param options Query options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Query result
 * @example
 */
export function querySphere(
  root: OctreeNode | null,
  sphere: Sphere3D,
  options: SpatialQueryOptions = {},
  stats: OctreeStats,
  emitEvent: (type: OctreeEventType, data?: any) => void
): SpatialQueryResult {
  const startTime = performance.now();
  const points: Point3D[] = [];
  let nodesVisited = 0;

  if (root) {
    nodesVisited = querySphereRecursive(root, sphere, points, options, 0);
  }

  const executionTime = performance.now() - startTime;
  stats.spatialQueries++;
  stats.averageQueryTime = (stats.averageQueryTime * (stats.spatialQueries - 1) + executionTime) / stats.spatialQueries;

  emitEvent(OctreeEventType.SPATIAL_QUERY, {
    sphere,
    resultCount: points.length,
    nodesVisited,
    executionTime,
  });

  return {
    points,
    count: points.length,
    executionTime,
    nodesVisited,
    success: true,
  };
}

/**
 * Recursively query points within bounds
 *
 * @param node Current node
 * @param bounds Query bounds
 * @param points Array to collect points
 * @param options Query options
 * @param depth Current depth
 * @returns Number of nodes visited
 * @example
 */
function queryBoundsRecursive(
  node: OctreeNode,
  bounds: Bounds3D,
  points: Point3D[],
  options: SpatialQueryOptions,
  depth: number
): number {
  let nodesVisited = 1;

  // Check if node bounds intersect with query bounds
  if (!boundsIntersect(node.bounds, bounds)) {
    return nodesVisited;
  }

  if (node.isLeaf) {
    // Check each point in the leaf
    for (const point of node.points) {
      if (pointInBounds(point, bounds)) {
        points.push(point);
        if (options.maxResults && points.length >= options.maxResults) {
          return nodesVisited;
        }
      }
    }
  } else {
    // Recursively check children
    for (const child of node.children) {
      if (child) {
        nodesVisited += queryBoundsRecursive(child, bounds, points, options, depth + 1);
        if (options.maxResults && points.length >= options.maxResults) {
          break;
        }
      }
    }
  }

  return nodesVisited;
}

/**
 * Recursively query points within sphere
 *
 * @param node Current node
 * @param sphere Query sphere
 * @param points Array to collect points
 * @param options Query options
 * @param depth Current depth
 * @returns Number of nodes visited
 * @example
 */
function querySphereRecursive(
  node: OctreeNode,
  sphere: Sphere3D,
  points: Point3D[],
  options: SpatialQueryOptions,
  depth: number
): number {
  let nodesVisited = 1;

  // Check if node bounds intersect with sphere
  if (!sphereIntersectsBounds(sphere, node.bounds)) {
    return nodesVisited;
  }

  if (node.isLeaf) {
    // Check each point in the leaf
    for (const point of node.points) {
      if (pointInSphere(point, sphere)) {
        points.push(point);
        if (options.maxResults && points.length >= options.maxResults) {
          return nodesVisited;
        }
      }
    }
  } else {
    // Recursively check children
    for (const child of node.children) {
      if (child) {
        nodesVisited += querySphereRecursive(child, sphere, points, options, depth + 1);
        if (options.maxResults && points.length >= options.maxResults) {
          break;
        }
      }
    }
  }

  return nodesVisited;
}

/**
 * Check if two bounds intersect
 *
 * @param bounds1 First bounds
 * @param bounds2 Second bounds
 * @returns True if bounds intersect
 * @example
 */
function boundsIntersect(bounds1: Bounds3D, bounds2: Bounds3D): boolean {
  return (
    bounds1.min.x <= bounds2.max.x &&
    bounds1.max.x >= bounds2.min.x &&
    bounds1.min.y <= bounds2.max.y &&
    bounds1.max.y >= bounds2.min.y &&
    bounds1.min.z <= bounds2.max.z &&
    bounds1.max.z >= bounds2.min.z
  );
}

/**
 * Check if a point is within bounds
 *
 * @param point Point to check
 * @param bounds Bounds to check against
 * @returns True if point is within bounds
 * @example
 */
function pointInBounds(point: Point3D, bounds: Bounds3D): boolean {
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
 * Check if a point is within sphere
 *
 * @param point Point to check
 * @param sphere Sphere to check against
 * @returns True if point is within sphere
 * @example
 */
function pointInSphere(point: Point3D, sphere: Sphere3D): boolean {
  const dx = point.x - sphere.center.x;
  const dy = point.y - sphere.center.y;
  const dz = point.z - sphere.center.z;
  const distanceSquared = dx * dx + dy * dy + dz * dz;
  return distanceSquared <= sphere.radius * sphere.radius;
}

/**
 * Check if sphere intersects with bounds
 *
 * @param sphere Sphere
 * @param bounds Bounds
 * @returns True if sphere intersects bounds
 * @example
 */
function sphereIntersectsBounds(sphere: Sphere3D, bounds: Bounds3D): boolean {
  // Find the closest point on the bounds to the sphere center
  const closestX = Math.max(bounds.min.x, Math.min(sphere.center.x, bounds.max.x));
  const closestY = Math.max(bounds.min.y, Math.min(sphere.center.y, bounds.max.y));
  const closestZ = Math.max(bounds.min.z, Math.min(sphere.center.z, bounds.max.z));

  // Calculate distance from sphere center to closest point
  const dx = sphere.center.x - closestX;
  const dy = sphere.center.y - closestY;
  const dz = sphere.center.z - closestZ;
  const distanceSquared = dx * dx + dy * dy + dz * dz;

  return distanceSquared <= sphere.radius * sphere.radius;
}
