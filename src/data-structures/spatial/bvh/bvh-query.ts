/**
 * BVH Query Operations
 *
 * Handles ray intersection queries and AABB intersection queries
 * for the BVH data structure with efficient traversal.
 *
 * @module algorithms/spatial-structures/bvh
 */

import type {
  Ray3D,
  AABB,
  BVHNode,
  RayIntersectionOptions,
  AABBIntersectionOptions,
  RayIntersectionResult,
  AABBIntersectionResult,
  BVHStats,
} from "./bvh-types";
import { BVHEventType } from "./bvh-types";

/**
 * Perform ray intersection query
 *
 * @param root Root node of the BVH
 * @param ray Ray to test
 * @param options Intersection options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Ray intersection result
 * @example
 */
export function rayIntersection(
  root: BVHNode | null,
  ray: Ray3D,
  options: RayIntersectionOptions = {},
  stats: BVHStats,
  emitEvent: (type: BVHEventType, data?: any) => void
): RayIntersectionResult {
  const startTime = performance.now();
  const intersections: Array<{ primitive: any; distance: number }> = [];
  let nodesVisited = 0;

  if (root) {
    nodesVisited = rayIntersectionRecursive(root, ray, intersections, options, 0);
  }

  const executionTime = performance.now() - startTime;
  stats.rayIntersections++;
  (stats as any).averageQueryTime =
    ((stats as any).averageQueryTime * (stats.rayIntersections - 1) + executionTime) / stats.rayIntersections;

  emitEvent(BVHEventType.RAY_INTERSECTION, {
    ray,
    resultCount: intersections.length,
    nodesVisited,
    executionTime,
  });

  return {
    primitives: intersections.map(i => i.primitive),
    distances: intersections.map(i => i.distance),
    count: intersections.length,
    executionTime,
    nodesVisited,
    primitivesTested: 0,
    success: true,
  };
}

/**
 * Perform AABB intersection query
 *
 * @param root Root node of the BVH
 * @param aabb AABB to test
 * @param options Intersection options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns AABB intersection result
 * @example
 */
