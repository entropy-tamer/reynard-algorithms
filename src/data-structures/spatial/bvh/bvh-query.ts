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
  // Robust slab test: a zero direction component makes the division infinite,
  // but the ray may still be inside that slab. Use the ordering form that
  // avoids dividing by zero (Infinity is handled by IEEE arithmetic).
  let tMin = -Infinity;
  let tMax = Infinity;
  for (const axis of ["x", "y", "z"] as const) {
    const origin = ray.origin[axis];
    const direction = ray.direction[axis];
    const lower = aabb.min[axis];
    const upper = aabb.max[axis];
    if (direction === 0) {
      if (origin < lower || origin > upper) return false;
      continue;
    }
    const t1 = (lower - origin) / direction;
    const t2 = (upper - origin) / direction;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
    if (tMin > tMax) return false;
  }
  return tMax >= Math.max(tMin, 0);
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
 * @param _ray
 * @param _primitive
 * @returns Distance to intersection or null if no intersection
 * @example
 */
function rayIntersectsPrimitive(ray: Ray3D, primitive: any): number | null {
  // Primitives are bounded by AABBs. Test the ray against that bound; more
  // precise per-shape tests can refine this later, but returning null here
  // made every BVH ray query empty.
  return rayIntersectsAABB(ray, primitive.bounds) ? 0 : null;
}

/**
 * Test AABB intersection with primitive
 *
 * @param aabb AABB to test
 * @param primitive Primitive to test against
 * @param _aabb
 * @param _primitive
 * @returns True if AABB intersects primitive
 * @example
 */
function aabbIntersectsPrimitive(aabb: AABB, primitive: any): boolean {
  const bounds: AABB = primitive.bounds;
  return (
    aabb.min.x <= bounds.max.x &&
    aabb.max.x >= bounds.min.x &&
    aabb.min.y <= bounds.max.y &&
    aabb.max.y >= bounds.min.y &&
    aabb.min.z <= bounds.max.z &&
    aabb.max.z >= bounds.min.z
  );
}
