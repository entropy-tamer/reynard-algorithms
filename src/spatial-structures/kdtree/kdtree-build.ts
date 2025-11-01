/**
 * KD-Tree Build Operations
 *
 * Handles tree construction, insertion, and rebuilding
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */

import type {
  Point,
  KdNode,
  KdTreeConfig,
  KdTreeStats,
  KdTreeResult,
  BatchOperationResult,
  KdTreeEvent,
  KdTreeEventHandler,
} from "./kdtree-types";
import { KdTreeEventType } from "./kdtree-types";

/**
 * Insert a point into the KD-Tree
 *
 * @param root Current root node
 * @param point Point to insert
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param depth Current depth
 * @returns New root node and result
 */
export function insertPoint(
  root: KdNode | null,
  point: Point,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[],
  depth: number = 0
): { root: KdNode; result: KdTreeResult } {
  const startTime = performance.now();

  try {
    // Validate point
    if (!isValidPoint(point, config.dimensions)) {
      return {
        root: root!,
        result: {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point dimensions" },
        },
      };
    }

    // Check if point already exists
    if (root && pointsEqual(root.point, point)) {
      return {
        root,
        result: {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Point already exists" },
        },
      };
    }

    // Insert recursively
    const newRoot = insertRecursive(root, point, depth, config, stats);

    // Update statistics
    stats.totalPoints++;
    stats.insertions++;
    stats.nodeCount = countNodes(newRoot);
    stats.height = calculateHeight(newRoot);
    stats.averageDepth = calculateAverageDepth(newRoot);
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_INSERTED, {
      point,
      depth,
      executionTime: performance.now() - startTime,
    });

      return {
      root: newRoot,
      result: {
        success: true,
        executionTime: performance.now() - startTime,
          nodesVisited: stats.nodeCount,
        metadata: { point, depth },
      },
    };
  } catch (error) {
    return {
      root: root!,
      result: {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      },
    };
  }
}

/**
 * Insert multiple points in batch
 *
 * @param root Current root node
 * @param points Array of points to insert
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and batch result
 */
export function insertBatch(
  root: KdNode | null,
  points: Point[],
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[]
): { root: KdNode | null; result: BatchOperationResult } {
  const startTime = performance.now();
  let currentRoot = root;
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  try {
    for (const point of points) {
      const insertResult = insertPoint(
        currentRoot,
        point,
        config,
        stats,
        eventHandlers,
        0
      );

      if (insertResult.result.success) {
        currentRoot = insertResult.root;
        successCount++;
      } else {
        errorCount++;
        errors.push(insertResult.result.metadata?.error || "Unknown error");
      }
    }

    const execTime = performance.now() - startTime;
    return {
      root: currentRoot,
      result: {
        successful: successCount,
        failed: errorCount,
        totalTime: execTime,
        executionTime: execTime,
        averageTime: points.length > 0 ? execTime / points.length : 0,
        errors,
        results: [],
      },
    };
  } catch (error) {
    const execTime = performance.now() - startTime;
    return {
      root: currentRoot,
      result: {
        successful: successCount,
        failed: errorCount,
        totalTime: execTime,
        executionTime: execTime,
        averageTime: points.length > 0 ? execTime / points.length : 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        results: [],
      },
    };
  }
}

/**
 * Rebuild the entire tree
 *
 * @param points Array of all points
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and result
 */
export function rebuildTree(
  points: Point[],
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[]
): { root: KdNode | null; result: KdTreeResult } {
  const startTime = performance.now();

  try {
    // Clear existing statistics
    stats.totalPoints = 0;
    stats.nodeCount = 0;
    stats.height = 0;
    stats.leafCount = 0;
    stats.averageDepth = 0;
    stats.maxDepth = 0;

    // Build new tree
    const newRoot = buildTree(points, config, 0);

    // Update statistics
    stats.totalPoints = points.length;
    stats.nodeCount = countNodes(newRoot);
    stats.height = calculateHeight(newRoot);
    stats.leafCount = countLeaves(newRoot);
    stats.averageDepth = calculateAverageDepth(newRoot);

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_REBUILT, {
      pointCount: points.length,
      executionTime: performance.now() - startTime,
    });

    return {
      root: newRoot,
      result: {
        success: true,
        executionTime: performance.now() - startTime,
        nodesVisited: stats.nodeCount,
        metadata: { pointCount: points.length },
      },
    };
  } catch (error) {
    return {
      root: null,
      result: {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      },
    };
  }
}

/**
 * Recursively insert a point into the tree
 *
 * @param node Current node
 * @param point Point to insert
 * @param depth Current depth
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @returns New node
 */
