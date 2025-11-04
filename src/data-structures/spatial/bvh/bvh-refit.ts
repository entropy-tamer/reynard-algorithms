/**
 * BVH Refit Operations
 *
 * Handles dynamic refitting and updating of BVH nodes
 * when primitives are modified or moved.
 *
 * @module algorithms/spatial-structures/bvh
 */

import type { BVHNode, Primitive, BVHStats, AABB } from "./bvh-types";

/**
 * Refit BVH tree after primitive modifications
 *
 * @param root Root node of the BVH
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Refit result
 * @example
 */
export function refitTree(
  root: BVHNode | null,
  stats: BVHStats,
  emitEvent: (type: string, data?: any) => void
): { success: boolean; executionTime: number; nodesRefitted: number } {
  const startTime = performance.now();

  if (!root) {
    return {
      success: false,
      executionTime: performance.now() - startTime,
      nodesRefitted: 0,
    };
  }

  emitEvent("bvh_refit_started", {});

  try {
    const nodesRefitted = refitRecursive(root);
    const executionTime = performance.now() - startTime;

    emitEvent("bvh_refit_completed", {
      nodesRefitted,
      executionTime,
    });

    return {
      success: true,
      executionTime,
      nodesRefitted,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    emitEvent("bvh_refit_failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime,
    });

    return {
      success: false,
      executionTime,
      nodesRefitted: 0,
    };
  }
}

/**
 * Recursively refit BVH tree
 *
 * @param node Current node
 * @returns Number of nodes refitted
 * @example
 */
function refitRecursive(node: BVHNode): number {
  let nodesRefitted = 1;

  if (node.isLeaf) {
    // Refit leaf node bounds
    node.bounds = convertArrayBoundsToAABB(calculatePrimitivesBounds(node.primitives));
  } else {
    // Recursively refit children
    if (node.left) {
      nodesRefitted += refitRecursive(node.left);
    }
    if (node.right) {
      nodesRefitted += refitRecursive(node.right);
    }

    // Refit internal node bounds
    if (node.left && node.right) {
      node.bounds = unionAABBsObject(node.left.bounds, node.right.bounds);
    } else if (node.left) {
      node.bounds = node.left.bounds;
    } else if (node.right) {
      node.bounds = node.right.bounds;
    }
  }

  return nodesRefitted;
}

/**
 * Update specific primitive in BVH
 *
 * @param root Root node of the BVH
 * @param primitiveId ID of primitive to update
 * @param newPrimitive Updated primitive
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Update result
 * @example
 */
export function updatePrimitive(
  root: BVHNode | null,
  primitiveId: string | number,
  newPrimitive: Primitive,
  stats: BVHStats,
  emitEvent: (type: string, data?: any) => void
): { success: boolean; executionTime: number; nodesRefitted: number } {
  const startTime = performance.now();

  if (!root) {
    return {
      success: false,
      executionTime: performance.now() - startTime,
      nodesRefitted: 0,
    };
  }

  emitEvent("bvh_primitive_update_started", { primitiveId });

  try {
    // Find and update primitive
    const updated = updatePrimitiveInTree(root, primitiveId, newPrimitive);

    if (!updated) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesRefitted: 0,
      };
    }

    // Refit affected nodes
    const nodesRefitted = refitRecursive(root);
    const executionTime = performance.now() - startTime;

    emitEvent("bvh_primitive_update_completed", {
      primitiveId,
      nodesRefitted,
      executionTime,
    });

    return {
      success: true,
      executionTime,
      nodesRefitted,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    emitEvent("bvh_primitive_update_failed", {
      primitiveId,
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime,
    });

    return {
      success: false,
      executionTime,
      nodesRefitted: 0,
    };
  }
}

/**
 * Update primitive in tree
 *
 * @param node Current node
 * @param primitiveId ID of primitive to update
 * @param newPrimitive Updated primitive
 * @returns True if primitive was found and updated
 * @example
 */
function updatePrimitiveInTree(node: BVHNode, primitiveId: string | number, newPrimitive: Primitive): boolean {
  if (node.isLeaf) {
    // Update primitive in leaf
    const index = node.primitives.findIndex(p => p.id === primitiveId);
    if (index !== -1) {
      node.primitives[index] = newPrimitive;
      return true;
    }
    return false;
  } else {
    // Recursively search children
    if (node.left && updatePrimitiveInTree(node.left, primitiveId, newPrimitive)) {
      return true;
    }
    if (node.right && updatePrimitiveInTree(node.right, primitiveId, newPrimitive)) {
      return true;
    }
    return false;
  }
}

/**
 * Calculate bounds for primitives
 *
 * @param primitives Array of primitives
 * @returns AABB bounds
 * @example
 */
function calculatePrimitivesBounds(primitives: Primitive[]): {
  min: [number, number, number];
  max: [number, number, number];
} {
  if (primitives.length === 0) {
    return {
      min: [0, 0, 0],
      max: [0, 0, 0],
    };
  }

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (const primitive of primitives) {
    const bounds = getPrimitiveBounds(primitive);
    minX = Math.min(minX, bounds.min[0]);
    minY = Math.min(minY, bounds.min[1]);
    minZ = Math.min(minZ, bounds.min[2]);
    maxX = Math.max(maxX, bounds.max[0]);
    maxY = Math.max(maxY, bounds.max[1]);
    maxZ = Math.max(maxZ, bounds.max[2]);
  }

  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
  };
}

/**
 * Get primitive bounds
 *
 * @param primitive Primitive
 * @returns AABB bounds
 * @example
 */
function getPrimitiveBounds(primitive: Primitive): { min: [number, number, number]; max: [number, number, number] } {
  // Simplified implementation - would need proper bounds calculation based on primitive type
  return {
    min: [0, 0, 0],
    max: [1, 1, 1],
  };
}

/**
 * Union two AABBs
 *
 * @param bounds1 First AABB
 * @param bounds2 Second AABB
 * @param a
 * @param b
 * @returns Union AABB
 * @example
 */
function unionAABBsObject(a: AABB, b: AABB): AABB {
  const min = { x: Math.min(a.min.x, b.min.x), y: Math.min(a.min.y, b.min.y), z: Math.min(a.min.z, b.min.z) };
  const max = { x: Math.max(a.max.x, b.max.x), y: Math.max(a.max.y, b.max.y), z: Math.max(a.max.z, b.max.z) };
  const center = { x: (min.x + max.x) / 2, y: (min.y + max.y) / 2, z: (min.z + max.z) / 2 };
  const size = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };
  return { min, max, center, size };
}

/**
 *
 * @param bounds
 * @param bounds.min
 * @param bounds.max
 * @example
 */
function convertArrayBoundsToAABB(bounds: { min: [number, number, number]; max: [number, number, number] }): AABB {
  const min = { x: bounds.min[0], y: bounds.min[1], z: bounds.min[2] };
  const max = { x: bounds.max[0], y: bounds.max[1], z: bounds.max[2] };
  const center = { x: (min.x + max.x) / 2, y: (min.y + max.y) / 2, z: (min.z + max.z) / 2 };
  const size = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };
  return { min, max, center, size };
}
