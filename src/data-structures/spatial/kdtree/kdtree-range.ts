/**
 * KD-Tree Range Query Operations
 *
 * Handles range queries and spatial searches
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */

import type {
  Point,
  BoundingBox,
  KdNode,
  KdTreeConfig,
  KdTreeStats,
  RangeQueryResult,
  RangeQueryOptions,
  KdTreeEventHandler,
} from "./kdtree-types";
import { KdTreeEventType } from "./kdtree-types";

/**
 * Perform range query on KD-Tree
 *
 * @param root Root node
 * @param bounds Bounding box for query
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Query options
 * @returns Range query result
 * @example
 */
export function performRangeQuery(
  root: KdNode | null,
  bounds: BoundingBox,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[],
  options: Partial<RangeQueryOptions> = {}
): RangeQueryResult {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        success: false,
        points: [],
        count: 0,
        queryBox: bounds,
        executionTime: performance.now() - startTime,
        metadata: { error: "Tree is empty" },
      };
    }

    // Validate bounding box
    if (!isValidBoundingBox(bounds, config.dimensions)) {
      return {
        success: false,
        points: [],
        count: 0,
        queryBox: bounds,
        executionTime: performance.now() - startTime,
      };
    }

    // Perform range query
    const points: Point[] = [];
    rangeQueryRecursive(root, bounds, 0, config, points);

    // Apply filters if specified
    let filteredPoints = points;
    if (options.filter) {
      filteredPoints = points.filter(options.filter);
    }

    // Apply maxResults limit if specified
    if (options.maxResults && options.maxResults > 0) {
      filteredPoints = filteredPoints.slice(0, options.maxResults);
    }

    // Update statistics
    stats.rangeQueries++;
    const executionTime = performance.now() - startTime;
    stats.averageRangeQueryTime = updateAverageTime(stats.averageRangeQueryTime, executionTime, stats.rangeQueries);

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_RANGE_QUERY, {
      bounds,
      pointCount: filteredPoints.length,
      executionTime,
    });

    return {
      success: true,
      points: filteredPoints,
      count: filteredPoints.length,
      queryBox: bounds,
      executionTime,
      metadata: { bounds, pointCount: filteredPoints.length },
    };
  } catch (error) {
    return {
      success: false,
      points: [],
      count: 0,
      queryBox: bounds,
      executionTime: performance.now() - startTime,
    };
  }
}

/**
 * Find points within a radius of a center point
 *
 * @param root Root node
 * @param center Center point
 * @param radius Search radius
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Query options
 * @returns Range query result
 * @example
 */
export function findPointsInRadius(
  root: KdNode | null,
  center: Point,
  radius: number,
  config: Required<KdTreeConfig>,
  stats: KdTreeStats,
  eventHandlers: KdTreeEventHandler[],
  options: Partial<RangeQueryOptions> = {}
): RangeQueryResult {
  const startTime = performance.now();

  try {
    if (!root) {
      const radiusBounds: BoundingBox = {
        min: Array(config.dimensions).fill(-Infinity),
        max: Array(config.dimensions).fill(Infinity),
      };
      return {
        success: false,
        points: [],
        count: 0,
        queryBox: radiusBounds,
        executionTime: performance.now() - startTime,
        metadata: { error: "Tree is empty" },
      };
    }

    // Validate center point
    if (!isValidPoint(center, config.dimensions)) {
      const radiusBounds: BoundingBox = {
        min: Array(config.dimensions).fill(-Infinity),
        max: Array(config.dimensions).fill(Infinity),
      };
      return {
        success: false,
        points: [],
        count: 0,
        queryBox: radiusBounds,
        executionTime: performance.now() - startTime,
        metadata: { error: "Invalid center point dimensions" },
      };
    }

    // Validate radius
    if (radius < 0 || !isFinite(radius)) {
      return {
        success: false,
        points: [],
        count: 0,
        queryBox: createBoundingBoxFromRadius(center, radius, config.dimensions),
        executionTime: performance.now() - startTime,
      };
    }

    // Create bounding box from center and radius
    const bounds = createBoundingBoxFromRadius(center, radius, config.dimensions);

    // Perform range query
    const points: Point[] = [];
    rangeQueryRecursive(root, bounds, 0, config, points);

    // Filter by actual distance (not just bounding box)
    const filteredPoints = points.filter(point => {
      const distance = calculateDistance(center, point);
      return distance <= radius;
    });

    // Apply additional filters if specified
    let finalPoints = filteredPoints;
    if (options.filter) {
      finalPoints = filteredPoints.filter(options.filter);
    }

    // Apply limit if specified
    if (options.maxResults && options.maxResults > 0) {
      finalPoints = finalPoints.slice(0, options.maxResults);
    }

    // Update statistics
    stats.rangeQueries++;
    const executionTime = performance.now() - startTime;
    stats.averageRangeQueryTime = updateAverageTime(stats.averageRangeQueryTime, executionTime, stats.rangeQueries);

    // Emit event
    emitEvent(eventHandlers, KdTreeEventType.KD_TREE_RANGE_QUERY, {
      center,
      radius,
      pointCount: finalPoints.length,
      executionTime,
    });

    return {
      success: true,
      points: finalPoints,
      count: finalPoints.length,
      queryBox: bounds,
      executionTime,
      metadata: { center, radius, pointCount: finalPoints.length },
    };
  } catch (error) {
    return {
      success: false,
      points: [],
      count: 0,
      queryBox: createBoundingBoxFromRadius(center, radius, config.dimensions),
      executionTime: performance.now() - startTime,
    };
  }
}

