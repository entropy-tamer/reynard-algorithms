/**
 * BVH Build Operations
 *
 * Handles BVH construction, SAH (Surface Area Heuristic) splitting,
 * and tree building logic for the BVH data structure.
 *
 * @module algorithms/spatial-structures/bvh
 */

import type { Primitive, BVHNode, BVHBuildConfig, BVHStats, SAHSplitCandidate, AABB } from "./bvh-types";

/**
 * Build BVH tree from primitives
 *
 * @param primitives Array of primitives
 * @param config Build configuration
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Build result
 * @example
 */
export function buildTree(
  primitives: Primitive[],
  config: Required<BVHBuildConfig>,
  stats: BVHStats,
  emitEvent: (type: any, data?: any) => void
): BVHNode | null {
  if (primitives.length === 0) {
    return null;
  }

  const startTime = performance.now();
  emitEvent("bvh_build_started", { primitiveCount: primitives.length });

  try {
    const root = buildRecursive(primitives, 0, config, stats);
    const executionTime = performance.now() - startTime;

    emitEvent("bvh_build_completed", {
      primitiveCount: primitives.length,
      executionTime,
      nodeCount: stats.nodeCount,
    });

    return root;
  } catch (error) {
    const executionTime = performance.now() - startTime;
    emitEvent("bvh_build_failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime,
    });
    return null;
  }
}

/**
 * Recursively build BVH tree
 *
 * @param primitives Primitives to build with
 * @param depth Current depth
 * @param config Build configuration
 * @param stats Statistics object to update
 * @returns Built node
 * @example
 */
function buildRecursive(
  primitives: Primitive[],
  depth: number,
  config: Required<BVHBuildConfig>,
  stats: BVHStats
): BVHNode {
  stats.nodeCount++;

  // Create leaf if we have few primitives or reached max depth
  if (primitives.length <= config.maxPrimitivesPerLeaf || depth >= config.maxDepth) {
    return createLeafNode(primitives);
  }

  // Find best split using SAH
  const split = findBestSplit(primitives, config);

  if (!split) {
    // No good split found, create leaf
    return createLeafNode(primitives);
  }

  // Partition primitives based on split
  const leftPrimitives: Primitive[] = [];
  const rightPrimitives: Primitive[] = [];

  for (const primitive of primitives) {
    const centroid = getPrimitiveCentroid(primitive);
    if (centroid[split.axis] < split.position) {
      leftPrimitives.push(primitive);
    } else {
      rightPrimitives.push(primitive);
    }
  }

  // Ensure we don't have empty children
  if (leftPrimitives.length === 0 || rightPrimitives.length === 0) {
    return createLeafNode(primitives);
  }

  // Recursively build children
  const leftChild = buildRecursive(leftPrimitives, depth + 1, config, stats);
  const rightChild = buildRecursive(rightPrimitives, depth + 1, config, stats);

  // Create internal node
  const node: BVHNode = {
    isLeaf: false,
    primitives: [],
    left: leftChild,
    right: rightChild,
    bounds: convertUnionToAABB(unionAABBs(convertAABBToArray(leftChild.bounds), convertAABBToArray(rightChild.bounds))),
    parent: null,
    depth,
    primitiveCount: leftChild.primitiveCount + rightChild.primitiveCount,
    splitAxis: split.axis,
    splitPosition: split.position,
  };

  return node;
}

/**
 * Find best split using Surface Area Heuristic
 *
 * @param primitives Primitives to split
 * @param config Build configuration
 * @returns Best split candidate or null
 * @example
 */
function findBestSplit(primitives: Primitive[], config: Required<BVHBuildConfig>): SAHSplitCandidate | null {
  let bestSplit: SAHSplitCandidate | null = null;
  let bestCost = Infinity;

  // Test splits along each axis
  for (let axis = 0; axis < 3; axis++) {
    const candidates = generateSplitCandidates(primitives, axis, config);

    for (const candidate of candidates) {
      const cost = calculateSAHCost(primitives, candidate, config);

      if (cost < bestCost) {
        bestCost = cost;
        bestSplit = candidate;
      }
    }
  }

  // Only use split if it's better than not splitting
  const noSplitCost = config.intersectionCost * primitives.length;
  return bestCost < noSplitCost ? bestSplit : null;
}

/**
 * Generate split candidates for an axis
 *
 * @param primitives Primitives
 * @param axis Axis to split along
 * @param config Build configuration
 * @returns Array of split candidates
 * @example
 */
function generateSplitCandidates(
  primitives: Primitive[],
  axis: number,
  config: Required<BVHBuildConfig>
): SAHSplitCandidate[] {
  const candidates: SAHSplitCandidate[] = [];

  // Sort primitives by centroid along axis
  const sortedPrimitives = [...primitives].sort((a, b) => {
    const centroidA = getPrimitiveCentroid(a);
    const centroidB = getPrimitiveCentroid(b);
    return centroidA[axis] - centroidB[axis];
  });

  // Generate candidates at various positions
  const step = Math.max(1, Math.floor(sortedPrimitives.length / config.splitCandidates));

  for (let i = step; i < sortedPrimitives.length - step; i += step) {
    const primitive = sortedPrimitives[i];
    const centroid = getPrimitiveCentroid(primitive);

    candidates.push({
      axis,
      position: centroid[axis],
      leftCount: i,
      rightCount: sortedPrimitives.length - i,
    });
  }

  return candidates;
}

