/**
 * KD-Tree Nearest Neighbor Operations
 *
 * Handles nearest neighbor and k-nearest neighbors queries
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */

import type {
  Point,
  KdNode,
  KdTreeConfig,
  KdTreeStats,
  NearestNeighborResult,
  KNearestNeighborsResult,
  NearestNeighborOptions,
  KNearestNeighborsOptions,
  KdTreeEventHandler,
} from "./kdtree-types";
import { KdTreeEventType } from "./kdtree-types";

/**
 * Find nearest neighbor to a query point
 *
 * @param root Root node
 * @param queryPoint Query point
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Search options
 * @returns Nearest neighbor result
 * @example
 */
export function findNearestNeighbor(
  root: KdNode | null,
  queryPoint: Point,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[],
  options: NearestNeighborOptions = {}
): NearestNeighborResult {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        success: false,
        point: null,
        distance: Infinity,
        executionTime: performance.now() - startTime,
      };
    }

    // Validate query point
    if (!isValidPoint(queryPoint, config.dimensions)) {
      return {
        success: false,
        point: null,
        distance: Infinity,
        executionTime: performance.now() - startTime,
      };
    }

    // Search for nearest neighbor
    const searchResult = nearestNeighborRecursive(root, queryPoint, 0, config, null, Infinity);

    // Update statistics
    stats.nearestNeighborQueries++;
    const executionTime = performance.now() - startTime;
    stats.averageNearestNeighborTime = updateAverageTime(
      stats.averageNearestNeighborTime,
      executionTime,
      stats.nearestNeighborQueries
    );

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_NEAREST_NEIGHBOR, {
      queryPoint,
      nearestPoint: searchResult.point,
      distance: searchResult.distance,
      executionTime,
    });

    return {
      success: true,
      point: searchResult.point,
      distance: searchResult.distance,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      point: null,
      distance: Infinity,
      executionTime: performance.now() - startTime,
    };
  }
}

/**
 * Find k nearest neighbors to a query point
 *
 * @param root Root node
 * @param queryPoint Query point
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Search options
 * @returns K nearest neighbors result
 * @example
 */
export function findKNearestNeighbors(
  root: KdNode | null,
  queryPoint: Point,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[],
  options: KNearestNeighborsOptions
): KNearestNeighborsResult {
  const startTime = performance.now();
  const k = options.k;
  const maxDistance = options.maxDistance ?? Infinity;

  try {
    if (!root) {
      return {
        success: false,
        neighbors: [],
        count: 0,
        maxDistance: 0,
        executionTime: performance.now() - startTime,
      };
    }

    // Validate query point
    if (!isValidPoint(queryPoint, config.dimensions)) {
      return {
        success: false,
        neighbors: [],
        count: 0,
        maxDistance: 0,
        executionTime: performance.now() - startTime,
      };
    }

    // Search for k nearest neighbors
    const neighbors: Array<{ point: Point; distance: number }> = [];
    kNearestNeighborsRecursive(root, queryPoint, 0, config, neighbors, k, maxDistance);

    // Sort by distance
    neighbors.sort((a, b) => a.distance - b.distance);

    // Update statistics
    stats.nearestNeighborQueries++;
    const executionTime = performance.now() - startTime;
    stats.averageNearestNeighborTime = updateAverageTime(
      stats.averageNearestNeighborTime,
      executionTime,
      stats.nearestNeighborQueries
    );

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_K_NEAREST_NEIGHBORS, {
      queryPoint,
      k,
      neighborCount: neighbors.length,
      executionTime,
    });

    const maxDist = neighbors.length > 0 ? Math.max(...neighbors.map(n => n.distance)) : 0;
    return {
      neighbors: neighbors.map(n => ({ point: n.point, distance: n.distance })),
      count: neighbors.length,
      maxDistance: maxDist,
      success: true,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      neighbors: [],
      count: 0,
      maxDistance: 0,
      executionTime: performance.now() - startTime,
    };
  }
}

/**
 * Recursively find nearest neighbor
 *
 * @param node Current node
 * @param queryPoint Query point
 * @param depth Current depth
 * @param config KD-Tree configuration
 * @param bestPoint Current best point
 * @param bestDistance Current best distance
 * @returns Nearest neighbor result
 * @example
 */
