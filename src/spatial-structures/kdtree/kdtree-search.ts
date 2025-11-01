/**
 * KD-Tree Search Operations
 *
 * Handles point search and contains operations
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
 * Search for a point in the KD-Tree
 *
 * @param root Root node
 * @param point Point to search for
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 */
export function searchPoint(
  root: KdNode | null,
  point: Point,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[]
): KdTreeResult {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: "Tree is empty" },
      };
    }

    // Validate point
    if (!isValidPoint(point, config.dimensions)) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: "Invalid point dimensions" },
      };
    }

    // Search recursively
    const found = searchRecursive(root, point, 0, config);

    // Update statistics
    stats.searches++;
    const executionTime = performance.now() - startTime;
    stats.averageSearchTime = updateAverageTime(stats.averageSearchTime, executionTime, stats.searches);

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_SEARCHED, {
      point,
      found,
      executionTime,
    });

    return {
      success: found,
      executionTime,
      nodesVisited: stats.nodeCount,
      metadata: { point, found },
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
 * Check if tree contains a point
 *
 * @param root Root node
 * @param point Point to check
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns True if point exists
 */
export function containsPoint(
  root: KdNode | null,
  point: Point,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[]
): boolean {
  if (!root) {
    return false;
  }

  if (!isValidPoint(point, config.dimensions)) {
    return false;
  }

  return searchRecursive(root, point, 0, config);
}

/**
 * Recursively search for a point
 *
 * @param node Current node
 * @param point Point to search for
 * @param depth Current depth
 * @param config KD-Tree configuration
 * @returns True if point found
 */
function searchRecursive(
  node: KdNode | null,
  point: Point,
  depth: number,
  config: Required<KdTreeConfig>
): boolean {
  if (!node) {
    return false;
  }

  // Check if current node contains the point
  if (pointsEqual(node.point, point)) {
    return true;
  }

  // Determine which subtree to search
  const dimension = depth % config.dimensions;
  const pointValue = point[dimension];
  const nodeValue = node.point[dimension];

  if (pointValue < nodeValue) {
    return searchRecursive(node.left, point, depth + 1, config);
  } else {
    return searchRecursive(node.right, point, depth + 1, config);
  }
}

/**
 * Find all points in the tree
 *
 * @param root Root node
 * @returns Array of all points
 */
export function getAllPoints(root: KdNode | null): Point[] {
  const points: Point[] = [];
  collectPoints(root, points);
  return points;
}

/**
 * Collect all points from tree
 *
 * @param node Current node
 * @param points Array to store points
 */
function collectPoints(node: KdNode | null, points: Point[]): void {
  if (!node) {
    return;
  }

  points.push({ ...node.point });
  collectPoints(node.left, points);
  collectPoints(node.right, points);
}

/**
 * Find points within a specific range for one dimension
 *
 * @param root Root node
 * @param dimension Dimension to search
 * @param minValue Minimum value
 * @param maxValue Maximum value
 * @param config KD-Tree configuration
 * @returns Array of points in range
 */
export function findPointsInRange(
  root: KdNode | null,
  dimension: number,
  minValue: number,
  maxValue: number,
  config: Required<KdTreeConfig>
): Point[] {
  if (!root || dimension >= config.dimensions) {
    return [];
  }

  const points: Point[] = [];
  findPointsInRangeRecursive(root, dimension, minValue, maxValue, 0, config, points);
  return points;
}

/**
 * Recursively find points in range
 *
 * @param node Current node
 * @param dimension Dimension to search
 * @param minValue Minimum value
 * @param maxValue Maximum value
 * @param depth Current depth
 * @param config KD-Tree configuration
 * @param points Array to store points
 */
function findPointsInRangeRecursive(
  node: KdNode | null,
  dimension: number,
  minValue: number,
  maxValue: number,
  depth: number,
  config: Required<KdTreeConfig>,
  points: Point[]
): void {
  if (!node) {
    return;
  }

  const currentDimension = depth % config.dimensions;
  const nodeValue = node.point[currentDimension];

  // Check if current node is in range
  if (currentDimension === dimension) {
    if (nodeValue >= minValue && nodeValue <= maxValue) {
      points.push({ ...node.point });
    }
  }

  // Search subtrees
  if (currentDimension === dimension) {
    // Current dimension is the search dimension
    if (nodeValue >= minValue) {
      findPointsInRangeRecursive(node.left, dimension, minValue, maxValue, depth + 1, config, points);
    }
    if (nodeValue <= maxValue) {
      findPointsInRangeRecursive(node.right, dimension, minValue, maxValue, depth + 1, config, points);
    }
  } else {
    // Search both subtrees
    findPointsInRangeRecursive(node.left, dimension, minValue, maxValue, depth + 1, config, points);
    findPointsInRangeRecursive(node.right, dimension, minValue, maxValue, depth + 1, config, points);
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
 * Update average time calculation
 *
 * @param currentAverage Current average
 * @param newTime New time value
 * @param count Total count
 * @returns Updated average
 */
function updateAverageTime(currentAverage: number, newTime: number, count: number): number {
  return (currentAverage * (count - 1) + newTime) / count;
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

