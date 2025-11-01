/**
 * Interval Tree Insertion Operations
 *
 * Handles interval insertion and AVL tree balancing
 * for the Interval Tree data structure.
 *
 * @module algorithms/data-structures/interval-tree
 */

import type {
  Interval,
  IntervalTreeNode,
  IntervalTreeConfig,
  IntervalTreeStats,
  IntervalTreeEventHandler,
  BatchOperationResult,
} from "./interval-tree-types";
import { IntervalTreeEventType } from "./interval-tree-types";

/**
 * Insert an interval into the tree
 *
 * @param root Current root node
 * @param interval Interval to insert
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and success status
 */
export function insertInterval(
  root: IntervalTreeNode | null,
  interval: Interval,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): { root: IntervalTreeNode | null; success: boolean } {
  const startTime = performance.now();

  try {
    // Validate interval
    if (!isValidInterval(interval)) {
      return { root, success: false };
    }

    // Insert recursively
    const newRoot = insertRecursive(root, interval, config, stats);

    // Update statistics
    stats.totalIntervals++;
    stats.totalInserts++;
    stats.totalNodes = countNodes(newRoot);
    stats.height = getHeight(newRoot);
    stats.averageIntervalLength = calculateAverageIntervalLength(newRoot);

    // Emit event
    emitEvent(eventHandlers, IntervalTreeEventType.INTERVAL_INSERTED, {
      interval,
      executionTime: performance.now() - startTime,
    });

    return { root: newRoot, success: true };
  } catch (error) {
    return { root, success: false };
  }
}

/**
 * Insert multiple intervals in batch
 *
 * @param root Current root node
 * @param intervals Array of intervals to insert
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and batch result
 */
export function insertBatch(
  root: IntervalTreeNode | null,
  intervals: Interval[],
  config: IntervalTreeConfig,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): { root: IntervalTreeNode | null; result: BatchOperationResult } {
  const startTime = performance.now();
  let currentRoot = root;
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  const results: boolean[] = [];

  try {
    for (const interval of intervals) {
      const insertResult = insertInterval(
        currentRoot,
        interval,
        config,
        stats,
        eventHandlers
      );

      if (insertResult.success) {
        currentRoot = insertResult.root;
        successCount++;
        results.push(true);
      } else {
        errorCount++;
        results.push(false);
        errors.push(`Failed to insert interval [${interval.start}, ${interval.end}]`);
      }
    }

    return {
      root: currentRoot,
      result: {
        success: errorCount === 0,
        successful: successCount,
        failed: errorCount,
        errors: errors,
        executionTime: performance.now() - startTime,
        results: results,
        metadata: {
          totalIntervals: intervals.length,
          successCount,
          errorCount,
          errors: errors.length > 0 ? errors : undefined,
        },
      },
    };
  } catch (error) {
    return {
      root: currentRoot,
      result: {
        success: false,
        successful: successCount,
        failed: errorCount,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        executionTime: performance.now() - startTime,
        results: [],
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          totalIntervals: intervals.length,
          successCount,
          errorCount,
        },
      },
    };
  }
}

/**
 * Recursively insert an interval into the tree
 *
 * @param node Current node
 * @param interval Interval to insert
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @returns New node
 */
function insertRecursive(
  node: IntervalTreeNode | null,
  interval: Interval,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats
): IntervalTreeNode {
  if (!node) {
    return createNode(interval);
  }

  // Insert based on start point
  if (interval.start < node.interval.start) {
    node.left = insertRecursive(node.left, interval, config, stats);
  } else if (interval.start > node.interval.start) {
    node.right = insertRecursive(node.right, interval, config, stats);
  } else {
    // Handle duplicate start points
    if (interval.end !== node.interval.end) {
      node.right = insertRecursive(node.right, interval, config, stats);
    }
    // If exact duplicate, do nothing
  }

  // Update node properties
  updateNode(node);

  // Balance the tree
  return balanceNode(node);
}

/**
 * Create a new interval tree node
 *
 * @param interval Interval to store
 * @returns New node
 */
function createNode(interval: Interval): IntervalTreeNode {
  return {
    interval: { ...interval },
    max: interval.end,
    maxEnd: interval.end,
    height: 1,
    left: null,
    right: null,
    size: 1,
  };
}

/**
 * Update node properties after insertion
 *
 * @param node Node to update
 */
function updateNode(node: IntervalTreeNode): void {
  // Update height
  node.height = Math.max(getNodeHeight(node.left), getNodeHeight(node.right)) + 1;

  // Update max end point
  node.maxEnd = node.interval.end;
  if (node.left) {
    node.maxEnd = Math.max(node.maxEnd, node.left.maxEnd);
  }
  if (node.right) {
    node.maxEnd = Math.max(node.maxEnd, node.right.maxEnd);
  }
}

/**
 * Balance a node using AVL rotations
 *
 * @param node Node to balance
 * @returns Balanced node
 */
function balanceNode(node: IntervalTreeNode): IntervalTreeNode {
  const balance = getBalanceFactor(node);

  // Left heavy
  if (balance > 1) {
    if (getBalanceFactor(node.left!) < 0) {
      // Left-Right case
      node.left = leftRotate(node.left!);
    }
    // Left-Left case
    return rightRotate(node);
  }

  // Right heavy
  if (balance < -1) {
    if (getBalanceFactor(node.right!) > 0) {
      // Right-Left case
      node.right = rightRotate(node.right!);
    }
    // Right-Right case
    return leftRotate(node);
  }

  return node;
}

/**
 * Right rotation for AVL balancing
 *
 * @param y Node to rotate
 * @returns New root of subtree
 */
function rightRotate(y: IntervalTreeNode): IntervalTreeNode {
  const x = y.left!;
  const T2 = x.right;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update heights
  updateNode(y);
  updateNode(x);

  return x;
}

/**
 * Left rotation for AVL balancing
 *
 * @param x Node to rotate
 * @returns New root of subtree
 */
function leftRotate(x: IntervalTreeNode): IntervalTreeNode {
  const y = x.right!;
  const T2 = y.left;

  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update heights
  updateNode(x);
  updateNode(y);

  return y;
}

/**
 * Get height of a node
 *
 * @param node Node to get height for
 * @returns Height of node
 */
function getNodeHeight(node: IntervalTreeNode | null): number {
  return node ? node.height : 0;
}

/**
 * Get balance factor of a node
 *
 * @param node Node to get balance factor for
 * @returns Balance factor
 */
function getBalanceFactor(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return getNodeHeight(node.left) - getNodeHeight(node.right);
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
 * Count total nodes in tree
 *
 * @param node Root node
 * @returns Number of nodes
 */
function countNodes(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/**
 * Get height of tree
 *
 * @param node Root node
 * @returns Height of tree
 */
function getHeight(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return Math.max(getHeight(node.left), getHeight(node.right)) + 1;
}

/**
 * Calculate average interval length
 *
 * @param node Root node
 * @returns Average interval length
 */
function calculateAverageIntervalLength(node: IntervalTreeNode | null): number {
  if (!node) return 0;

  const intervals: Interval[] = [];
  collectIntervals(node, intervals);

  if (intervals.length === 0) return 0;

  const totalLength = intervals.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
  return totalLength / intervals.length;
}

/**
 * Collect all intervals from tree
 *
 * @param node Current node
 * @param intervals Array to store intervals
 */
function collectIntervals(node: IntervalTreeNode | null, intervals: Interval[]): void {
  if (!node) return;

  intervals.push({ ...node.interval });
  collectIntervals(node.left, intervals);
  collectIntervals(node.right, intervals);
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