/**
 * Calculate SAH cost for a split candidate
 *
 * @param primitives All primitives
 * @param candidate Split candidate
 * @param config Build configuration
 * @returns SAH cost
 * @example
 */
function calculateSAHCost(
  primitives: Primitive[],
  candidate: SAHSplitCandidate,
  config: Required<BVHBuildConfig>
): number {
  const totalBounds = calculateBounds(primitives);
  const totalArea = calculateAABBArea(totalBounds);

  if (totalArea === 0) return Infinity;

  // Calculate left and right bounds
  const leftPrimitives = primitives.slice(0, candidate.leftCount);
  const rightPrimitives = primitives.slice(candidate.leftCount);

  const leftBounds = calculateBounds(leftPrimitives);
  const rightBounds = calculateBounds(rightPrimitives);

  const leftArea = calculateAABBArea(leftBounds);
  const rightArea = calculateAABBArea(rightBounds);

  const leftCost = (leftArea / totalArea) * candidate.leftCount * config.intersectionCost;
  const rightCost = (rightArea / totalArea) * candidate.rightCount * config.intersectionCost;

  return config.traversalCost + leftCost + rightCost;
}

/**
 * Create a leaf node
 *
 * @param primitives Primitives for the leaf
 * @returns Leaf node
 * @example
 */
function createLeafNode(primitives: Primitive[]): BVHNode {
  const arrayBounds = calculateBounds(primitives);
  return {
    isLeaf: true,
    primitives: [...primitives],
    left: null,
    right: null,
    parent: null,
    depth: 0,
    primitiveCount: primitives.length,
    bounds: convertArrayBoundsToAABB(arrayBounds),
    splitAxis: -1,
    splitPosition: 0,
  };
}

/**
 * Get primitive centroid
 *
 * @param primitive Primitive
 * @returns Centroid coordinates
 * @example
 */
function getPrimitiveCentroid(primitive: Primitive): [number, number, number] {
  // Simplified centroid calculation - would need proper implementation based on primitive type
  return [0, 0, 0];
}

/**
 * Calculate bounds for primitives
 *
 * @param primitives Primitives
 * @returns AABB bounds
 * @example
 */
function calculateBounds(primitives: Primitive[]): { min: [number, number, number]; max: [number, number, number] } {
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
    // Simplified bounds calculation - would need proper implementation
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
 * Calculate AABB surface area
 *
 * @param bounds AABB bounds
 * @param bounds.min
 * @param bounds.max
 * @returns Surface area
 * @example
 */
function calculateAABBArea(bounds: { min: [number, number, number]; max: [number, number, number] }): number {
  const width = bounds.max[0] - bounds.min[0];
  const height = bounds.max[1] - bounds.min[1];
  const depth = bounds.max[2] - bounds.min[2];

  return 2 * (width * height + width * depth + height * depth);
}

/**
 * Union two AABBs
 *
 * @param bounds1 First AABB
 * @param bounds2 Second AABB
 * @param bounds1.min
 * @param bounds1.max
 * @param bounds2.min
 * @param bounds2.max
 * @returns Union AABB
 * @example
 */
function unionAABBs(
  bounds1: { min: [number, number, number]; max: [number, number, number] },
  bounds2: { min: [number, number, number]; max: [number, number, number] }
): { min: [number, number, number]; max: [number, number, number] } {
  return {
    min: [
      Math.min(bounds1.min[0], bounds2.min[0]),
      Math.min(bounds1.min[1], bounds2.min[1]),
      Math.min(bounds1.min[2], bounds2.min[2]),
    ],
    max: [
      Math.max(bounds1.max[0], bounds2.max[0]),
      Math.max(bounds1.max[1], bounds2.max[1]),
      Math.max(bounds1.max[2], bounds2.max[2]),
    ],
  };
}

/**
 *
 * @param aabb
 * @example
 */
function convertAABBToArray(aabb: AABB): { min: [number, number, number]; max: [number, number, number] } {
  return {
    min: [aabb.min.x, aabb.min.y, aabb.min.z],
    max: [aabb.max.x, aabb.max.y, aabb.max.z],
  };
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
  const center = {
    x: (min.x + max.x) / 2,
    y: (min.y + max.y) / 2,
    z: (min.z + max.z) / 2,
  };
  const size = {
    x: max.x - min.x,
    y: max.y - min.y,
    z: max.z - min.z,
  };
  return { min, max, center, size };
}

/**
 *
 * @param bounds
 * @param bounds.min
 * @param bounds.max
 * @example
 */
function convertUnionToAABB(bounds: { min: [number, number, number]; max: [number, number, number] }): AABB {
  const min = { x: bounds.min[0], y: bounds.min[1], z: bounds.min[2] };
  const max = { x: bounds.max[0], y: bounds.max[1], z: bounds.max[2] };
  const center = {
    x: (min.x + max.x) / 2,
    y: (min.y + max.y) / 2,
    z: (min.z + max.z) / 2,
  };
  const size = {
    x: max.x - min.x,
    y: max.y - min.y,
    z: max.z - min.z,
  };
  return { min, max, center, size };
}
