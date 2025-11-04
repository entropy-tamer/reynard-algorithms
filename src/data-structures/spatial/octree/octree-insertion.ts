/**
 * Octree Insertion Operations
 *
 * Handles point insertion, batch insertion, and recursive insertion logic
 * for the Octree data structure.
 *
 * @module algorithms/spatial-structures/octree
 */

import type {
  Point3D,
  Bounds3D,
  OctreeNode,
  OctreeConfig,
  OctreeResult,
  BatchOperationResult,
  OctreeStats,
} from "./octree-types";
import { OctreeEventType } from "./octree-types";

/**
 * Insert a single point into the octree
 *
 * @param root Root node of the octree
 * @param point Point to insert
 * @param config Octree configuration
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Insertion result
 * @example
 */
export function insertPoint(
  root: OctreeNode | null,
  point: Point3D,
  config: Required<OctreeConfig>,
  stats: OctreeStats,
  emitEvent: (type: OctreeEventType, data?: any) => void
): OctreeResult {
  const startTime = performance.now();

  if (!root) {
    return {
      success: false,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: "Octree is not initialized" },
    };
  }

  if (!isValidPoint(point)) {
    return {
      success: false,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: "Invalid point coordinates" },
    };
  }

  if (!pointInBounds(point, root.bounds)) {
    return {
      success: false,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: "Point is outside octree bounds" },
    };
  }

  let nodesVisited = 0;
  try {
    nodesVisited = insertRecursive(root, point, 0, config);
    updateStats(stats);
    const executionTime = performance.now() - startTime;
    emitEvent(OctreeEventType.POINT_INSERTED, { point, executionTime });

    return {
      success: true,
      executionTime,
      nodesVisited,
      metadata: {},
    };
  } catch (error) {
    return {
      success: false,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

/**
 * Insert multiple points in batch
 *
 * @param root Root node of the octree
 * @param points Points to insert
 * @param config Octree configuration
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Batch operation result
 * @example
 */
export function insertBatch(
  root: OctreeNode | null,
  points: Point3D[],
  config: Required<OctreeConfig>,
  stats: OctreeStats,
  emitEvent: (type: OctreeEventType, data?: any) => void
): BatchOperationResult {
  const startTime = performance.now();
  const results: OctreeResult[] = [];
  const errors: string[] = [];

  for (const point of points) {
    const result = insertPoint(root, point, config, stats, emitEvent);
    results.push(result);

    if (result.success) {
      stats.insertions++;
    } else {
      errors.push(result.metadata?.error || "Unknown error");
    }
  }

  const executionTime = performance.now() - startTime;

  return {
    success: errors.length === 0,
    results,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    errors,
    executionTime,
  };
}

/**
 * Recursively insert a point into the octree
 *
 * @param node Current node
 * @param point Point to insert
 * @param depth Current depth
 * @param config Octree configuration
 * @returns Number of nodes visited
 * @example
 */
function insertRecursive(node: OctreeNode, point: Point3D, depth: number, config: Required<OctreeConfig>): number {
  let nodesVisited = 1;

  if (node.isLeaf) {
    if (node.points.length < (config.maxPoints ?? 10)) {
      node.points.push(point);
      return nodesVisited;
    }

    // Need to subdivide
    if (depth < config.maxDepth) {
      subdivideNode(node, config);
      nodesVisited += 8; // 8 new children created
    }
  }

  if (!node.isLeaf) {
    const octant = getOctant(point, node.bounds);
    if (node.children[octant]) {
      nodesVisited += insertRecursive(node.children[octant]!, point, depth + 1, config);
    }
  }

  return nodesVisited;
}

/**
 * Check if a point is valid
 *
 * @param point Point to validate
 * @returns True if point is valid
 * @example
 */
function isValidPoint(point: Point3D): boolean {
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
 * Get the octant index for a point
 *
 * @param point Point
 * @param bounds Bounds
 * @returns Octant index (0-7)
 * @example
 */
function getOctant(point: Point3D, bounds: Bounds3D): number {
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
 * Subdivide a leaf node into 8 children
 *
 * @param node Node to subdivide
 * @param config Octree configuration
 * @example
 */
function subdivideNode(node: OctreeNode, config: Required<OctreeConfig>): void {
  const bounds = node.bounds;
  const centerX = (bounds.min.x + bounds.max.x) / 2;
  const centerY = (bounds.min.y + bounds.max.y) / 2;
  const centerZ = (bounds.min.z + bounds.max.z) / 2;

  const childrenBounds: Bounds3D[] = [
    // Octant 0: -x, -y, -z
    {
      min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
      max: { x: centerX, y: centerY, z: centerZ },
      center: { x: (bounds.min.x + centerX) / 2, y: (bounds.min.y + centerY) / 2, z: (bounds.min.z + centerZ) / 2 },
      size: { x: centerX - bounds.min.x, y: centerY - bounds.min.y, z: centerZ - bounds.min.z },
    },
    // Octant 1: +x, -y, -z
    {
      min: { x: centerX, y: bounds.min.y, z: bounds.min.z },
      max: { x: bounds.max.x, y: centerY, z: centerZ },
      center: { x: (centerX + bounds.max.x) / 2, y: (bounds.min.y + centerY) / 2, z: (bounds.min.z + centerZ) / 2 },
      size: { x: bounds.max.x - centerX, y: centerY - bounds.min.y, z: centerZ - bounds.min.z },
    },
    // Octant 2: -x, +y, -z
    {
      min: { x: bounds.min.x, y: centerY, z: bounds.min.z },
      max: { x: centerX, y: bounds.max.y, z: centerZ },
      center: { x: (bounds.min.x + centerX) / 2, y: (centerY + bounds.max.y) / 2, z: (bounds.min.z + centerZ) / 2 },
      size: { x: centerX - bounds.min.x, y: bounds.max.y - centerY, z: centerZ - bounds.min.z },
    },
    // Octant 3: +x, +y, -z
    {
      min: { x: centerX, y: centerY, z: bounds.min.z },
      max: { x: bounds.max.x, y: bounds.max.y, z: centerZ },
      center: { x: (centerX + bounds.max.x) / 2, y: (centerY + bounds.max.y) / 2, z: (bounds.min.z + centerZ) / 2 },
      size: { x: bounds.max.x - centerX, y: bounds.max.y - centerY, z: centerZ - bounds.min.z },
    },
    // Octant 4: -x, -y, +z
    {
      min: { x: bounds.min.x, y: bounds.min.y, z: centerZ },
      max: { x: centerX, y: centerY, z: bounds.max.z },
      center: { x: (bounds.min.x + centerX) / 2, y: (bounds.min.y + centerY) / 2, z: (centerZ + bounds.max.z) / 2 },
      size: { x: centerX - bounds.min.x, y: centerY - bounds.min.y, z: bounds.max.z - centerZ },
    },
    // Octant 5: +x, -y, +z
    {
      min: { x: centerX, y: bounds.min.y, z: centerZ },
      max: { x: bounds.max.x, y: centerY, z: bounds.max.z },
      center: { x: (centerX + bounds.max.x) / 2, y: (bounds.min.y + centerY) / 2, z: (centerZ + bounds.max.z) / 2 },
      size: { x: bounds.max.x - centerX, y: centerY - bounds.min.y, z: bounds.max.z - centerZ },
    },
    // Octant 6: -x, +y, +z
    {
      min: { x: bounds.min.x, y: centerY, z: centerZ },
      max: { x: centerX, y: bounds.max.y, z: bounds.max.z },
      center: { x: (bounds.min.x + centerX) / 2, y: (centerY + bounds.max.y) / 2, z: (centerZ + bounds.max.z) / 2 },
      size: { x: centerX - bounds.min.x, y: bounds.max.y - centerY, z: bounds.max.z - centerZ },
    },
    // Octant 7: +x, +y, +z
    {
      min: { x: centerX, y: centerY, z: centerZ },
      max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
      center: { x: (centerX + bounds.max.x) / 2, y: (centerY + bounds.max.y) / 2, z: (centerZ + bounds.max.z) / 2 },
      size: { x: bounds.max.x - centerX, y: bounds.max.y - centerY, z: bounds.max.z - centerZ },
    },
  ];

  // Create children
  for (let i = 0; i < 8; i++) {
    node.children[i] = createNode(childrenBounds[i], node.depth + 1, node);
  }

  // Move existing points to appropriate children
  const pointsToRedistribute = [...node.points];
  node.points = [];
  node.isLeaf = false;

  for (const point of pointsToRedistribute) {
    const octant = getOctant(point, bounds);
    if (node.children[octant]) {
      insertRecursive(node.children[octant]!, point, node.depth + 1, config);
    }
  }
}

/**
 * Create a new octree node
 *
 * @param bounds Bounds for the node
 * @param depth Depth of the node
 * @param parent Parent node
 * @returns New octree node
 * @example
 */
function createNode(bounds: Bounds3D, depth: number, parent: OctreeNode | null): OctreeNode {
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
 * Update statistics after insertion
 *
 * @param stats Statistics object to update
 * @example
 */
function updateStats(stats: OctreeStats): void {
  stats.insertions++;
  stats.totalPoints++;
}
