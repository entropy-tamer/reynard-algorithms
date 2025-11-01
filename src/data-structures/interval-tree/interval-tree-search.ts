/**
 * Interval Tree Search Operations
 *
 * Handles interval search, overlap detection, and containment queries
 * for the Interval Tree data structure.
 *
 * @module algorithms/data-structures/interval-tree
 */

import type {
  Interval,
  IntervalTreeNode,
  IntervalTreeConfig,
  IntervalTreeStats,
  IntervalSearchResult,
  IntervalOverlapResult,
  IntervalTreeEventHandler,
} from "./interval-tree-types";
import { IntervalTreeEventType } from "./interval-tree-types";

/**
 * Search for intervals that overlap with a query interval
 *
 * @param root Root node
 * @param queryInterval Query interval
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 */
export function searchOverlapping(
  root: IntervalTreeNode | null,
  queryInterval: Interval,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): IntervalSearchResult {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        success: true,
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { queryInterval },
      };
    }

    // Validate query interval
    if (!isValidInterval(queryInterval)) {
      return {
        success: false,
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: "Invalid query interval" },
      };
    }

    // Search recursively
    const intervals: Interval[] = [];
    searchOverlappingRecursive(root, queryInterval, intervals);

    // Update statistics
    stats.totalSearches++;
    const executionTime = performance.now() - startTime;
    stats.averageSearchTime = updateAverageTime(stats.averageSearchTime, executionTime, stats.totalSearches);

    // Emit event
    emitEvent(eventHandlers, IntervalTreeEventType.SEARCH_PERFORMED, {
      queryInterval,
      resultCount: intervals.length,
      executionTime,
    });

    return {
      success: true,
      intervals,
      count: intervals.length,
      executionTime,
      nodesVisited: 0,
      metadata: { queryInterval },
    };
  } catch (error) {
    return {
      success: false,
      intervals: [],
      count: 0,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

/**
 * Search for intervals that contain a point
 *
 * @param root Root node
 * @param point Query point
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 */
export function searchContaining(
  root: IntervalTreeNode | null,
  point: number,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): IntervalSearchResult {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        success: true,
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        metadata: { point },
        nodesVisited: 0,
      };
    }

    // Validate point
    if (!isFinite(point)) {
      return {
        success: false,
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        metadata: { error: "Invalid point" },
        nodesVisited: 0,
      };
    }

    // Search recursively
    const intervals: Interval[] = [];
    searchContainingRecursive(root, point, intervals);

    // Update statistics
    stats.totalSearches++;
    const executionTime = performance.now() - startTime;
    stats.averageSearchTime = updateAverageTime(stats.averageSearchTime, executionTime, stats.totalSearches);

    // Emit event
    emitEvent(eventHandlers, IntervalTreeEventType.SEARCH_PERFORMED, {
      point,
      resultCount: intervals.length,
      executionTime,
    });

    return {
      success: true,
      intervals,
      count: intervals.length,
      executionTime,
      metadata: { point },
      nodesVisited: 0,
    };
  } catch (error) {
    return {
      success: false,
      intervals: [],
      count: 0,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

/**
 * Search for intervals that are contained within a query interval
 *
 * @param root Root node
 * @param queryInterval Query interval
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 */
export function searchContainedIn(
  root: IntervalTreeNode | null,
  queryInterval: Interval,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): IntervalSearchResult {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        success: true,
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { queryInterval },
      };
    }

    // Validate query interval
    if (!isValidInterval(queryInterval)) {
      return {
        success: false,
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: "Invalid query interval" },
      };
    }

    // Search recursively
    const intervals: Interval[] = [];
    searchContainedInRecursive(root, queryInterval, intervals);

    // Update statistics
    stats.totalSearches++;
    const executionTime = performance.now() - startTime;
    stats.averageSearchTime = updateAverageTime(stats.averageSearchTime, executionTime, stats.totalSearches);

    // Emit event
    emitEvent(eventHandlers, IntervalTreeEventType.SEARCH_PERFORMED, {
      queryInterval,
      resultCount: intervals.length,
      executionTime,
    });

    return {
      success: true,
      intervals,
      count: intervals.length,
      executionTime,
      nodesVisited: 0,
      metadata: { queryInterval },
    };
  } catch (error) {
    return {
      success: false,
      intervals: [],
      count: 0,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

/**
 * Check if an interval overlaps with any interval in the tree
 *
 * @param root Root node
 * @param interval Interval to check
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Overlap result
 */
export function checkOverlap(
  root: IntervalTreeNode | null,
  interval: Interval,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): IntervalOverlapResult {
  const startTime = performance.now();

  try {
    if (!root) {
      return {
        overlaps: false,
        overlappingInterval: undefined,
        executionTime: performance.now() - startTime,
        metadata: { interval },
      };
    }

    // Validate interval
    if (!isValidInterval(interval)) {
      return {
        overlaps: false,
        overlappingInterval: undefined,
        executionTime: performance.now() - startTime,
        metadata: { error: "Invalid interval" },
      };
    }

    // Find first overlap
    const overlappingInterval = findFirstOverlap(root, interval);

    // Update statistics
    stats.totalSearches++;
    const executionTime = performance.now() - startTime;
    stats.averageSearchTime = updateAverageTime(stats.averageSearchTime, executionTime, stats.totalSearches);

    // Emit event
    emitEvent(eventHandlers, IntervalTreeEventType.OVERLAP_CHECKED, {
      interval,
        overlaps: overlappingInterval !== undefined,
      executionTime,
    });

    return {
        overlaps: overlappingInterval !== undefined,
      overlappingInterval,
      executionTime,
      metadata: { interval },
    };
  } catch (error) {
    return {
      overlaps: false,
      overlappingInterval: undefined,
      executionTime: performance.now() - startTime,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

/**
 * Recursively search for overlapping intervals
 *
 * @param node Current node
 * @param queryInterval Query interval
 * @param intervals Array to store results
 */
function searchOverlappingRecursive(
  node: IntervalTreeNode | null,
  queryInterval: Interval,
  intervals: Interval[]
): void {
  if (!node) return;

  // Check if current interval overlaps
  if (intervalsOverlap(node.interval, queryInterval)) {
    intervals.push({ ...node.interval });
  }

  // Search left subtree if it might contain overlapping intervals
  if (node.left && node.left.maxEnd >= queryInterval.start) {
    searchOverlappingRecursive(node.left, queryInterval, intervals);
  }

  // Search right subtree if it might contain overlapping intervals
  if (node.right && node.interval.start <= queryInterval.end) {
    searchOverlappingRecursive(node.right, queryInterval, intervals);
  }
}

/**
 * Recursively search for intervals containing a point
 *
 * @param node Current node
 * @param point Query point
 * @param intervals Array to store results
 */
function searchContainingRecursive(
  node: IntervalTreeNode | null,
  point: number,
  intervals: Interval[]
): void {
  if (!node) return;

  // Check if current interval contains the point
  if (node.interval.start <= point && point <= node.interval.end) {
    intervals.push({ ...node.interval });
  }

  // Search left subtree if it might contain intervals with the point
  if (node.left && node.left.maxEnd >= point) {
    searchContainingRecursive(node.left, point, intervals);
  }

  // Search right subtree if it might contain intervals with the point
  if (node.right && node.interval.start <= point) {
    searchContainingRecursive(node.right, point, intervals);
  }
}

/**
 * Recursively search for intervals contained within query interval
 *
 * @param node Current node
 * @param queryInterval Query interval
 * @param intervals Array to store results
 */
function searchContainedInRecursive(
  node: IntervalTreeNode | null,
  queryInterval: Interval,
  intervals: Interval[]
): void {
  if (!node) return;

  // Check if current interval is contained within query interval
  if (queryInterval.start <= node.interval.start && node.interval.end <= queryInterval.end) {
    intervals.push({ ...node.interval });
  }

  // Search left subtree if it might contain contained intervals
  if (node.left && node.left.maxEnd >= queryInterval.start) {
    searchContainedInRecursive(node.left, queryInterval, intervals);
  }

  // Search right subtree if it might contain contained intervals
  if (node.right && node.interval.start <= queryInterval.end) {
    searchContainedInRecursive(node.right, queryInterval, intervals);
  }
}

/**
 * Find first overlapping interval
 *
 * @param node Current node
 * @param queryInterval Query interval
 * @returns First overlapping interval or null
 */
function findFirstOverlap(node: IntervalTreeNode | null, queryInterval: Interval): Interval | undefined {
  if (!node) return undefined;

  // Check if current interval overlaps
  if (intervalsOverlap(node.interval, queryInterval)) {
    return { ...node.interval };
  }

  // Search left subtree first
  if (node.left && node.left.maxEnd >= queryInterval.start) {
    const leftResult = findFirstOverlap(node.left, queryInterval);
    if (leftResult) return leftResult;
  }

  // Search right subtree
  if (node.right && node.interval.start <= queryInterval.end) {
    return findFirstOverlap(node.right, queryInterval);
  }

  return undefined;
}

/**
 * Check if two intervals overlap
 *
 * @param interval1 First interval
 * @param interval2 Second interval
 * @returns True if intervals overlap
 */
function intervalsOverlap(interval1: Interval, interval2: Interval): boolean {
  return interval1.start <= interval2.end && interval2.start <= interval1.end;
}

/**
 * Check if interval is valid
 *
 * @param interval Interval to validate
 * @returns True if interval is valid
 */
function isValidInterval(interval: Interval): boolean {
  return (
    typeof interval.start === 'number' &&
    typeof interval.end === 'number' &&
    interval.start <= interval.end &&
    isFinite(interval.start) &&
    isFinite(interval.end)
  );
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
  eventHandlers: IntervalTreeEventHandler[],
  type: IntervalTreeEventType,
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