function insertRecursive(
  node: KdNode | null,
  point: Point,
  depth: number,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats
): KdNode {
  if (!node) {
    return {
      point: { ...point },
      left: null,
      right: null,
      dimension: depth % config.dimensions,
      depth,
    };
  }

  const dimension = depth % config.dimensions;
  const pointValue = point[dimension];
  const nodeValue = node.point[dimension];

  if (pointValue < nodeValue) {
    node.left = insertRecursive(node.left, point, depth + 1, config, stats);
  } else {
    node.right = insertRecursive(node.right, point, depth + 1, config, stats);
  }

  return node;
}

/**
 * Build tree from array of points
 *
 * @param points Array of points
 * @param config KD-Tree configuration
 * @param depth Current depth
 * @returns Root node
 */
function buildTree(
  points: Point[],
  config: Required<KdTreeConfig>,
  depth: number
): KdNode | null {
  if (points.length === 0) {
    return null;
  }

  if (points.length === 1) {
    return {
      point: { ...points[0] },
      left: null,
      right: null,
      dimension: depth % config.dimensions,
      depth,
    };
  }

  const dimension = depth % config.dimensions;
  const sortedPoints = [...points].sort((a, b) => a[dimension] - b[dimension]);
  const medianIndex = Math.floor(sortedPoints.length / 2);
  const medianPoint = sortedPoints[medianIndex];

  const leftPoints = sortedPoints.slice(0, medianIndex);
  const rightPoints = sortedPoints.slice(medianIndex + 1);

  return {
    point: { ...medianPoint },
    left: buildTree(leftPoints, config, depth + 1),
    right: buildTree(rightPoints, config, depth + 1),
    dimension: depth % config.dimensions,
    depth,
  };
}

/**
 * Check if a point is valid
 *
 * @param point Point to validate
 * @param dimensions Expected number of dimensions
 * @returns True if point is valid
 */
function isValidPoint(point: Point, dimensions: number): boolean {
  if (!point || typeof point !== 'object') {
    return false;
  }

  const keys = Object.keys(point);
  if (keys.length !== dimensions) {
    return false;
  }

  for (const key of keys) {
    const value = point[key];
    if (typeof value !== 'number' || !isFinite(value)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if two points are equal
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns True if points are equal
 */
function pointsEqual(p1: Point, p2: Point): boolean {
  const keys1 = Object.keys(p1);
  const keys2 = Object.keys(p2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (p1[key] !== p2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Count total nodes in tree
 *
 * @param node Root node
 * @returns Number of nodes
 */
function countNodes(node: KdNode | null): number {
  if (!node) {
    return 0;
  }

  return 1 + countNodes(node.left) + countNodes(node.right);
}

/**
 * Count leaf nodes in tree
 *
 * @param node Root node
 * @returns Number of leaf nodes
 */
function countLeaves(node: KdNode | null): number {
  if (!node) {
    return 0;
  }

  if (!node.left && !node.right) {
    return 1;
  }

  return countLeaves(node.left) + countLeaves(node.right);
}

/**
 * Calculate tree height
 *
 * @param node Root node
 * @returns Tree height
 */
function calculateHeight(node: KdNode | null): number {
  if (!node) {
    return 0;
  }

  return 1 + Math.max(calculateHeight(node.left), calculateHeight(node.right));
}

/**
 * Calculate average depth of all nodes
 *
 * @param node Root node
 * @returns Average depth
 */
function calculateAverageDepth(node: KdNode | null): number {
  if (!node) {
    return 0;
  }

  const depths: number[] = [];
  collectDepths(node, depths, 0);
  
  if (depths.length === 0) {
    return 0;
  }

  return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
}

/**
 * Collect depths of all nodes
 *
 * @param node Current node
 * @param depths Array to store depths
 * @param currentDepth Current depth
 */
function collectDepths(node: KdNode | null, depths: number[], currentDepth: number): void {
  if (!node) {
    return;
  }

  depths.push(currentDepth);
  collectDepths(node.left, depths, currentDepth + 1);
  collectDepths(node.right, depths, currentDepth + 1);
}

/**
 * Emit event to handlers
 *
 * @param eventHandlers Array of event handlers
 * @param type Event type
 * @param data Event data
 */
function emitEvent(
  eventHandlers: KdTreeEventHandler[],
  type: KdTreeEventType,
  data: any
): void {
  for (const handler of eventHandlers) {
    try {
      handler({ type, data, timestamp: Date.now() });
    } catch (error) {
      // Ignore handler errors
    }
  }
}