export function aabbIntersection(
  root: BVHNode | null,
  aabb: AABB,
  options: AABBIntersectionOptions = {},
  stats: BVHStats,
  emitEvent: (type: BVHEventType, data?: any) => void
): AABBIntersectionResult {
  const startTime = performance.now();
  const intersections: any[] = [];
  let nodesVisited = 0;

  if (root) {
    nodesVisited = aabbIntersectionRecursive(root, aabb, intersections, options, 0);
  }

  const executionTime = performance.now() - startTime;
  stats.aabbIntersections = (stats.aabbIntersections || 0) + 1;
  (stats as any).averageQueryTime =
    ((stats as any).averageQueryTime * (stats.aabbIntersections - 1) + executionTime) / stats.aabbIntersections;

  emitEvent(BVHEventType.AABB_INTERSECTION, {
    aabb,
    resultCount: intersections.length,
    nodesVisited,
    executionTime,
  });

  return {
    primitives: intersections,
    count: intersections.length,
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
 * @param intersections Array to collect intersections
 * @param options Intersection options
 * @param depth Current depth
 * @returns Number of nodes visited
 * @example
 */
function rayIntersectionRecursive(
  node: BVHNode,
  ray: Ray3D,
  intersections: Array<{ primitive: any; distance: number }>,
  options: RayIntersectionOptions,
  depth: number
): number {
  let nodesVisited = 1;

  // Check if ray intersects node bounds
  if (!rayIntersectsAABB(ray, node.bounds)) {
    return nodesVisited;
  }

  if (node.isLeaf) {
    // Test ray against all primitives in leaf
    for (const primitive of node.primitives) {
      const distance = rayIntersectsPrimitive(ray, primitive);
      if (distance !== null && distance >= 0) {
        intersections.push({ primitive, distance });

        if (options.maxIntersections && intersections.length >= options.maxIntersections) {
          return nodesVisited;
        }
      }
    }
  } else {
    // Recursively test children
    if (node.left) {
      nodesVisited += rayIntersectionRecursive(node.left, ray, intersections, options, depth + 1);
      if (options.maxIntersections && intersections.length >= options.maxIntersections) {
        return nodesVisited;
      }
    }

    if (node.right) {
      nodesVisited += rayIntersectionRecursive(node.right, ray, intersections, options, depth + 1);
    }
  }

  return nodesVisited;
}

/**
 * Recursively perform AABB intersection
 *
 * @param node Current node
 * @param aabb AABB to test
 * @param intersections Array to collect intersections
 * @param options Intersection options
 * @param depth Current depth
 * @returns Number of nodes visited
 * @example
 */
function aabbIntersectionRecursive(
  node: BVHNode,
  aabb: AABB,
  intersections: any[],
  options: AABBIntersectionOptions,
  depth: number
): number {
  let nodesVisited = 1;

  // Check if AABBs intersect
  if (!aabbIntersectsAABB(aabb, node.bounds)) {
    return nodesVisited;
  }

  if (node.isLeaf) {
    // Test AABB against all primitives in leaf
    for (const primitive of node.primitives) {
      if (aabbIntersectsPrimitive(aabb, primitive)) {
        intersections.push(primitive);

        if (options.maxIntersections && intersections.length >= options.maxIntersections) {
          return nodesVisited;
        }
      }
    }
  } else {
    // Recursively test children
    if (node.left) {
      nodesVisited += aabbIntersectionRecursive(node.left, aabb, intersections, options, depth + 1);
      if (options.maxIntersections && intersections.length >= options.maxIntersections) {
        return nodesVisited;
      }
    }

    if (node.right) {
      nodesVisited += aabbIntersectionRecursive(node.right, aabb, intersections, options, depth + 1);
    }
  }

  return nodesVisited;
}

/**
 * Check if ray intersects AABB
 *
 * @param ray Ray to test
 * @param aabb AABB to test against
 * @returns True if ray intersects AABB
 * @example
 */
function rayIntersectsAABB(ray: Ray3D, aabb: AABB): boolean {
  const tMin = (aabb.min.x - ray.origin.x) / ray.direction.x;
  const tMax = (aabb.max.x - ray.origin.x) / ray.direction.x;
  const tMinY = (aabb.min.y - ray.origin.y) / ray.direction.y;
  const tMaxY = (aabb.max.y - ray.origin.y) / ray.direction.y;
  const tMinZ = (aabb.min.z - ray.origin.z) / ray.direction.z;
  const tMaxZ = (aabb.max.z - ray.origin.z) / ray.direction.z;

  const tMinFinal = Math.max(Math.min(tMin, tMax), Math.min(tMinY, tMaxY), Math.min(tMinZ, tMaxZ));
  const tMaxFinal = Math.min(Math.max(tMin, tMax), Math.max(tMinY, tMaxY), Math.max(tMinZ, tMaxZ));

  return tMaxFinal >= tMinFinal && tMaxFinal >= 0;
}

/**
 * Check if AABBs intersect
 *
 * @param aabb1 First AABB
 * @param aabb2 Second AABB
 * @returns True if AABBs intersect
 * @example
 */
function aabbIntersectsAABB(aabb1: AABB, aabb2: AABB): boolean {
  return (
    aabb1.min.x <= aabb2.max.x &&
    aabb1.max.x >= aabb2.min.x &&
    aabb1.min.y <= aabb2.max.y &&
    aabb1.max.y >= aabb2.min.y &&
    aabb1.min.z <= aabb2.max.z &&
    aabb1.max.z >= aabb2.min.z
  );
}

/**
 * Test ray intersection with primitive
 *
 * @param ray Ray to test
 * @param primitive Primitive to test against
 * @returns Distance to intersection or null if no intersection
 * @example
 */
function rayIntersectsPrimitive(ray: Ray3D, primitive: any): number | null {
  // Simplified implementation - would need proper primitive intersection tests
  // This would depend on the primitive type (triangle, sphere, etc.)
  return null;
}

/**
 * Test AABB intersection with primitive
 *
 * @param aabb AABB to test
 * @param primitive Primitive to test against
 * @returns True if AABB intersects primitive
 * @example
 */
function aabbIntersectsPrimitive(aabb: AABB, primitive: any): boolean {
  // Simplified implementation - would need proper primitive intersection tests
  return false;
}