/**
 * Recursively perform range query
 *
 * @param node Current node
 * @param bounds Bounding box
 * @param depth Current depth
 * @param config KD-Tree configuration
 * @param points Array to store points
 * @example
 */
function rangeQueryRecursive(
  node: KdNode | null,
  bounds: BoundingBox,
  depth: number,
  config: Required<KdTreeConfig>,
  points: Point[]
): void {
  if (!node) {
    return;
  }

  // Check if current node is within bounds
  if (isPointInBounds(node.point, bounds)) {
    points.push({ ...node.point });
  }

  // Determine which subtrees to search
  const dimension = depth % config.dimensions;
  const nodeValue = node.point[dimension];
  const minValue = bounds.min[dimension];
  const maxValue = bounds.max[dimension];

  // Search left subtree if it might contain points in range
  if (nodeValue >= minValue) {
    rangeQueryRecursive(node.left, bounds, depth + 1, config, points);
  }

  // Search right subtree if it might contain points in range
  if (nodeValue <= maxValue) {
    rangeQueryRecursive(node.right, bounds, depth + 1, config, points);
  }
}

/**
 * Check if a point is within bounding box
 *
 * @param point Point to check
 * @param bounds Bounding box
 * @param dimensions
 * @returns True if point is within bounds
 * @example
 */
function isPointInBounds(point: Point, bounds: BoundingBox, dimensions?: number): boolean {
  const dim = dimensions ?? Math.max(Object.keys(point).length, bounds.min.length, bounds.max.length);
  for (let i = 0; i < dim; i++) {
    const value = (point as any)[i];
    const minValue = bounds.min[i];
    const maxValue = bounds.max[i];
    if (value < minValue || value > maxValue) {
      return false;
    }
  }
  return true;
}

/**
 * Create bounding box from center point and radius
 *
 * @param center Center point
 * @param radius Radius
 * @param dimensions Number of dimensions
 * @returns Bounding box
 * @example
 */
function createBoundingBoxFromRadius(center: Point, radius: number, dimensions: number): BoundingBox {
  const min: number[] = [];
  const max: number[] = [];

  for (let i = 0; i < dimensions; i++) {
    const val = (center as any)[i];
    min.push(val - radius);
    max.push(val + radius);
  }

  return { min, max };
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
 * Check if bounding box is valid
 *
 * @param bounds Bounding box to validate
 * @param dimensions Expected number of dimensions
 * @returns True if bounding box is valid
 * @example
 */
function isValidBoundingBox(bounds: BoundingBox, dimensions: number): boolean {
  if (!bounds || !bounds.min || !bounds.max) {
    return false;
  }
  if (bounds.min.length !== dimensions || bounds.max.length !== dimensions) {
    return false;
  }
  for (let i = 0; i < dimensions; i++) {
    const minValue = bounds.min[i];
    const maxValue = bounds.max[i];
    if (
      typeof minValue !== "number" ||
      typeof maxValue !== "number" ||
      !isFinite(minValue) ||
      !isFinite(maxValue) ||
      minValue > maxValue
    ) {
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