function nearestNeighborRecursive(
  node: KdNode | null,
  queryPoint: Point,
  depth: number,
  config: Required<KdTreeConfig>,
  bestPoint: Point | null,
  bestDistance: number
): { point: Point | null; distance: number } {
  if (!node) {
    return { point: bestPoint, distance: bestDistance };
  }

  // Calculate distance to current node
  const currentDistance = calculateDistance(queryPoint, node.point);

  // Update best if current is better
  if (currentDistance < bestDistance) {
    bestPoint = { ...node.point };
    bestDistance = currentDistance;
  }

  // Determine which subtree to search first
  const dimension = depth % config.dimensions;
  const queryValue = queryPoint[dimension];
  const nodeValue = node.point[dimension];

  let firstSubtree: KdNode | null;
  let secondSubtree: KdNode | null;

  if (queryValue < nodeValue) {
    firstSubtree = node.left;
    secondSubtree = node.right;
  } else {
    firstSubtree = node.right;
    secondSubtree = node.left;
  }

  // Search first subtree
  const firstResult = nearestNeighborRecursive(firstSubtree, queryPoint, depth + 1, config, bestPoint, bestDistance);

  bestPoint = firstResult.point;
  bestDistance = firstResult.distance;

  // Check if we need to search second subtree
  const distanceToSplit = Math.abs(queryValue - nodeValue);
  if (distanceToSplit < bestDistance) {
    const secondResult = nearestNeighborRecursive(
      secondSubtree,
      queryPoint,
      depth + 1,
      config,
      bestPoint,
      bestDistance
    );

    if (secondResult.distance < bestDistance) {
      bestPoint = secondResult.point;
      bestDistance = secondResult.distance;
    }
  }

  return { point: bestPoint, distance: bestDistance };
}

/**
 * Recursively find k nearest neighbors
 *
 * @param node Current node
 * @param queryPoint Query point
 * @param depth Current depth
 * @param config KD-Tree configuration
 * @param neighbors Array to store neighbors
 * @param k Number of neighbors to find
 * @param maxDistance Maximum distance
 * @example
 */
function kNearestNeighborsRecursive(
  node: KdNode | null,
  queryPoint: Point,
  depth: number,
  config: Required<KdTreeConfig>,
  neighbors: Array<{ point: Point; distance: number }>,
  k: number,
  maxDistance: number
): void {
  if (!node) {
    return;
  }

  // Calculate distance to current node
  const currentDistance = calculateDistance(queryPoint, node.point);

  // Add to neighbors if within max distance
  if (currentDistance <= maxDistance) {
    neighbors.push({ point: { ...node.point }, distance: currentDistance });

    // Keep only k nearest neighbors
    if (neighbors.length > k) {
      neighbors.sort((a, b) => a.distance - b.distance);
      neighbors.splice(k);
    }
  }

  // Determine which subtree to search first
  const dimension = depth % config.dimensions;
  const queryValue = queryPoint[dimension];
  const nodeValue = node.point[dimension];

  let firstSubtree: KdNode | null;
  let secondSubtree: KdNode | null;

  if (queryValue < nodeValue) {
    firstSubtree = node.left;
    secondSubtree = node.right;
  } else {
    firstSubtree = node.right;
    secondSubtree = node.left;
  }

  // Search first subtree
  kNearestNeighborsRecursive(firstSubtree, queryPoint, depth + 1, config, neighbors, k, maxDistance);

  // Check if we need to search second subtree
  const distanceToSplit = Math.abs(queryValue - nodeValue);
  const maxNeighborDistance = neighbors.length > 0 ? Math.max(...neighbors.map(n => n.distance)) : Infinity;

  if (distanceToSplit < maxNeighborDistance || neighbors.length < k) {
    kNearestNeighborsRecursive(secondSubtree, queryPoint, depth + 1, config, neighbors, k, maxDistance);
  }
}

/**
 * Calculate distance between two points
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Euclidean distance
 * @example
 */
function calculateDistance(p1: Point, p2: Point): number {
  const keys = Object.keys(p1);
  let sum = 0;

  for (const key of keys) {
    const diff = p1[key] - p2[key];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Check if a point is valid
 *
 * @param point Point to validate
 * @param dimensions Expected number of dimensions
 * @returns True if point is valid
 * @example
 */
function isValidPoint(point: Point, dimensions: number): boolean {
  if (!point || typeof point !== "object") {
    return false;
  }

  const keys = Object.keys(point);
  if (keys.length !== dimensions) {
    return false;
  }

  for (const key of keys) {
    const value = point[key];
    if (typeof value !== "number" || !isFinite(value)) {
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
 * @example
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
 * @example
 */
function emitEvent(eventHandlers: KdTreeEventHandler[], type: KdTreeEventType, data: any): void {
  for (const handler of eventHandlers) {
    try {
      handler({ type, data, timestamp: Date.now() });
    } catch (error) {
      // Ignore handler errors
    }
  }
}
