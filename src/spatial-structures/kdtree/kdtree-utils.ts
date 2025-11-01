/**
 * KD-Tree Utility Operations
 *
 * Handles utility functions, statistics calculation,
 * and helper operations for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */

import type {
  Point,
  KdNode,
  KdTreeConfig,
  KdTreeStats,
  KdTreePerformanceMetrics,
  KdTreeSerialization,
  KdTreeEventHandler,
} from "./kdtree-types";
import { KdTreeEventType } from "./kdtree-types";

/**
 * Calculate tree statistics
 *
 * @param root Root node
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 */
export function calculateTreeStats(
  root: KdNode | null,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats
): void {
  if (!root) {
    stats.totalPoints = 0;
    stats.nodeCount = 0;
    stats.height = 0;
    stats.leafCount = 0;
    stats.averageDepth = 0;
    stats.maxDepth = 0;
    return;
  }

  stats.totalPoints = countPoints(root);
  stats.nodeCount = countNodes(root);
  stats.height = calculateHeight(root);
  stats.leafCount = countLeaves(root);
  stats.averageDepth = calculateAverageDepth(root);
  stats.maxDepth = calculateMaxDepth(root);
}

/**
 * Get tree size
 *
 * @param root Root node
 * @returns Number of points in tree
 */
export function getTreeSize(root: KdNode | null): number {
  return countPoints(root);
}

/**
 * Check if tree is empty
 *
 * @param root Root node
 * @returns True if tree is empty
 */
export function isTreeEmpty(root: KdNode | null): boolean {
  return root === null;
}

/**
 * Get performance metrics
 *
 * @param stats Statistics object
 * @returns Performance metrics
 */
export function getPerformanceMetrics(stats: KdTreeStats): KdTreePerformanceMetrics {
  return {
    averageInsertionTime: 0,
    averageInsertTime: 0,
    averageQueryTime: (stats.averageSearchTime + stats.averageNearestNeighborTime + stats.averageRangeQueryTime) / 3,
    averageSearchTime: stats.averageSearchTime,
    averageNearestNeighborTime: stats.averageNearestNeighborTime,
    averageRangeQueryTime: stats.averageRangeQueryTime,
    totalOperations: stats.insertions + stats.searches + stats.nearestNeighborQueries + stats.rangeQueries,
    memoryUsage: stats.memoryUsage,
    cacheHitRate: 0,
    performanceScore: undefined,
    balanceRatio: undefined,
    queryEfficiency: undefined,
    treeHeight: stats.height,
    averageDepth: stats.averageDepth,
    nodeCount: stats.nodeCount,
    leafCount: stats.leafCount,
  };
}

/**
 * Serialize tree to JSON
 *
 * @param root Root node
 * @param config KD-Tree configuration
 * @param stats Statistics object
 * @returns Serialized tree data
 */
export function serializeTree(
  root: KdNode | null,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats
): KdTreeSerialization {
  return {
    version: "1.0",
    config: { ...config },
    stats: { ...stats },
    root: root ? serializeNode(root) : null,
    metadata: {
      timestamp: Date.now(),
      totalPoints: stats.totalPoints,
    },
  };
}

/**
 * Serialize a single node
 *
 * @param node Node to serialize
 * @returns Serialized node data
 */
function serializeNode(node: KdNode): any {
  return {
    point: { ...node.point },
    left: node.left ? serializeNode(node.left) : null,
    right: node.right ? serializeNode(node.right) : null,
    depth: node.depth,
    dimension: node.dimension ?? 0,
  };
}

/**
 * Count total points in tree
 *
 * @param node Root node
 * @returns Number of points
 */
function countPoints(node: KdNode | null): number {
  if (!node) {
    return 0;
  }

  return 1 + countPoints(node.left) + countPoints(node.right);
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
 * Calculate maximum depth of any node
 *
 * @param node Root node
 * @returns Maximum depth
 */
function calculateMaxDepth(node: KdNode | null): number {
  if (!node) {
    return 0;
  }

  const depths: number[] = [];
  collectDepths(node, depths, 0);
  
  return depths.length > 0 ? Math.max(...depths) : 0;
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
 * Calculate distance between two points
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Euclidean distance
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const keys = Object.keys(p1);
  let sum = 0;

  for (const key of keys) {
    const diff = p1[key] - p2[key];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Check if two points are equal
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns True if points are equal
 */
export function pointsEqual(p1: Point, p2: Point): boolean {
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
 * Check if a point is valid
 *
 * @param point Point to validate
 * @param dimensions Expected number of dimensions
 * @returns True if point is valid
 */
export function isValidPoint(point: Point, dimensions: number): boolean {
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
 * Create a deep copy of a point
 *
 * @param point Point to copy
 * @returns Deep copy of point
 */
export function copyPoint(point: Point): Point {
  const copy: Point = {};
  for (const key of Object.keys(point)) {
    copy[key] = point[key];
  }
  return copy;
}

/**
 * Create a deep copy of a node
 *
 * @param node Node to copy
 * @returns Deep copy of node
 */
export function copyNode(node: KdNode | null): KdNode | null {
  if (!node) {
    return null;
  }

  return {
    point: copyPoint(node.point),
    left: copyNode(node.left),
    right: copyNode(node.right),
    depth: node.depth,
    dimension: node.dimension ?? 0,
  };
}

/**
 * Reset statistics
 *
 * @param stats Statistics object to reset
 */
export function resetStats(stats: KdTreeStats): void {
  stats.totalPoints = 0;
  stats.height = 0;
  stats.nodeCount = 0;
  stats.leafCount = 0;
  stats.averageDepth = 0;
  stats.maxDepth = 0;
  stats.memoryUsage = 0;
  stats.insertions = 0;
  stats.searches = 0;
  stats.nearestNeighborQueries = 0;
  stats.rangeQueries = 0;
  stats.averageSearchTime = 0;
  stats.averageNearestNeighborTime = 0;
  stats.averageRangeQueryTime = 0;
}

/**
 * Update average time calculation
 *
 * @param currentAverage Current average
 * @param newTime New time value
 * @param count Total count
 * @returns Updated average
 */
export function updateAverageTime(currentAverage: number, newTime: number, count: number): number {
  return (currentAverage * (count - 1) + newTime) / count;
}

/**
 * Emit event to handlers
 *
 * @param eventHandlers Array of event handlers
 * @param type Event type
 * @param data Event data
 */
export function emitEvent(
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

