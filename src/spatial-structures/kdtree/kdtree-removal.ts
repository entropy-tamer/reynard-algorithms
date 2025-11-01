/**
 * KD-Tree Removal Operations
 *
 * Handles point removal and tree rebalancing
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
  KdTreeEventHandler,
} from "./kdtree-types";
import { KdTreeEventType } from "./kdtree-types";

/**
 * Remove a point from the KD-Tree
 *
 * @param root Root node
 * @param point Point to remove
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and result
 */
export function removePoint(
  root: KdNode | null,
  point: Point,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[]
): { root: KdNode | null; result: KdTreeResult } {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        root: null,
        result: {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Tree is empty" },
        },
      };
    }

    // Validate point
    if (!isValidPoint(point, config.dimensions)) {
      return {
        root,
        result: {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point dimensions" },
        },
      };
    }

    // Remove point recursively
    const newRoot = removeRecursive(root, point, 0, config);

    // Update statistics
    if (newRoot !== root) {
      stats.totalPoints = Math.max(0, stats.totalPoints - 1);
      stats.nodeCount = countNodes(newRoot);
      stats.height = calculateHeight(newRoot);
      stats.averageDepth = calculateAverageDepth(newRoot);
    }

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_REMOVED, {
      point,
      executionTime: performance.now() - startTime,
    });

    return {
      root: newRoot,
      result: {
        success: true,
        executionTime: performance.now() - startTime,
        nodesVisited: stats.nodeCount,
        metadata: { point },
      },
    };
  } catch (error) {
    return {
      root,
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
 * Recursively remove a point from the tree
 *
 * @param node Current node
 * @param point Point to remove
 * @param depth Current depth
 * @param config KD-Tree configuration
 * @returns New node (or null if removed)
 */
function removeRecursive(
  node: KdNode | null,
  point: Point,
  depth: number,
  config: Required<KdTreeConfig>
): KdNode | null {
  if (!node) {
    return null;
  }

  // Check if current node contains the point
  if (pointsEqual(node.point, point)) {
    // If it's a leaf node, just remove it
    if (!node.left && !node.right) {
      return null;
    }

    // If it has a right subtree, find the minimum in the right subtree
    if (node.right) {
      const minNode = findMin(node.right, depth % config.dimensions, depth + 1);
      node.point = { ...minNode.point };
      node.right = removeRecursive(node.right, minNode.point, depth + 1, config);
    } else {
      // If it only has a left subtree, find the minimum in the left subtree
      const minNode = findMin(node.left!, depth % config.dimensions, depth + 1);
      node.point = { ...minNode.point };
      node.left = removeRecursive(node.left, minNode.point, depth + 1, config);
    }

    return node;
  }

  // Determine which subtree to search
  const dimension = depth % config.dimensions;
  const pointValue = point[dimension];
  const nodeValue = node.point[dimension];

  if (pointValue < nodeValue) {
    node.left = removeRecursive(node.left, point, depth + 1, config);
  } else {
    node.right = removeRecursive(node.right, point, depth + 1, config);
  }

  return node;
}

/**
 * Find minimum node in a subtree
 *
 * @param node Root of subtree
 * @param dimension Dimension to compare
 * @param depth Current depth
 * @returns Minimum node
 */
function findMin(
  node: KdNode,
  dimension: number,
  depth: number
): KdNode {
  const currentDimension = depth % dimension;
  
  if (currentDimension === dimension) {
    // Current dimension is the search dimension
    if (node.left) {
      return findMin(node.left, dimension, depth + 1);
    }
    return node;
  } else {
    // Search both subtrees
    let minNode = node;
    
    if (node.left) {
      const leftMin = findMin(node.left, dimension, depth + 1);
      if (leftMin.point[dimension] < minNode.point[dimension]) {
        minNode = leftMin;
      }
    }
    
    if (node.right) {
      const rightMin = findMin(node.right, dimension, depth + 1);
      if (rightMin.point[dimension] < minNode.point[dimension]) {
        minNode = rightMin;
      }
    }
    
    return minNode;
  }
}

/**
 * Clear all points from the tree
 *
 * @param root Root node
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Result
 */
export function clearTree(
  root: KdNode | null,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[]
): KdTreeResult {
  const startTime = performance.now();

  try {
    // Update statistics
    stats.totalPoints = 0;
    stats.nodeCount = 0;
    stats.height = 0;
    stats.leafCount = 0;
    stats.averageDepth = 0;
    stats.maxDepth = 0;

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_CLEARED, {
      executionTime: performance.now() - startTime,
    });

    return {
      success: true,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { cleared: true },
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

